// Scripted illustration of the HC-DLM sampler on one sentence. Not model output.
// Each step: the latent strip loses noise, the full sentence is read out of it, and the
// read-out is re-noised through the uniform forward kernel to form the scaffold for the next step.
(function () {
  const T = 8;
  const target = ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "evening", "concert", "began", "."];
  // Read-out per step, t = 8 (pure noise) down to 0. Hand-written so revisions are visible:
  // "band" -> "orchestra" at t = 4, "morning" -> "evening" at t = 2.
  const readouts = [
    ["Yet", "window", "sold", "green", "kettles", "under", "seven", "quiet", "rivers", "ago", "!"],
    ["The", "window", "tuned", "green", "kettles", "before", "seven", "quiet", "rivers", "ago", "."],
    ["The", "band", "tuned", "its", "kettles", "before", "the", "quiet", "concert", "ago", "."],
    ["The", "band", "tuned", "its", "instruments", "before", "the", "morning", "concert", "ended", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "morning", "concert", "ended", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "morning", "concert", "began", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "evening", "concert", "began", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "evening", "concert", "began", "."],
    ["The", "orchestra", "tuned", "its", "instruments", "before", "the", "evening", "concert", "began", "."],
  ];
  const vocab = ["river", "seven", "kettle", "under", "blue", "paper", "sold", "quiet", "window", "ago", "green", "bridge", "slowly", "coin", "yet", "harbor"];
  const stepMs = 950;
  const holdMs = 2200;
  const cells = 40;

  // Deterministic pseudo-random stream so every replay is identical.
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const latentEl = document.getElementById("demo-latent");
  const tokensEl = document.getElementById("demo-tokens");
  const scaffoldEl = document.getElementById("demo-scaffold");
  const tOut = document.getElementById("demo-t");
  const range = document.getElementById("demo-range");
  const playBtn = document.getElementById("demo-play");
  const restartBtn = document.getElementById("demo-restart");

  // Latent strip: a fixed hue ramp per cell, mixed with per-step noise.
  const latentCells = Array.from({ length: cells }, (_, i) => {
    const c = document.createElement("i");
    c.style.setProperty("--hue", 205 + (i / cells) * 18);
    latentEl.append(c);
    return c;
  });
  const settleStep = target.map((w, i) => {
    for (let k = readouts.length - 1; k >= 0; k--) if (readouts[k][i] !== w) return T - k - 1;
    return T;
  });

  function renderLatent(t) {
    const noise = t / T;
    const r = rng(1000 + t);
    latentCells.forEach((c) => {
      const jitterH = (r() - 0.5) * 240 * noise;
      const light = 78 - 22 * (1 - noise) + (r() - 0.5) * 30 * noise;
      c.style.setProperty("--jh", jitterH);
      c.style.setProperty("--l", light + "%");
      c.style.setProperty("--noise", noise);
    });
  }

  function chip(word, cls) {
    const s = document.createElement("span");
    s.className = "tok " + cls;
    s.textContent = word;
    return s;
  }

  function renderTokens(t) {
    const idx = T - t;
    const cur = readouts[idx];
    const prev = idx > 0 ? readouts[idx - 1] : null;
    tokensEl.replaceChildren();
    cur.forEach((w, i) => {
      let cls = w === target[i] && t <= settleStep[i] ? "settled" : "tentative";
      if (prev && prev[i] !== w) cls += " changed";
      tokensEl.append(chip(w, cls));
    });
  }

  function renderScaffold(t) {
    scaffoldEl.replaceChildren();
    if (t === 0) {
      scaffoldEl.append(chip("k̂₀ is returned as the sample", "final"));
      return;
    }
    const cur = readouts[T - t];
    const keep = 1 - (t - 1) / T;  // alpha_{t-1} under a linear schedule
    const r = rng(77 + t);
    cur.forEach((w) => {
      if (r() < keep) scaffoldEl.append(chip(w, "kept"));
      else scaffoldEl.append(chip(vocab[Math.floor(r() * vocab.length)], "noised"));
    });
  }

  let t = T;
  let timer = null;
  let playing = true;

  const diagram = document.querySelector(".chain");
  const live = diagram.querySelector(".live");
  function pulseDiagram() {
    diagram.dataset.phase = t === 0 ? "final" : "step";
    live.classList.remove("go");
    void live.getBoundingClientRect();  // restart the one-shot animations
    live.classList.add("go");
  }

  function render() {
    renderLatent(t); renderTokens(t); renderScaffold(t); pulseDiagram();
    tOut.value = (t / T).toFixed(2);
    range.value = String(t);
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    timer = setTimeout(() => { t = t === 0 ? T : t - 1; render(); schedule(); }, t === 0 ? holdMs : stepMs);
  }
  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "Pause" : "Play";
    playBtn.setAttribute("aria-label", playBtn.textContent);
    schedule();
  });
  restartBtn.addEventListener("click", () => { t = T; render(); schedule(); });
  range.addEventListener("input", () => { t = Number(range.value); render(); schedule(); });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    playing = false; playBtn.textContent = "Play"; t = 3;
  }
  render(); schedule();
})();
