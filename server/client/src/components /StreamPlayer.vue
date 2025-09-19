<template>
  <div class="video-wrapper">
    <!-- 画質変更オーバーレイ -->
    <div v-if="isQualitySwitching" class="block-overlay">
      <div class="overlay-message">
        <span class="spinner"></span>
        <p>画質を切り替えています…</p>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="error" class="error-box">
      ⚠️ {{ error }}
      <button @click="reloadStream" class="reload-button">再取得</button>
    </div>

    <!-- StreamType=3 -->
    <div v-else-if="streamType === '3' && streamUrl">
      <a :href="streamUrl" target="_blank" rel="noopener noreferrer" class="download-link">
        ⬇ ダウンロード
      </a>
    </div>

    <!-- StreamType=2 (メインUI) -->
    <div
      v-else-if="
        streamType2 &&
        selectedQuality &&
        (sources.muxed360p || availableQualities.length > 0)
      "
      class="video-container"
    >
      <template v-if="selectedQuality === 'muxed360p'">
        <video ref="videoRef" controls autoplay></video>
      </template>

      <template v-else>
        <video ref="videoRef" preload="auto" controls></video>
        <audio ref="audioRef" preload="auto"></audio>
      </template>

      <!-- 設定パネル -->
      <transition name="fade">
        <div class="settings-box" v-show="settingsVisible">
          <div class="settings-row">
            <label>画質:</label>
            <select v-model="selectedQuality" class="selector">
              <option value="muxed360p" v-if="sources.muxed360p">通常</option>
              <option
                v-for="q in availableQualities"
                :key="q"
                :value="q"
              >
                {{ q.replace('p', '') }}p
              </option>
            </select>
          </div>

          <div class="settings-row">
            <label>再生速度:</label>
            <select v-model.number="selectedPlaybackRate" class="selector">
              <option v-for="rate in playbackRates" :key="rate" :value="rate">
                {{ rate }}x
              </option>
            </select>
          </div>

          <button @click="reloadStream" class="reload-button">再読込み</button>
        </div>
      </transition>
    </div>

    <!-- iframeモード -->
    <div v-else-if="streamUrl" class="video-container">
      <iframe
        :src="streamUrl"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      ></iframe>
    </div>

    <!-- 読み込み中 -->
    <div v-else-if="loading" class="loading-box">
      <span class="spinner"></span>
      読み込み中...
    </div>
  </div>
</template>

<style scoped>
.video-container {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.settings-box {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  backdrop-filter: blur(6px);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selector {
  background: #1c1c1c;
  color: white;
  border: 1px solid #555;
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 6px;
}

.reload-button {
  margin-top: 6px;
  padding: 6px 12px;
  font-size: 12px;
  background: #444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.reload-button:hover {
  background: #666;
}

.error-box {
  background: rgba(255, 50, 50, 0.15);
  color: #ff5555;
  padding: 12px;
  border: 1px solid #ff5555;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 10px;
}

.block-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.overlay-message {
  color: white;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 0.8s linear infinite;
}

.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
