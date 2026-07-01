// countdown.js — EDIT THE LINE BELOW with Soumii's real birthday (local time, ISO format).
// Format: "YYYY-MM-DDTHH:MM:SS" — e.g. "2026-09-14T00:00:00" for Sept 14, 2026 at midnight.
const BIRTHDAY = new Date("2026-09-01T00:00:00");

const CountdownModule = (() => {
  let intervalId = null;
  let hasFinishedFired = false;

  function getRemaining() {
    const now = new Date();
    const diff = BIRTHDAY - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function render() {
    const els = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      minutes: document.getElementById("cd-minutes"),
      seconds: document.getElementById("cd-seconds"),
    };
    if (!els.days) return; // page not mounted

    const remaining = getRemaining();
    const label = document.getElementById("cd-caption");
    const cakeWrap = document.getElementById("cake-wrap");

    if (remaining) {
      els.days.textContent = pad(remaining.days);
      els.hours.textContent = pad(remaining.hours);
      els.minutes.textContent = pad(remaining.minutes);
      els.seconds.textContent = pad(remaining.seconds);
      if (label) label.textContent = "the candles are still burning... blow them out on the day 🎂";
      if (cakeWrap) cakeWrap.classList.remove("candles-out");
    } else {
      els.days.textContent = "00";
      els.hours.textContent = "00";
      els.minutes.textContent = "00";
      els.seconds.textContent = "00";
      if (label) label.textContent = "happy birthday, Soumii 🎉 — go make a wish.";
      if (cakeWrap && !cakeWrap.classList.contains("candles-out")) {
        cakeWrap.classList.add("candles-out");
        if (!hasFinishedFired) {
          hasFinishedFired = true;
          fireBirthdayConfetti();
        }
      }
    }
  }

  function fireBirthdayConfetti() {
    if (typeof confetti !== "function") return;
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors: ["#F2A9B5", "#E8DFF5", "#DCF2E8", "#E0B8A0"] });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors: ["#F2A9B5", "#E8DFF5", "#DCF2E8", "#E0B8A0"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ["#F2A9B5", "#E8DFF5", "#DCF2E8", "#E0B8A0", "#FADCE0"] });
  }

  function start() {
    render();
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(render, 1000);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  return { start, stop };
})();
