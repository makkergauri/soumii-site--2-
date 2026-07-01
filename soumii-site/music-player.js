// music-player.js — a single global audio player that persists across every page
const MusicPlayer = (() => {
  let audio = null;
  let hasStarted = false;
  let songMissing = false;
  let isPlaying = false;

  function init() {
    audio = document.getElementById("global-audio");
    if (!audio) return;

    audio.addEventListener("error", () => {
      if (!audio.error) return;
      songMissing = true;
      const placeholder = document.getElementById("song-placeholder");
      const playBtn = document.getElementById("song-play-btn");
      if (placeholder) placeholder.style.display = "flex";
      if (playBtn) playBtn.style.display = "none";
    });
    audio.addEventListener("canplaythrough", () => {
      songMissing = false;
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });

    const miniPlayPause = document.getElementById("mini-play-pause");
    if (miniPlayPause) miniPlayPause.addEventListener("click", toggle);

    const miniVolume = document.getElementById("mini-volume");
    if (miniVolume) miniVolume.addEventListener("input", (e) => {
      audio.volume = e.target.value;
    });

    const miniProgressBar = document.getElementById("mini-progress-bar");
    if (miniProgressBar) miniProgressBar.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = miniProgressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  function play() {
    if (!audio || songMissing) return;
    hasStarted = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        showMiniPlayer();
        syncPlayIcons(true);
      }).catch(() => {
        songMissing = true;
        const placeholder = document.getElementById("song-placeholder");
        if (placeholder) placeholder.style.display = "flex";
      });
    }
  }

  function toggle() {
    if (!audio || songMissing) return;
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      syncPlayIcons(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
          syncPlayIcons(true);
        });
      }
    }
  }

  function syncPlayIcons(playing) {
    const big = document.getElementById("song-play-icon");
    const mini = document.getElementById("mini-play-pause");
    if (big) big.textContent = playing ? "⏸" : "▶";
    if (mini) mini.textContent = playing ? "⏸" : "▶";
  }

  function showMiniPlayer() {
    const mini = document.getElementById("mini-player");
    if (mini) mini.classList.add("visible");
  }

  function updateProgress() {
    if (!audio || !audio.duration) return;
    const bar = document.getElementById("mini-progress-fill");
    if (bar) bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }

  return { init, play, toggle, hasStarted: () => hasStarted };
})();