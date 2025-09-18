<template>
  <div class="header-wrapper fixed-header">
    <button
      type="button"
      class="home-button"
      @click="$router.push('/')"
      aria-label="トップページへ戻る"
    >
      ホーム
    </button>

    <form @submit.prevent="onSubmit" class="header-search" ref="searchFormRef">
      <input
        type="text"
        v-model="query"
        @input="onInput"
        @keydown.down.prevent="moveSelection(1)"
        @keydown.up.prevent="moveSelection(-1)"
        @keydown.enter.prevent="onEnter"
        placeholder="キーワードを入力..."
        autocomplete="off"
        class="search-input"
        aria-label="Search"
      />
      <!-- 🔍クリアボタンの位置を中央寄せに修正 -->
      <button
        v-if="query"
        type="button"
        class="clear-button"
        @click="clearQuery"
        aria-label="入力をクリア"
      >
        ×
      </button>

      <button type="submit" class="search-button" aria-label="検索">
        <img
          src="https://raw.githubusercontent.com/siawaseok3/siawaseok3.github.io/refs/heads/main/%E6%A4%9C%E7%B4%A2%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3.png"
          alt="🔍"
          style="width: 20px; height: 20px"
        />
      </button>

      <ul v-if="suggestions.length" class="suggestions-list" role="listbox">
        <li
          v-for="(item, index) in suggestions"
          :key="index"
          :class="{ selected: index === selectedIndex }"
          @mousedown.prevent="onSuggestionClick(index)"
          role="option"
          :aria-selected="index === selectedIndex"
        >
          {{ item }}
        </li>
      </ul>
    </form>
  </div>
</template>

<style scoped>
.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 54px;
  position: fixed;
  top: 0;
  left: 0;
}

.home-button {
  border: none;
  background: #e0e0e0;
  color: #4e4d4d;
  font-size: 16px;
  border-radius: 20px;
  padding: 0 1rem;
  height: 36px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.home-button:hover {
  background: #b0b0b0;
}

.header-search {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  height: 40px;
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 5px 12px;
  line-height: 28px;
  border-radius: 20px 0 0 20px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.clear-button {
  position: absolute;
  right: 2.8em;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
  color: #777;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: #000;
}

.search-button {
  border-radius: 0 20px 20px 0;
  border: 1px solid #ccc;
  border-left: none;
  background-color: #f8f8f8;
  cursor: pointer;
  padding: 0 0.75em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background-color: #eaeaea;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 0 0 10px 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.suggestions-list li {
  padding: 0.6em 1em;
  cursor: pointer;
  font-size: 0.95rem;
}

.suggestions-list li.selected,
.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>
