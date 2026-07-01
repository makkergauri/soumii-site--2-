// main.js — page navigation/transitions + wiring for every interactive page
const PAGE_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8"];

const App = (() => {
  let currentPage = "1";
  let previousMainPage = "1";

  function pageEl(id) {
    return document.querySelector(`.page[data-page="${id}"]`);
  }

  function updateProgress(pageId) {
    const idx = PAGE_ORDER.indexOf(pageId);
    document.querySelectorAll(".progress-dot").forEach((dot, i) => {
      dot.classList.remove("active", "done");
      if (idx === -1) return;
      if (i < idx) dot.classList.add("done");
      else if (i === idx) dot.classList.add("active");
    });
    const ribbon = document.getElementById("progress-ribbon");
    if (ribbon) ribbon.style.display = idx === -1 ? "none" : "flex";
  }

  function goTo(pageId, { pushState = true } = {}) {
    const next = pageEl(pageId);
    if (!next) return;
    const current = pageEl(currentPage);

    if (current && current !== next) {
      current.classList.add("leave");
      current.classList.remove("enter");
      setTimeout(() => {
        current.classList.remove("active", "leave");
      }, 380);
    }

    next.classList.add("active", "enter");
    setTimeout(() => next.classList.remove("enter"), 520);

    if (PAGE_ORDER.includes(currentPage)) previousMainPage = currentPage;
    currentPage = pageId;
    updateProgress(pageId);

    if (pushState) {
      history.pushState({ page: pageId }, "", `#page-${pageId}`);
    }

    onPageEnter(pageId);
    window.scrollTo(0, 0);
  }

  function onPageEnter(pageId) {
    if (pageId === "6") CountdownModule.start();
    else CountdownModule.stop();
  }

  function goBack() {
    history.back();
  }

  return { goTo, goBack, pageEl, updateProgress, get current() { return currentPage; }, set current(v) { currentPage = v; }, get previousMainPage() { return previousMainPage; } };
})();

// ---------------- Page 2: song ----------------
function initSongPage() {
  const btn = document.getElementById("song-play-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    MusicPlayer.play();
  });
}

// ---------------- Page 3: photo album (autoplay slideshow) ----------------
const CAPTION_MS = 1800;
const PHOTO_MS = 3200;

function buildSlideshow(containerId, data) {
  const root = document.getElementById(containerId);
  if (!root) return null;
  root.innerHTML = "";

  if (!data || data.length === 0) {
    root.innerHTML = `<p class="handwritten" style="text-align:center;">no photos added yet ✦</p>`;
    return null;
  }

  const frame = document.createElement("div");
  frame.className = "slideshow-frame";

  data.forEach((item, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.index = i;

    const captionEl = document.createElement("p");
    captionEl.className = "slide-caption";
    captionEl.textContent = item.caption;

    const polaroid = document.createElement("div");
    polaroid.className = "slide-polaroid";
    polaroid.style.display = "none";
    polaroid.innerHTML = `
      <div class="washi"></div>
      <div class="slide-img">🌸</div>
      ${item.date ? `<p class="slide-date">${item.date}</p>` : ""}
    `;
    const imgDiv = polaroid.querySelector(".slide-img");
    const testImg = new Image();
    testImg.onload = () => {
      imgDiv.style.backgroundImage = `url('${item.src}')`;
      imgDiv.style.backgroundSize = "cover";
      imgDiv.style.backgroundPosition = "center";
      imgDiv.textContent = "";
    };
    testImg.onerror = () => {};
    testImg.src = item.src;

    slide.appendChild(captionEl);
    slide.appendChild(polaroid);
    frame.appendChild(slide);
  });

  const controls = document.createElement("div");
  controls.className = "slideshow-controls";
  controls.innerHTML = `
    <button class="slide-arrow" data-dir="-1" aria-label="previous">‹</button>
    <button class="slide-playpause" data-action="toggle">⏸ pause</button>
    <button class="slide-arrow" data-dir="1" aria-label="next">›</button>
  `;

  const dots = document.createElement("div");
  dots.className = "slide-dots";
  data.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "slide-dot";
    dot.dataset.index = i;
    dots.appendChild(dot);
  });

  root.appendChild(frame);
  root.appendChild(controls);
  root.appendChild(dots);

  return createSlideshowController(root, frame, dots, controls, data.length);
}

function createSlideshowController(root, frame, dots, controls, count) {
  let current = 0;
  let phase = "caption";
  let playing = true;
  let timer = null;

  const slides = [...frame.querySelectorAll(".slide")];
  const dotEls = [...dots.querySelectorAll(".slide-dot")];

  function render() {
    slides.forEach((s, i) => {
      s.classList.toggle("slide-active", i === current);
      const polaroid = s.querySelector(".slide-polaroid");
      polaroid.style.display = i === current && phase === "photo" ? "block" : "none";
    });
    dotEls.forEach((d, i) => d.classList.toggle("slide-dot-active", i === current));
  }

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function scheduleNext() {
    clearTimer();
    if (!playing) return;
    const delay = phase === "caption" ? CAPTION_MS : PHOTO_MS;
    timer = setTimeout(advance, delay);
  }

  function advance() {
    if (phase === "caption") {
      phase = "photo";
    } else {
      phase = "caption";
      current = (current + 1) % count;
    }
    render();
    scheduleNext();
  }

  function goTo(index, newPhase = "caption") {
    current = ((index % count) + count) % count;
    phase = newPhase;
    render();
    scheduleNext();
  }

  controls.addEventListener("click", (e) => {
    const dirBtn = e.target.closest("[data-dir]");
    const toggleBtn = e.target.closest("[data-action='toggle']");
    if (dirBtn) {
      const dir = parseInt(dirBtn.dataset.dir, 10);
      goTo(current + dir);
    } else if (toggleBtn) {
      playing = !playing;
      toggleBtn.textContent = playing ? "⏸ pause" : "▶ play";
      if (playing) scheduleNext();
      else clearTimer();
    }
  });

  dots.addEventListener("click", (e) => {
    const dot = e.target.closest(".slide-dot");
    if (dot) goTo(parseInt(dot.dataset.index, 10));
  });

  render();
  scheduleNext();

  return { stop: clearTimer };
}

let mainSlideshow = null;
let uglySlideshow = null;

function initAlbumPage() {
  mainSlideshow = buildSlideshow("slideshow-main", photos);

  const secretQ = document.getElementById("secret-question");
  const gallery = document.getElementById("secret-gallery");
  const yesBtn = document.getElementById("secret-yes-btn");
  const noBtn = document.getElementById("secret-no-btn");

  yesBtn.addEventListener("click", () => {
    secretQ.style.display = "none";
    gallery.style.display = "block";
    uglySlideshow = buildSlideshow("slideshow-ugly", uglyPhotos);
  });
  noBtn.addEventListener("click", () => {
    App.goTo("4");
  });
}

// ---------------- Page 4: facts ----------------
function initFactsPage() {
  const grid = document.getElementById("facts-grid");
  if (!grid) return;
  grid.innerHTML = "";
  facts.forEach((f, i) => {
    const card = document.createElement("div");
    card.className = "fact-card";
    card.innerHTML = `
      <div class="fact-card-inner">
        <div class="fact-face fact-front" style="background:var(--${["pink","lavender","mint","sky"][i % 4]})">
          <span class="fact-icon">${f.icon}</span>
          <span>${f.prompt}</span>
        </div>
        <div class="fact-face fact-back">${f.fact}</div>
      </div>
    `;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    grid.appendChild(card);
  });
}

// ---------------- Page 6: cake SVG ----------------
function buildCake() {
  const wrap = document.getElementById("cake-wrap");
  if (!wrap) return;
  wrap.innerHTML = `
  <svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="120" cy="205" rx="95" ry="10" fill="#E8DFF5" opacity="0.6"/>
    <rect x="35" y="140" width="170" height="55" rx="10" fill="#F2A9B5"/>
    <rect x="35" y="140" width="170" height="14" rx="7" fill="#FADCE0"/>
    <path d="M35 150 Q 55 160 75 150 T 115 150 T 155 150 T 205 150" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>
    <rect x="60" y="95" width="120" height="50" rx="10" fill="#DCF2E8"/>
    <rect x="60" y="95" width="120" height="12" rx="6" fill="#EAF8F1"/>
    <path d="M60 104 Q 78 112 96 104 T 132 104 T 168 104" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>
    <rect x="85" y="58" width="70" height="42" rx="10" fill="#DCEBF5"/>
    <rect x="85" y="58" width="70" height="10" rx="5" fill="#EDF5FA"/>
    <circle cx="70" cy="145" r="5" fill="#FADCE0"/>
    <circle cx="170" cy="145" r="5" fill="#FADCE0"/>
    <circle cx="95" cy="100" r="4" fill="#EAF8F1"/>
    <circle cx="150" cy="100" r="4" fill="#EAF8F1"/>
    <rect x="45" y="165" width="3" height="9" rx="1.5" fill="#E0B8A0" transform="rotate(20 45 165)"/>
    <rect x="190" y="170" width="3" height="9" rx="1.5" fill="#8A7B7B" opacity="0.5" transform="rotate(-15 190 170)"/>
    <rect x="65" y="115" width="3" height="8" rx="1.5" fill="#F2A9B5" transform="rotate(10 65 115)"/>
    <rect x="160" y="120" width="3" height="8" rx="1.5" fill="#E0B8A0" transform="rotate(-20 160 120)"/>
    ${[95, 115, 135, 155].map((x, i) => `
      <g>
        <rect x="${x}" y="30" width="6" height="30" rx="2" fill="${["#F2A9B5","#DCF2E8","#DCEBF5","#E8DFF5"][i]}"/>
        <g transform="translate(${x + 3},28)">
          <path class="flame" d="M0,-14 C5,-9 5,-3 0,0 C-5,-3 -5,-9 0,-14 Z" fill="#E0B8A0"/>
          <path class="flame" d="M0,-9 C3,-6 3,-2 0,0 C-3,-2 -3,-6 0,-9 Z" fill="#FADCE0" style="animation-delay:-0.4s"/>
          <ellipse class="smoke" cx="0" cy="-16" rx="4" ry="6" fill="#C9C0C0"/>
        </g>
      </g>
    `).join("")}
  </svg>`;
}

// ---------------- Page 5: game init ----------------
function initGamePage() {
  RamenGame.init();
  const startBtn = document.getElementById("game-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.style.display = "none";
    });
  }
}

// ---------------- Page 7: letters ----------------
const LettersState = { readIndices: new Set() };

function buildEnvelopeStack() {
  const stack = document.getElementById("envelope-stack");
  if (!stack) return;
  stack.innerHTML = "";
  letters.forEach((letter, i) => {
    const env = document.createElement("div");
    env.className = "envelope";
    const rotation = (Math.random() * 10 - 5).toFixed(1);
    env.style.transform = `rotate(${rotation}deg)`;
    env.innerHTML = `
      <div class="washi"></div>
      <div class="envelope-seal">${i + 1}</div>
      <div class="envelope-title">${letter.title}</div>
    `;
    env.addEventListener("click", () => openLetter(i));
    stack.appendChild(env);
  });
  refreshEnvelopeReadState();
}

function refreshEnvelopeReadState() {
  const stack = document.getElementById("envelope-stack");
  if (!stack) return;
  [...stack.children].forEach((env, i) => {
    env.classList.toggle("read", LettersState.readIndices.has(i));
  });
  const doneRow = document.getElementById("letters-done-row");
  if (doneRow) {
    doneRow.style.display = LettersState.readIndices.size === letters.length ? "block" : "none";
  }
}

function openLetter(i) {
  LettersState.readIndices.add(i);
  refreshEnvelopeReadState();
  const titleEl = document.getElementById("letter-title");
  const bodyEl = document.getElementById("letter-body");
  titleEl.textContent = letters[i].title;
  bodyEl.textContent = letters[i].body;
  App.goTo("7b");
}

function initLettersPage() {
  buildEnvelopeStack();
  document.getElementById("letter-back-btn").addEventListener("click", () => {
    App.goTo("7", { pushState: true });
  });
  document.getElementById("letters-done-btn").addEventListener("click", () => App.goTo("8"));
  document.getElementById("letters-skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    App.goTo("8");
  });
}

// ---------------- Page 8: final ----------------
function initFinalPage() {
  const btn = document.getElementById("celebrate-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (typeof confetti !== "function") return;
    const colors = ["#F2A9B5", "#E8DFF5", "#DCF2E8", "#E0B8A0", "#FADCE0"];
    const end = Date.now() + 2500;
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors });
      confetti({ particleCount: 3, angle: 90, spread: 80, origin: { x: 0.5, y: 0.2 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 160, spread: 120, origin: { y: 0.4 }, colors });
  });
}

// ---------------- boot ----------------
document.addEventListener("DOMContentLoaded", () => {
  App.updateProgress("1");

  MusicPlayer.init();
  initSongPage();
  initAlbumPage();
  initFactsPage();
  initGamePage();
  buildCake();
  initLettersPage();
  initFinalPage();

  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.closest(".page");
      const id = page.dataset.page;
      const idx = PAGE_ORDER.indexOf(id);
      const next = PAGE_ORDER[idx + 1];
      if (next) App.goTo(next);
    });
  });
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => App.goBack());
  });
  window.addEventListener("popstate", (e) => {
    const id = (e.state && e.state.page) || "1";
    App.goTo(id, { pushState: false });
  });
  history.replaceState({ page: "1" }, "", "#page-1");
});