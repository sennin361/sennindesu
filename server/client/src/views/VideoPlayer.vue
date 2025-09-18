<template>
  <div class="page-container">
    <div class="main-content" v-if="video">
      <!-- 動画プレイヤー -->
      <div class="video-wrapper">
        <StreamPlayer :videoId="videoId" :streamType="resolvedStreamType" />
      </div>

      <!-- タイトルとメタ情報 -->
      <h1 class="video-title" ref="videoTitle">{{ title }}</h1>
      <div class="video-info channel-info">
        <router-link :to="`/channel/${authorId}`" class="channel-icon-link">
          <img
            :src="authorThumbnailUrl"
            alt="チャンネルアイコン"
            class="channel-icon"
            @error="onImageError($event, authorId)"
          />
        </router-link>
        <div class="channel-text">
          <router-link :to="`/channel/${authorId}`" class="channel-name">
            {{ authorName }}
          </router-link>
          <p class="subscriber-count">{{ subscriberCount }}</p>
        </div>

        <!-- 再生モード切替ドロップダウン -->
        <div class="custom-dropdown" @click="toggleDropdown">
          <span class="custom-dropdown-label">
            {{
              !resolvedStreamType
                ? "再生モードを選択"
                : resolvedStreamType === "1"
                ? "標準再生"
                : resolvedStreamType === "2"
                ? "互換再生"
                : "再生モードを選択"
            }}
            <span class="dropdown-ending">▼</span>
          </span>

          <transition name="fade">
            <div v-if="isDropdownOpen" class="custom-dropdown-menu">
              <div class="custom-dropdown-item" @click.stop="selectStreamType('1')">
                通常再生
              </div>
              <div class="custom-dropdown-item danger" @click.stop="selectStreamType('2')">
                互換再生モード
              </div>
            </div>
          </transition>
        </div>

        <!-- ダウンロードボタン -->
        <button class="download-btn" @click="switchStream">
          <span>⬇</span> ダウンロード
        </button>
      </div>

      <!-- メタ情報 -->
      <div class="meta-box">
        <span>{{ viewCount.replace(/\s+/g, '') }}</span>・
        <span>高評価数 {{ likeCount }}</span>
        <span class="dot">・</span>
        <span>{{ relativeDate }}</span>
      </div>

      <!-- 説明欄 -->
      <div class="video-description">
        <div v-if="!showFullDescription" class="description-preview">
          <p v-if="descriptionRun0">{{ descriptionRun0 }}</p>
          <p v-if="descriptionRun1">{{ descriptionRun1 }}</p>
        </div>
        <div v-else class="description-full" v-html="formattedDescription"></div>
        <span class="description-toggle" @click="toggleDescription">
          {{ showFullDescription ? "一部を表示" : "...もっと見る" }}
        </span>
      </div>

      <!-- コメント -->
      <Comment :videoId="videoId" />
    </div>

    <!-- 関連動画 -->
    <aside v-if="relatedVideos.length" class="related-section">
      <PlaylistComponent
        v-if="playlistId"
        displayType="watch"
        :playlistId="playlistId"
        :playVideoId="videoId"
      />
      <h3 class="related-title">関連動画</h3>
      <ul class="related-list">
        <li
          v-for="r in relatedVideos"
          :key="r.videoId"
          class="related-item"
          @mouseenter="hoverId = r.videoId"
          @mouseleave="hoverId = null"
        >
          <router-link :to="r.replaylistId && r.replaylistId.length > 20 ? `/watch?v=${r.videoId}&list=${r.replaylistId}` : `/watch?v=${r.videoId}`" class="page-link">
            <div class="thumb-wrapper">
              <img
                :class="{ 'hovered': hoverId === r.videoId }"
                :src="'data:image/jpeg;base64,' + r.base64imge"
                :alt="r.title"
                class="thumb-img"
                @error="onImageError($event, r.videoId)"
              />
              <span v-if="r.badge" class="duration-badge" :class="{ 'badge-live': r.badge.toLowerCase().includes('ライブ') }">
                {{ r.badge }}
              </span>
            </div>
            <div class="video-info">
              <span class="video-title-related" :title="r.title">{{ r.title }}</span>
              <div class="video-metadata">
                <div class="one-line re-actername">{{ r.metadataRow1 }}</div>
                <span v-if="r.metadataRow2Part1">{{ r.metadataRow2Part1 }}</span>
                <span v-if="r.metadataRow2Part2" class="dot">・</span>{{ r.metadataRow2Part2 }}
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import PlaylistComponent from "@/components/Playlist.vue";
import Comment from "@/components/Comment.vue";
import StreamPlayer from "@/components/StreamPlayer.vue";

window.scrollTo(0, 0);
const route = useRoute();
const videoId = computed(() => route.query.v);
const playlistId = computed(() => route.query.list);
const currentType = ref('1');
function switchStream() { currentType.value = '3'; }
</script>

<script>
export default {
  /* 省略: props, data, computed, methods, watch は前回と同じ */
};
</script>

<style scoped>
/* ▼▼ UI強化 ▼▼ */
.custom-dropdown {
  background: #f8f8f8;
  border: 1px solid #ddd;
  transition: 0.2s ease;
}
.custom-dropdown:hover {
  background: #ececec;
}
.custom-dropdown-menu {
  animation: dropdownFade 0.2s ease;
}
.custom-dropdown-item.danger {
  color: red;
}
.download-btn {
  margin-left: auto;
  background: #065fd4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}
.download-btn:hover {
  background: #0449a4;
}
.thumb-img.hovered {
  transform: scale(1.05);
  transition: 0.3s ease;
}
@keyframes dropdownFade {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 既存CSSは維持、必要箇所のみ調整 */
</style>
