export function setupSyncPlayback(video, audio, sources, selectedQuality, diffText, selectedPlaybackRate) {
  if (!video || !audio) return;

  // --- Safari判定 ---
  function isSafari() {
    return /^Apple/.test(navigator.vendor) && !/CriOS|FxiOS/.test(navigator.userAgent);
  }
  const safariMode = isSafari();

  let videoSrc, audioSrc;
  if (selectedQuality.value !== "muxed360p" && sources.value[selectedQuality.value]) {
    videoSrc = sources.value[selectedQuality.value].video;
    audioSrc = sources.value[selectedQuality.value].audio;
  } else if (sources.value.separateHigh) {
    videoSrc = sources.value.separateHigh.video;
    audioSrc = sources.value.separateHigh.audio;
  } else {
    return;
  }

  // UI: diff 表示用スタイルを強化
  if (diffText.el) {
    diffText.el.style.cssText = `
      position:absolute;
      bottom:10px;
      right:10px;
      background:rgba(0,0,0,0.6);
      color:#0ff;
      font-weight:bold;
      font-family:monospace;
      padding:4px 8px;
      border-radius:6px;
      font-size:0.8rem;
      transition:opacity 0.3s ease;
    `;
  }

  // --- 再生失敗時のUIフィードバック ---
  function showPlayOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:absolute;
      top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.7);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:1.2rem;
      color:white;
      cursor:pointer;
      z-index:100;
    `;
    overlay.innerText = "▶ タップして再生";
    overlay.onclick = () => {
      overlay.remove();
      video.play().catch(() => {});
      audio.play().catch(() => {});
    };
    video.parentNode.appendChild(overlay);
  }

  // --- Safari専用シンプル同期 ---
  if (safariMode) {
    video.pause();
    audio.pause();
    video.src = "";
    audio.src = "";
    video.load();
    audio.load();

    video.src = videoSrc;
    audio.src = audioSrc;

    video.playbackRate = selectedPlaybackRate.value;
    audio.playbackRate = selectedPlaybackRate.value;

    // イベント登録
    video.addEventListener("play", () => {
      video.playbackRate = selectedPlaybackRate.value;
      audio.playbackRate = selectedPlaybackRate.value;
      if (audio.paused) audio.play().catch(showPlayOverlay);
    });
    video.addEventListener("pause", () => audio.pause());
    video.addEventListener("seeking", () => {
      audio.currentTime = video.currentTime;
    });

    let lastJumpTime = 0;
    const jumpInterval = 1000;
    function looseSync() {
      if (!video.paused) {
        const diff = video.currentTime - audio.currentTime;
        diffText.value = `${(diff * 1000).toFixed(0)} ms`;
        if (Math.abs(diff) > 1) {
          const now = performance.now();
          if (now - lastJumpTime > jumpInterval) {
            audio.currentTime = video.currentTime;
            lastJumpTime = now;
          }
        } else if (Math.abs(diff) > 0.5) {
          const rateAdjust = 1 + Math.min(Math.abs(diff) / 1, 0.1) * (diff > 0 ? 1 : -1);
          audio.playbackRate = selectedPlaybackRate.value * rateAdjust;
        } else {
          audio.playbackRate = selectedPlaybackRate.value;
        }
      }
      if (!video.ended) requestAnimationFrame(looseSync);
    }
    requestAnimationFrame(looseSync);
    return;
  }

  // --- 非Safari用 ---
  video.pause();
  audio.pause();
  video.src = "";
  audio.src = "";
  video.load();
  audio.load();

  video.src = videoSrc;
  audio.src = audioSrc;

  let lastJumpTime = 0;
  const jumpCooldown = 500;
  let syncLoopId;
  let lastRateAdjust = 1;

  function jumpAudioToVideo() {
    const now = performance.now();
    if (now - lastJumpTime < jumpCooldown) return;
    audio.currentTime = Math.max(0, video.currentTime - 0.05);
    lastJumpTime = now;
  }

  function correctPlaybackRate(diff) {
    const abs = Math.abs(diff);
    if (abs >= 0.9) {
      jumpAudioToVideo();
      return;
    }
    let maxAdjust = abs >= 0.8 ? 0.85 : abs >= 0.1 ? 0.75 : 0.015;
    const adjustmentRatio = abs / 0.9;
    const targetAdjust = 1 + adjustmentRatio * maxAdjust * (diff > 0 ? 1 : -1);
    lastRateAdjust = lastRateAdjust * 0.7 + targetAdjust * 0.3;
    audio.playbackRate = selectedPlaybackRate.value * lastRateAdjust;
  }

  async function playBoth(withJump = false) {
    try {
      if (video.paused) await video.play();
      if (audio.paused) await audio.play();
      if (withJump) jumpAudioToVideo();
      syncLoopId = requestAnimationFrame(syncLoop);
    } catch (e) {
      showPlayOverlay();
    }
  }

  function pauseBoth() {
    video.pause();
    audio.pause();
    cancelAnimationFrame(syncLoopId);
  }

  video.addEventListener("play", () => playBoth(true));
  video.addEventListener("pause", pauseBoth);
  video.addEventListener("waiting", () => audio.pause());
  video.addEventListener("playing", () => audio.play().catch(() => {}));

  function syncLoop() {
    if (!video.paused && !audio.paused) {
      const diff = video.currentTime - audio.currentTime;
      diffText.value = `${(diff * 1000).toFixed(0)} ms`;
      correctPlaybackRate(diff);
      syncLoopId = requestAnimationFrame(syncLoop);
    }
  }

  video.playbackRate = selectedPlaybackRate.value;
  audio.playbackRate = selectedPlaybackRate.value;
}
