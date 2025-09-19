<template>
  <section v-if="error" class="error-message">
    プレイリストの取得に失敗しました。
  </section>

  <section v-else-if="playlist" class="playlist-section" :class="`type-${displayType}`">
    <template v-if="displayType !== 'channel'">
      <h2 class="playlist-title fade-in">{{ playlist.title }}</h2>
      <p class="playlist-meta fade-in">
        動画本数: {{ playlist.totalItems }}
        <span class="views" v-if="displayType !== 'watch'">｜再生数: {{ playlist.views }}回</span>
      </p>
    </template>

    <div ref="scrollContainer" class="playlist-items-scroll" :class="`scroll-${displayType}`">
      <div
        v-for="(item, idx) in playlist.items"
        :key="item.videoId || idx"
        class="playlist-item hover-zoom"
        :class="{ active: item.videoId === playVideoId }"
        :data-video-id="item.videoId"
      >
        <router-link
          :to="displayType !== 'channel' ? `/watch?v=${item.videoId}&list=${playlist.playlistId}` : `/watch?v=${item.videoId}`"
          class="video-link"
        >
          <div v-if="displayType === 'watch'" class="watch-layout">
            <div class="thumbnail-wrapper small-thumb">
              <img
                :src="item.thumbnail || getPrimaryThumbnail(item.videoId)"
                alt="動画サムネイル"
                class="thumbnail"
                @error="onImageError($event, item.videoId)"
              />
              <span class="duration" v-if="item.duration">{{ item.duration }}</span>
            </div>
            <div class="text-content">
              <p class="title fade-in" :title="item.title">{{ item.title }}</p>
              <p class="author fade-in">{{ item.author }}</p>
            </div>
          </div>

          <div v-else>
            <div class="thumbnail-wrapper">
              <img
                :src="item.thumbnail || getPrimaryThumbnail(item.videoId)"
                alt="動画サムネイル"
                class="thumbnail"
                @error="onImageError($event, item.videoId)"
              />
              <span class="duration" v-if="item.duration">{{ item.duration }}</span>
            </div>
            <p class="title fade-in" :title="item.title">{{ item.title }}</p>
            <p class="author fade-in">{{ item.author }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </section>

  <section v-else>
    <div class="skeleton-container">
      <div v-for="n in 6" :key="n" class="skeleton-item"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  playlistId: String,
  playVideoId: String,
  displayType: {
    type: String,
    default: "default",
  },
});

const route = useRoute();
const playlist = ref(null);
const loading = ref(false);
const error = ref(false);
const scrollContainer = ref(null);

const playlistId = computed(() => props.playlistId || route.query.list || "");
const playVideoId = computed(() => props.playVideoId || route.query.play || "");
const displayType = computed(() => props.displayType || route.query.type || "default");

onMounted(async () => {
  if (!playlistId.value) {
    error.value = true;
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`/api/playlist/${playlistId.value}`);
    if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`);
    playlist.value = await res.json();

    if (displayType.value !== "watch" && displayType.value !== "channel" && playlist.value?.title) {
      document.title = `${playlist.value.title} - プレイリスト`;
    }

    await nextTick();

    if (playVideoId.value && scrollContainer.value) {
      const containerEl = scrollContainer.value;
      const target = containerEl.querySelector(`.playlist-item[data-video-id="${playVideoId.value}"]`);
      if (target) {
        const containerRect = containerEl.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;
        const scrollOffset =
          containerEl.scrollTop + relativeTop - containerEl.clientHeight / 2 + target.clientHeight / 2;
        containerEl.scrollTo({ top: scrollOffset, behavior: "smooth" });
      }
    }
  } catch (err) {
    console.error("プレイリスト取得失敗:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

function getPrimaryThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
}

function onImageError(event, id) {
  if (!event.target.dataset.error) {
    event.target.src = `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
    event.target.dataset.error = "true";
  }
}
</script>

<style scoped>
.playlist-item.active {
  background-color: #d8f5e7;
  border-left: 4px solid #16a34a;
  transform: scale(1.02);
  transition: 0.2s ease-in-out;
}

.playlist-item.hover-zoom:hover {
  transform: scale(1.03);
  background: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}

.playlist-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.9rem;
}

.type-watch {
  background-color: transparent;
  border: 1px solid #ccc; 
  border-radius: 8px;
  padding: 0.9rem;
  max-width: 380px;
}

.playlist-title {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
  font-weight: bold;
}

.playlist-meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.scroll-watch {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  max-height: 420px;
  padding-right: 6px;
  scrollbar-width: thin;
}

.scroll-watch::-webkit-scrollbar {
  width: 6px;
}
.scroll-watch::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.5rem;
  margin-block: 10px; 
}

.thumbnail-wrapper.small-thumb {
  width: 160px;
  aspect-ratio: 16 / 9;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-in-out;
}

.hover-zoom:hover .thumbnail {
  transform: scale(1.08);
}

.duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 0.75rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 5px;
  border-radius: 4px;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 1rem;
}
.skeleton-item {
  height: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 37%, #f0f0f0 63%);
  border-radius: 8px;
  animation: skeleton-loading 1.5s infinite;
}
@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
</style>
