<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  login: [token: string]
}>()

const showInput = ref(false)
const tokenInput = ref('')
const verifying = ref(false)
const error = ref('')
const token = ref('')
const userData = ref<{ login: string; avatar_url: string } | null>(null)

function readFromStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

function writeToStorage(key: string, value: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

function removeFromStorage(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}

onMounted(() => {
  const savedToken = readFromStorage('github_token')
  if (savedToken) {
    token.value = savedToken
    emit('login', savedToken)
  }
  const savedUser = readFromStorage('github_user')
  if (savedUser) {
    try {
      userData.value = JSON.parse(savedUser)
    } catch { /* ignore */ }
  }
})

function startLogin() {
  showInput.value = true
  error.value = ''
}

function cancel() {
  showInput.value = false
  tokenInput.value = ''
  error.value = ''
}

async function verifyToken() {
  const pat = tokenInput.value.trim()
  if (!pat) {
    error.value = '请输入 GitHub Personal Access Token'
    return
  }

  verifying.value = true
  error.value = ''

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Token 无效，请检查后重试')
      }
      throw new Error(`GitHub API 错误: ${res.status}`)
    }

    const user = await res.json()
    writeToStorage('github_token', pat)
    writeToStorage('github_user', JSON.stringify(user))
    userData.value = user
    token.value = pat
    showInput.value = false
    emit('login', pat)
  } catch (e: any) {
    error.value = e.message || '验证失败'
  } finally {
    verifying.value = false
  }
}

function logout() {
  removeFromStorage('github_token')
  removeFromStorage('github_user')
  userData.value = null
  token.value = ''
  tokenInput.value = ''
  showInput.value = false
}

</script>

<template>
  <div class="github-login">
    <div v-if="!token" class="login-prompt">
      <button class="login-btn" @click="startLogin" :disabled="verifying">
        <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        登录 GitHub
      </button>
      <div class="login-hint">
        需要 GitHub Personal Access Token 以提交素材
      </div>
    </div>

    <div v-else class="logged-in">
      <div class="user-info">
        <img :src="userData?.avatar_url + '&s=24'" class="avatar" v-if="userData" />
        <span class="username">{{ userData?.login || '已登录' }}</span>
      </div>
      <button class="logout-btn" @click="logout">退出</button>
    </div>

    <div v-if="showInput" class="token-modal-overlay" @click.self="cancel">
      <div class="token-modal">
        <h3>GitHub 登录</h3>
        <p class="token-desc">
          请输入你的 GitHub Personal Access Token。
          <a href="https://github.com/settings/tokens/new?scopes=repo,public_repo&description=ArticleWiki" target="_blank" rel="noopener">
            创建 Token →
          </a>
        </p>
        <input
          v-model="tokenInput"
          type="password"
          class="token-input"
          placeholder="输入你的 GitHub Personal Access Token"
          @keyup.enter="verifyToken"
          :disabled="verifying"
        />
        <p class="token-help">
          需要 <code>public_repo</code> 权限
        </p>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancel" :disabled="verifying">取消</button>
          <button class="confirm-btn" @click="verifyToken" :disabled="verifying">
            {{ verifying ? '验证中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.github-login {
  margin-bottom: 1.5rem;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: #24292f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #1b1f23;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.github-icon {
  width: 18px;
  height: 18px;
}

.login-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.logged-in {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.logout-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-2);
}

.token-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.token-modal {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.token-modal h3 {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}

.token-desc {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.token-desc a {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.token-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}

.token-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.token-help {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.token-help code {
  background: var(--vp-c-bg-soft);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.78rem;
}

.error-msg {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  border-radius: 6px;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.cancel-btn, .confirm-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
}

.cancel-btn:hover {
  border-color: var(--vp-c-text-2);
  color: var(--vp-c-text-1);
}

.confirm-btn {
  background: var(--vp-c-brand-1);
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
