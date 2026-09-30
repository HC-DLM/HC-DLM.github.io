// Fills the hero (authors, affiliations, buttons) and the BibTeX block from config.js.
(function () {
  const site = window.SITE;
  const isTodo = (s) => typeof s === "string" && /^TODO\b/.test(s.trim());
  const stripTodo = (s) => s.replace(/^TODO\s*/, "");

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v !== "" && v != null) node.setAttribute(k, v); });
    (children || []).forEach((c) => node.append(c));
    return node;
  };

  const authors = document.getElementById("authors");
  site.authors.forEach((a, i) => {
    const label = stripTodo(a.name) + (a.equal ? "*" : "");
    const name = a.url ? el("a", { href: a.url, target: "_blank", rel: "noopener noreferrer" }, [label]) : el("span", {}, [label]);
    if (isTodo(a.name)) name.classList.add("todo");
    authors.append(name, el("sup", {}, [a.affil.join(",")]));
    if (i < site.authors.length - 1) authors.append(", ");
  });

  const affils = document.getElementById("affils");
  Object.entries(site.affiliations).forEach(([idx, text]) => {
    const span = el("span", {}, [el("b", { class: "num" }, [idx]), stripTodo(text)]);
    if (isTodo(text)) span.classList.add("todo");
    affils.append(span);
  });
  if (site.authors.some((a) => a.equal)) {
    affils.append(el("span", {}, ["*" + site.equalNote]));
  }

  const icons = {
    arxiv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6zM14 3.5V8h4.5M8 12h8v1.5H8zM8 15.5h8V17H8z"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
  };
  const labels = { arxiv: "arXiv", code: "Code" };
  const links = document.getElementById("links");
  Object.entries(site.links).forEach(([key, url]) => {
    if (!url) return;
    const todo = isTodo(url);
    const a = el("a", {
      class: "btn",
      href: todo ? "#" : url,
      target: todo ? null : "_blank",
      rel: todo ? null : "noopener noreferrer",
    });
    a.innerHTML = icons[key] + " " + labels[key];
    if (todo) { a.classList.add("todo-link"); a.title = "Link not set yet: edit config.js"; }
    links.append(a);
  });

  const bib = document.getElementById("bibtex");
  bib.textContent = site.bibtex;
  const copy = document.getElementById("copy-bibtex");
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(site.bibtex).then(() => {
      copy.textContent = "Copied";
      setTimeout(() => { copy.textContent = "Copy"; }, 1600);
    });
  });
})();
