// game.js — Catch the Ramen 🍜
// secret messages — edit/add freely, one is picked at random each time
const secretMessages = [
  "You are the best roommate in this world.",
  "I got so lucky rooming with you.",
  "10/10 would live with you again in every timeline.",
  "You make even the boring days better.",
  "Warning: incredibly easy to love as a roommate.",
];

const RamenGame = (() => {
  let canvas, ctx;
  let animId = null;
  let running = false;
  let score = 0;
  let lastMilestone = 0;
  let basket = { x: 0, y: 0, w: 70, h: 40 };
  let bowls = [];
  let spawnTimer = 0;
  let spawnInterval = 70;
  let fallSpeed = 2.2;
  let pointerX = null;
  let keys = { left: false, right: false };
  let width = 0, height = 0;

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    basket.y = height - 55;
    if (basket.x === 0) basket.x = width / 2 - basket.w / 2;
  }

  function reset() {
    score = 0;
    lastMilestone = 0;
    bowls = [];
    spawnTimer = 0;
    spawnInterval = 70;
    fallSpeed = 2.2;
    basket.x = width / 2 - basket.w / 2;
    updateScoreUI();
    hideModal();
  }

  function updateScoreUI() {
    const el = document.getElementById("game-score");
    if (el) el.textContent = score;
  }

  function spawnBowl() {
    const size = 30;
    bowls.push({
      x: Math.random() * (width - size),
      y: -size,
      size,
      speed: fallSpeed + Math.random() * 0.8,
    });
  }

  function showModal(message) {
    const modal = document.getElementById("game-modal");
    const text = document.getElementById("game-modal-text");
    if (modal && text) {
      text.textContent = message;
      modal.classList.add("visible");
    }
  }

  function hideModal() {
    const modal = document.getElementById("game-modal");
    if (modal) modal.classList.remove("visible");
  }

  function showGameOver() {
    const modal = document.getElementById("game-over-modal");
    const finalScore = document.getElementById("game-final-score");
    if (finalScore) finalScore.textContent = score;
    if (modal) modal.classList.add("visible");
  }

  function hideGameOver() {
    const modal = document.getElementById("game-over-modal");
    if (modal) modal.classList.remove("visible");
  }

  function drawBasket() {
    ctx.save();
    ctx.translate(basket.x, basket.y);
    ctx.fillStyle = "#F2A9B5";
    ctx.strokeStyle = "#E0B8A0";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(basket.w / 2, basket.h + 15, basket.w, 10);
    ctx.lineTo(basket.w - 8, 10);
    ctx.quadraticCurveTo(basket.w / 2, basket.h, 8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🥢", basket.w / 2, 5);
    ctx.restore();
  }

  function drawBowl(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.font = `${b.size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("🍜", b.size / 2, b.size);
    ctx.restore();
  }

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    // move basket
    const speed = 6.5;
    if (pointerX !== null) {
      basket.x += (pointerX - basket.w / 2 - basket.x) * 0.25;
    } else {
      if (keys.left) basket.x -= speed;
      if (keys.right) basket.x += speed;
    }
    basket.x = Math.max(0, Math.min(width - basket.w, basket.x));

    // spawn
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnBowl();
    }

    // update bowls
    for (let i = bowls.length - 1; i >= 0; i--) {
      const b = bowls[i];
      b.y += b.speed;

      const caught =
        b.y + b.size >= basket.y &&
        b.y <= basket.y + basket.h &&
        b.x + b.size / 2 >= basket.x &&
        b.x + b.size / 2 <= basket.x + basket.w;

      if (caught) {
        bowls.splice(i, 1);
        score++;
        updateScoreUI();

        if (score % 10 === 0) {
          fallSpeed += 0.4;
          spawnInterval = Math.max(28, spawnInterval - 6);
        }
        if (score - lastMilestone >= 15 + Math.floor(Math.random() * 5)) {
          lastMilestone = score;
          const msg = secretMessages[Math.floor(Math.random() * secretMessages.length)];
          showModal(msg);
        }
      } else if (b.y > height + 40) {
        bowls.splice(i, 1);
      }
    }

    drawBasket();
    bowls.forEach(drawBowl);

    animId = requestAnimationFrame(loop);
  }

  function pointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    pointerX = clientX - rect.left;
  }

  function pointerLeave() {
    pointerX = null;
  }

  function keyDown(e) {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
  }
  function keyUp(e) {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
  }

  function init() {
    canvas = document.getElementById("ramen-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("mousemove", pointerMove);
    canvas.addEventListener("mouseleave", pointerLeave);
    canvas.addEventListener("touchmove", (e) => { pointerMove(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener("touchend", pointerLeave);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    const startBtn = document.getElementById("game-start-btn");
    const restartBtn = document.getElementById("game-restart-btn");
    const modalCloseBtn = document.getElementById("game-modal-close");
    const overRestartBtn = document.getElementById("game-over-restart-btn");

    if (startBtn) startBtn.addEventListener("click", startWithTimer);
    if (restartBtn) restartBtn.addEventListener("click", startWithTimer);
    if (overRestartBtn) overRestartBtn.addEventListener("click", startWithTimer);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", hideModal);
  }

  function startGame() {
    hideGameOver();
    resize();
    reset();
    running = true;
    if (animId) cancelAnimationFrame(animId);
    loop();

    const startBtn = document.getElementById("game-start-btn");
    if (startBtn) startBtn.style.display = "none";
  }

  function stopGame() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
  }

  function endGame() {
    stopGame();
    showGameOver();
  }

  // 30-second round timer, gives natural "game over" pacing
  let roundTimer = null;
  function startWithTimer() {
    startGame();
    if (roundTimer) clearTimeout(roundTimer);
    roundTimer = setTimeout(() => {
      if (running) endGame();
    }, 30000);
  }

  return { init, start: startWithTimer, stop: stopGame };
})();
