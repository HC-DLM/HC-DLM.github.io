// Scripted illustration of the HC-DLM sampler on one sentence. Not model output.
// Each step has two phases, in sync with the diagram: (1) read out: the tokens k_t are read out of
// the latent x_t; at level t a fraction t/T of positions is still noise (hatched). (2) feed back:
// k_t conditions the latent update, and the latent's hatching thins to level t-1.
(function () {
  const T = 4;
  // Read-out per step, t = 4 (pure noise) down to 0. Hand-written so revisions are visible:
  // "kettles" -> "instruments", "band" -> "orchestra", "ended" -> "began", "morning" -> "evening".
  const readouts = [
    ["Yet", "window", "sold", "green", "kettles", "under", "seven", "quiet", "rivers", "ago", "!"],
    ["The", "band", "tuned", "its", "kettles", "before", "the", "quiet", "concert", "ago", "."],
    ["The", "band", "tuned", "its", "instruments", "before", "the", "morning", "concert", "ended", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "morning", "concert", "began", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "evening", "concert", "began", "."],
  ];
  const L = readouts[0].length;
  const vocab = ["river", "seven", "kettle", "under", "blue", "paper", "sold", "quiet", "window", "ago", "green", "bridge", "slowly", "coin", "yet", "harbor"];
  // Positions kept out of the noise on purpose so each revision is visible when it happens (step index -> positions).
  const showRevision = { 2: [4], 3: [1, 9] };
  // Playback speed. Every timing below and every animation in style.css (via --speed) divides by it.
  const SPEED = 2.5;
  const readMs = 1800 / SPEED;   // read-out shown alone before the feed-back starts
  const stepMs = 4000 / SPEED;
  const holdMs = 3500 / SPEED;   // pause on the finished sentence before restarting
  document.getElementById("demo").style.setProperty("--speed", SPEED);

  // Deterministic pseudo-random stream so every replay is identical.
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // k_t for every level: the read-out words, with a fraction t/T of positions replaced by random tokens.
  const K = readouts.map((words, idx) => {
    const t = T - idx;
    const r = rng(31 + 7 * idx);
    const forced = showRevision[idx] || [];
    const order = [...Array(L).keys()].filter((i) => !forced.includes(i)).sort(() => r() - 0.5);
    const nKeep = idx === 0 ? 0 : Math.max(forced.length, Math.round((1 - t / T) * L));
    const keep = new Set([...forced, ...order.slice(0, nKeep - forced.length)]);
    return words.map((w, i) => {
      if (!keep.has(i)) {
        let x; do { x = vocab[Math.floor(r() * vocab.length)]; } while (x.toLowerCase() === w.toLowerCase());
        return { w: idx === 0 ? w : x, cls: "noised" };
      }
      return { w, cls: idx >= 2 && readouts[idx - 1][i] !== w ? "settled changed" : "settled" };
    });
  });
  // Fixed slot widths so the row does not jump when words change.
  const slotCh = [...Array(L).keys()].map((i) => Math.max(...K.map((k) => k[i].w.length)));

  const latentEl = document.getElementById("demo-latent");
  const tokensEl = document.getElementById("demo-tokens");
  const tOut = document.getElementById("demo-t");
  const range = document.getElementById("demo-range");
  const playBtn = document.getElementById("demo-play");
  const restartBtn = document.getElementById("demo-restart");

  // Latent box: diagonal hatching like the diagram, evenly spaced at every level.
  // Line spacing (px) per level t; it widens clearly from step to step. Levels cross-fade.
  const NS = "http://www.w3.org/2000/svg";
  const latentSvg = latentEl.querySelector("svg");
  const gapAt = { 4: 6, 3: 11, 2: 19, 1: 34 };
  let level = 1, layer = null;
  function hatchLayer(s) {
    const g = document.createElementNS(NS, "g");
    if (s <= 0) return g;
    const w = latentEl.clientWidth, h = latentEl.clientHeight, gap = gapAt[Math.round(s * T)];
    for (let x = -h; x < w; x += gap) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", x.toFixed(1)); l.setAttribute("y1", h);
      l.setAttribute("x2", (x + h).toFixed(1)); l.setAttribute("y2", 0);
      g.append(l);
    }
    return g;
  }
  function setLatent(s, instant) {
    level = s;
    latentEl.classList.toggle("instant", !!instant);
    latentSvg.setAttribute("viewBox", `0 0 ${latentEl.clientWidth} ${latentEl.clientHeight}`);
    const next = hatchLayer(s);
    if (instant || !layer) {
      latentSvg.replaceChildren(next);
    } else {
      const old = layer;
      next.style.opacity = 0;
      latentSvg.append(next);
      void next.getBoundingClientRect();
      next.style.opacity = 0.75; old.style.opacity = 0;
      setTimeout(() => old.remove(), 1000 / SPEED);
    }
    next.style.opacity = 0.75;
    layer = next;
  }
  function buildLatent() { setLatent(level, true); }

  function renderTokens(t) {
    tokensEl.replaceChildren(...K[T - t].map((k, i) => {
      const s = document.createElement("span");
      s.className = "tok " + k.cls;
      s.style.minWidth = `calc(${slotCh[i]}ch + 1.2rem)`;
      s.textContent = k.w;
      return s;
    }));
  }

  let t = T;
  let timers = [];
  let playing = true;

  const diagram = document.querySelector(".chain");
  const live = diagram.querySelector(".live");

  function showRead(instant) {
    diagram.dataset.phase = t === 0 ? "final" : "step";
    live.classList.remove("go-read", "go-feed");
    void live.getBoundingClientRect();  // restart the one-shot animations
    live.classList.add("go-read");
    setLatent(t / T, instant);
    renderTokens(t);
    tOut.value = (t / T).toFixed(2);
    range.value = String(t);
  }
  function showFeed() {
    if (t === 0) return;
    live.classList.add("go-feed");
    setLatent((t - 1) / T, false);
  }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function schedule() {
    clear();
    if (!playing) return;
    if (t > 0) timers.push(setTimeout(showFeed, readMs));
    timers.push(setTimeout(() => { t = t === 0 ? T : t - 1; showRead(t === T); schedule(); }, t === 0 ? holdMs : stepMs));
  }
  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "Pause" : "Play";
    playBtn.setAttribute("aria-label", playBtn.textContent);
    if (playing) { showRead(true); schedule(); } else clear();
  });
  restartBtn.addEventListener("click", () => { t = T; showRead(true); schedule(); });
  range.addEventListener("input", () => { t = Number(range.value); showRead(true); schedule(); });
  window.addEventListener("resize", buildLatent);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    playing = false; playBtn.textContent = "Play"; t = 2;
  }
  buildLatent();
  showRead(true);
  schedule();
})();
