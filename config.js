// Everything a release needs to fill in lives here. index.html reads it at load time.
// Values that start with "TODO" render with an amber background so an unfilled field is visible on the page.
window.SITE = {
  shortName: "HC-DLM",
  title: "Hierarchical Continuous Diffusion Language Models",

  // One entry per author, in paper order. `affil` lists keys of `affiliations`.
  // `equal: true` adds the shared-first-author mark; `url` links the name to a homepage.
  authors: [
    { name: "Hui Ren", url: "https://rhfeiyang.top/", affil: [1] },
    { name: "Zihan Li", url: "https://www.linkedin.com/in/zihan-li-616b68325/", affil: [1] },
    { name: "Chang Liu", url: "https://ruachang.github.io/", affil: [1] },
    { name: "Huidong Liu", url: "https://harryliew.github.io/", affil: [2] },
    { name: "Alexander Schwing", url: "https://www.alexander-schwing.de/", affil: [1] },
  ],
  affiliations: {
    1: "University of Illinois Urbana-Champaign",
    2: "Amazon.com, Inc.",
  },
  equalNote: "Equal contribution",

  links: {
    arxiv: "https://arxiv.org/abs/2610.02193",
    code: "https://github.com/rhfeiyang/HC-DLM",
  },

  bibtex: `@article{ren2026hierarchical,
  title   = {Hierarchical Continuous Diffusion Language Models},
  author  = {Ren, Hui and Li, Zihan and Liu, Chang and Liu, Huidong and
             Schwing, Alexander},
  journal = {arXiv preprint arXiv:2610.02193},
  year    = {2026}
}`,
};
