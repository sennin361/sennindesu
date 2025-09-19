<style scoped>
a,
.router-link,
.router-link-exact-active,
.channel-link,
.title-link,
.thumbnail-link {
  text-decoration: none;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: "Noto Sans JP", Meiryo, "メイリオ", sans-serif;
}

.title-link {
  color: #000000;
}

/* グリッドレイアウト強化 */
.video-list {
  list-style: none;
  padding: 5px;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}

/* 動画カード */
.video-item {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.video-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
}

/* サムネイル */
.thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background-color: #f0f0f0;
  overflow: hidden;
}

.thumbnail-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.video-item:hover .thumbnail-wrapper img {
  transform: scale(1.03);
}

/* 再生時間ラベル */
.thumbnail-wrapper::after {
  content: attr(data-duration);
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* チャンネル専用 */
.channel-thumbnail-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.2rem 0 0.5rem 0;
}

.channel-icon-large {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
  transition: transform 0.2s ease;
}

.video-item:hover .channel-icon-large {
  transform: scale(1.05);
}

/* 情報部分 */
.info {
  padding: 0.8rem 1rem 1rem 1rem;
}

.info h3 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  line-height: 1.4;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.info h3 a:hover {
  color: #0077ff;
  text-decoration: underline;
}

/* 動画用チャンネル情報 */
.channel-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  color: #000;
}

.channel-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
}

.channel-info:hover .channel-icon {
  transform: scale(1.1);
}

.info p {
  font-size: 0.85rem;
  color: #666;
  margin: 0.2rem 0;
}

/* 登録者数表示 */
.subscriber-count {
  font-weight: bold;
  color: #444;
  margin-top: 0.4rem;
}
</style>
