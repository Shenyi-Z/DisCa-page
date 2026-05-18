const comparisonMethods = [
  { key: "cfg", title: "with CFG (x1.0)" },
  { key: "cfg-distilled", title: "CFG Distilled (x2.0)" },
  { key: "taylorseer", title: "CFG Distill+TaylorSeer (x7.0)" },
  { key: "teacache", title: "CFG Distill+TeaCache (x9.2)" },
  { key: "restricted-meanflow", title: "[Ours] Restricted MeanFlow (x5.0)", ours: true },
  { key: "disca", title: "[Ours] DisCa (x11.8)", ours: true },
];

const comparisonCases = [
  {
    slug: "panda-campfire-0",
    title: "A happy fuzzy panda playing guitar nearby a campfire, snow mountain in the background-0",
  },
  {
    slug: "panda-campfire-2",
    title: "A happy fuzzy panda playing guitar nearby a campfire, snow mountain in the background-2",
  },
  {
    slug: "park-bench-lake-4",
    title: "In a still frame, a park bench with a view of the lake-4",
  },
  {
    slug: "turquoise-water-3",
    title: "Splash of turquoise water in extreme slow motion, alpha channel included.-3",
  },
  {
    slug: "carrot-1",
    title: "a carrot-1",
  },
  {
    slug: "chair-couch-3",
    title: "a chair and a couch-3",
  },
  {
    slug: "motorcycle-4",
    title: "a motorcycle-4",
  },
  {
    slug: "purple-bird-0",
    title: "a purple bird-0",
  },
  {
    slug: "stop-sign-4",
    title: "a stop sign-4",
  },
  {
    slug: "fountain-1",
    title: "fountain-1",
  },
  {
    slug: "golden-fish-0",
    title: "golden fish swimming in the ocean.-0",
  },
  {
    slug: "windmill-3",
    title: "windmill-3",
  },
];

let currentCase = 0;

function pauseVideosInElement(element) {
  if (!element) return;
  element.querySelectorAll("video").forEach((video) => video.pause());
}

function playVisibleLoopVideos() {
  document.querySelectorAll("video[autoplay]").forEach((video) => {
    video.play().catch(() => {});
  });
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateActiveNav(sectionId) {
  document.querySelectorAll(".floating-nav .nav-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.getAttribute("onclick")?.includes(`'${sectionId}'`));
  });
}

function observeSections() {
  const sectionIds = ["abstract", "i2v-examples", "restricted-meanflow", "hyvideo10-t2v", "poster", "citation"];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if (sections.length === 0) return;

  const updateFromScroll = () => {
    const triggerLine = window.innerHeight * 0.32;
    let activeSection = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= triggerLine) {
        activeSection = section.id;
      }
    });

    updateActiveNav(activeSection);
  };

  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (isTicking) return;
    isTicking = true;
    requestAnimationFrame(() => {
      updateFromScroll();
      isTicking = false;
    });
  }, { passive: true });

  updateFromScroll();
}

function buildComparisonGroups() {
  const wrapper = document.getElementById("comparison-groups");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  comparisonCases.forEach((videoCase, caseIndex) => {
    const group = document.createElement("article");
    group.className = "comparison-group";
    group.dataset.caseIndex = String(caseIndex);

    const heading = document.createElement("h3");
    heading.className = "case-title";
    heading.textContent = videoCase.title;
    group.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "comparison-grid";

    comparisonMethods.forEach((method) => {
      const card = document.createElement("div");
      card.className = `comparison-card${method.ours ? " ours" : ""}`;

      const title = document.createElement("div");
      title.className = "method-title";
      title.textContent = method.title;

      const video = document.createElement("video");
      video.src = `static/videos/hyvideo10-t2v/${videoCase.slug}/${method.key}.mp4`;
      video.loop = true;
      video.muted = true;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      card.append(title, video);
      grid.appendChild(card);
    });

    group.appendChild(grid);
    wrapper.appendChild(group);
  });
}

function activeCaseElement() {
  return document.querySelector(".comparison-group.active");
}

function updateCaseDisplay() {
  const groups = Array.from(document.querySelectorAll(".comparison-group"));
  const indicator = document.getElementById("case-indicator");
  if (groups.length === 0) return;

  groups.forEach((group, index) => {
    const isActive = index === currentCase;
    group.classList.toggle("active", isActive);
    if (!isActive) pauseVideosInElement(group);
  });

  if (indicator) {
    indicator.textContent = `Case ${currentCase + 1} / ${groups.length}`;
  }
}

function nextCase() {
  const total = comparisonCases.length;
  currentCase = (currentCase + 1) % total;
  updateCaseDisplay();
}

function previousCase() {
  const total = comparisonCases.length;
  currentCase = (currentCase - 1 + total) % total;
  updateCaseDisplay();
}

function playActiveCase() {
  const group = activeCaseElement();
  if (!group) return;
  group.querySelectorAll("video").forEach((video) => {
    video.play().catch(() => {});
  });
}

function pauseActiveCase() {
  pauseVideosInElement(activeCaseElement());
}

function resetActiveCase() {
  const group = activeCaseElement();
  if (!group) return;
  group.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
}

function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button ? button.querySelector(".copy-text") : null;

  if (!bibtexElement || !button || !copyText) return;

  const setCopied = () => {
    button.classList.add("copied");
    copyText.textContent = "Copied";
    setTimeout(() => {
      button.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 1800);
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(bibtexElement.textContent).then(setCopied).catch(() => fallbackCopy(bibtexElement.textContent, setCopied));
  } else {
    fallbackCopy(bibtexElement.textContent, setCopied);
  }
}

function fallbackCopy(text, onCopied) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  onCopied();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextCase();
  }
  if (event.key === "ArrowLeft") {
    previousCase();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  buildComparisonGroups();
  observeSections();
  updateActiveNav("abstract");
  updateCaseDisplay();
  playVisibleLoopVideos();
});
