<template>
  <section class="comments-section">
    <h2 v-if="totalCommentCount !== null" class="comment-title">
      💬 コメント ({{ totalCommentCount }})
    </h2>

    <!-- ローディングスケルトン -->
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton" v-for="n in 3" :key="n"></div>
    </div>

    <!-- コメントリスト -->
    <ul v-else-if="comments.length > 0" class="comment-list">
      <transition-group name="fade" tag="div">
        <li v-for="(c, i) in comments" :key="c.id || i" class="comment-item">
          <img
            v-if="c.authorIcon"
            :src="c.authorIcon"
            alt="アイコン"
            class="comment-author-icon"
            width="40"
            height="40"
            loading="lazy"
          />
          <div class="comment-content">
            <div class="comment-header">
              <div class="comment-author">{{ c.author }}</div>
              <span class="comment-meta comment-date">{{ c.date }}</span>
            </div>

            <!-- コメントテキスト -->
            <transition name="expand">
              <div
                v-show="true"
                class="comment-text"
                :class="{ clamped: c.isClamped && !c.isExpanded, expanded: c.isExpanded }"
                :data-index="i"
              >
                {{ c.text }}
              </div>
            </transition>

            <!-- もっと見る / 閉じるボタン -->
            <button
              v-if="c.isClamped"
              @click="toggleExpand(i)"
              class="read-more-btn"
              type="button"
            >
              {{ c.isExpanded ? "閉じる" : "もっと見る" }}
            </button>

            <div class="comment-meta">
              <button class="like-btn" @click="likeComment(i)">
                👍 {{ c.likes }}
              </button>
            </div>
          </div>
        </li>
      </transition-group>
    </ul>

    <p v-else-if="!error" class="no-comment">コメントが見つかりません。</p>

    <!-- エラー表示 -->
    <div v-if="error" class="error-card">
      ⚠️ {{ error }}
      <button @click="fetchComments" class="retry-btn" type="button">
         再取得
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "Comment",
  props: {
    videoId: { type: String, required: true },
  },
  data() {
    return {
      comments: [],
      totalCommentCount: null,
      error: null,
      loading: false,
    };
  },
  watch: {
    videoId: { immediate: true, handler() { this.fetchComments(); } },
  },
  mounted() {
    this.$nextTick(() => this.checkCommentsHeight());
  },
  updated() {
    this.$nextTick(() => this.checkCommentsHeight());
  },
  methods: {
    async fetchComments() {
      this.error = null;
      this.comments = [];
      this.totalCommentCount = null;
      this.loading = true;
      try {
        const res = await fetch(`/api/comments/${this.videoId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        this.totalCommentCount = data.totalCommentCount ?? null;
        if (Array.isArray(data.comments)) {
          this.comments = data.comments.map((c, index) => ({
            id: c.id || index,
            author: c.author || "匿名",
            authorIcon: c.authorIcon || null,
            text: c.text || "",
            date: c.date || "",
            likes: c.likes ?? 0,
            isExpanded: false,
            isClamped: false,
          }));
        }
      } catch (err) {
        console.error("コメント取得エラー:", err);
        this.error = "コメントを読み込めませんでした。";
      } finally {
        this.loading = false;
      }
    },
    checkCommentsHeight() {
      const commentTextElements = this.$el.querySelectorAll(".comment-text");
      commentTextElements.forEach((el) => {
        const index = Number(el.dataset.index);
        if (index === undefined || !this.comments[index]) return;
        const height = el.scrollHeight;
        this.comments[index].isClamped = height > 250;
        if (!this.comments[index].isExpanded && height <= 250) {
          this.comments[index].isClamped = false;
        }
      });
    },
    toggleExpand(index) {
      const comment = this.comments[index];
      comment.isExpanded = !comment.isExpanded;
    },
    likeComment(index) {
      this.comments[index].likes++;
    },
  },
};
</script>

<style scoped>
.comment-title {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 12px;
}

.comments-section {
  padding: 16px;
  border-radius: 12px;
  background: #fafafa;
}

/* コメントリスト */
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.comment-author-icon {
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.comment-author-icon:hover {
  transform: scale(1.1);
}

.comment-text.clamped {
  max-height: 250px;
  overflow: hidden;
}
.comment-text.expanded {
  max-height: none;
  overflow: visible;
}

.read-more-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 4px;
}
.read-more-btn:hover {
  text-decoration: underline;
}

.like-btn {
  background: #f4f4f4;
  border: none;
  border-radius: 8px;
  padding: 2px 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.like-btn:hover {
  background: #e2e2e2;
}

/* スケルトン */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton {
  height: 60px;
  background: linear-gradient(90deg,#e0e0e0 25%,#f5f5f5 50%,#e0e0e0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-card {
  background: #ffecec;
  color: #d9534f;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.retry-btn {
  margin-top: 8px;
  background: #d9534f;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.retry-btn:hover {
  background: #c9302c;
}

/* アニメーション */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.expand-enter-active, .expand-leave-active {
  transition: max-height 0.3s ease;
}
</style>
