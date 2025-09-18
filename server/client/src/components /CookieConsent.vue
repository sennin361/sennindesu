<template>
  <div>
    <!-- 同意前の外部HTML表示 -->
    <div
      v-if="!consentGiven"
      id="external-html"
      v-html="externalHtml"
      class="fallback-content"
    ></div>

    <!-- Cookie同意ポップアップ -->
    <transition name="popup-fade">
      <div v-if="!consentGiven" class="cookie-overlay">
        <div class="cookie-popup">
          <h3 class="cookie-title">🍪 Cookieの使用について</h3>
          <p class="cookie-message">
            本サイトは快適な利用のためにCookieを使用します。<br />
            続行するには同意してください。
          </p>
          <div class="cookie-actions">
            <button class="accept-btn" @click="acceptCookies">
              はい、許可します
            </button>
            <button class="decline-btn" @click="declineCookies">
              拒否する
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 同意済みならslotの中身（アプリ本体）を表示 -->
    <slot v-if="consentGiven"></slot>
  </div>
</template>

<script>
export default {
  name: "CookieConsent",
  data() {
    return {
      consentKey: "cookie_consent",
      consentGiven: false,
      externalHtml: "",
    };
  },
  methods: {
    hasCookieConsent() {
      return document.cookie.includes(`${this.consentKey}=true`);
    },
    setCookieConsent(value) {
      const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
      document.cookie = `${this.consentKey}=${value}; path=/; expires=${expires}`;
    },
    async loadExternalHtml() {
      try {
        const res = await fetch("/api/fallback");
        if (!res.ok) throw new Error("サーバーからHTML取得失敗");
        const htmlText = await res.text();
        const bodyMatch = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : htmlText;

        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;
        while ((styleMatch = styleRegex.exec(htmlText)) !== null) {
          const styleEl = document.createElement("style");
          styleEl.textContent = styleMatch[1];
          document.head.appendChild(styleEl);
        }
        this.externalHtml = bodyContent;
      } catch (e) {
        this.externalHtml =
          '<p style="padding:1em;color:red;">外部HTMLの読み込みに失敗しました。</p>';
        console.error(e);
      }
    },
    acceptCookies() {
      this.setCookieConsent(true);
      document.cookie = "streamTypeCookie=; path=/;"; // 不要cookie削除
      this.consentGiven = true;
      this.$emit("consent-given");
    },
    declineCookies() {
      this.setCookieConsent(false);
      this.externalHtml =
        '<p style="padding:1em;text-align:center;color:red;">Cookieが拒否されました。<br>利用するにはCookieを有効にしてください。</p>';
    },
  },
  mounted() {
    if (this.hasCookieConsent()) {
      this.consentGiven = true;
    } else {
      this.loadExternalHtml();
    }
  },
};
</script>

<style scoped>
/* 外部HTML */
.fallback-content {
  width: 100vw;
  height: 100vh;
  overflow: auto;
}

/* 背景オーバーレイ */
.cookie-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* ポップアップ本体 */
.cookie-popup {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  animation: slide-up 0.3s ease-out;
}

.cookie-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.cookie-message {
  font-size: 14px;
  color: #444;
  margin-bottom: 16px;
}

/* ボタンエリア */
.cookie-actions {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  flex-wrap: wrap;
}

.accept-btn,
.decline-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.accept-btn {
  background-color: #0078d4;
  color: white;
}
.accept-btn:hover {
  background-color: #005fa3;
  transform: scale(1.03);
}

.decline-btn {
  background-color: #f0f0f0;
  color: #444;
}
.decline-btn:hover {
  background-color: #e0e0e0;
  transform: scale(1.03);
}

/* ポップアップアニメーション */
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 表示/非表示のトランジション */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}
.popup-fade-enter,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
