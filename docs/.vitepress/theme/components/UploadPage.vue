<script setup lang="ts">
import { ref } from 'vue'
import GitHubLogin from './GitHubLogin.vue'
import UploadForm from './UploadForm.vue'

const token = ref('')

function onLogin(t: string) {
  token.value = t
}
</script>

<template>
  <div class="upload-page">
    <h1>上传素材</h1>
    <p class="page-desc">
      提交新的议论文素材到素材库。需要先登录 GitHub，提交后会自动创建 Pull Request，审核通过后即可入库。
    </p>

    <div class="upload-card">
      <GitHubLogin @login="onLogin" />

      <div v-if="token" class="upload-body">
        <div class="divider">
          <span>填写素材信息</span>
        </div>
        <UploadForm :token="token" />
      </div>

      <div v-else class="upload-prompt">
        <p>请先使用 GitHub 登录以提交素材</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.upload-page h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.page-desc {
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.upload-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
}

.upload-body {
  margin-top: 0.5rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--vp-c-border);
}

.upload-prompt {
  text-align: center;
  padding: 2rem 0;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}
</style>
