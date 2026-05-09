<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  token: string
}>()

const categoryOptions = [
  { value: '人物素材', label: '人物素材' },
  { value: '事件素材', label: '事件素材' },
  { value: '名言警句', label: '名言警句' },
  { value: '历史典故', label: '历史典故' },
  { value: '科学研究', label: '科学研究' },
  { value: '社会热点', label: '社会热点' },
]

const title = ref('')
const category = ref('人物素材')
const tags = ref('')
const content = ref('')
const source = ref('')
const submitting = ref(false)
const result = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const REPO_OWNER = 'YangZiyueZY'
const REPO_NAME = 'ArticleWiki'

function formatFileName(title: string): string {
  return title.trim().replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '')
}

function buildMarkdown(): string {
  const tagList = tags.value
    .split(/[,，、\s]+/)
    .filter(Boolean)
    .map(t => t.trim())

  const lines: string[] = []
  lines.push('---')
  if (tagList.length) {
    lines.push(`tags: [${tagList.map(t => `"${t}"`).join(', ')}]`)
  }
  if (source.value) {
    lines.push(`source: "${source.value}"`)
  }
  lines.push('---')
  lines.push('')
  lines.push(content.value)

  return lines.join('\n')
}

async function submit() {
  if (!title.value.trim()) {
    result.value = { type: 'error', message: '请输入素材标题' }
    return
  }
  if (!content.value.trim()) {
    result.value = { type: 'error', message: '请输入素材内容' }
    return
  }

  submitting.value = true
  result.value = null

  const fileName = formatFileName(title.value)
  const filePath = `docs/materials/${category.value}/${fileName}.md`
  const fileContent = buildMarkdown()
  const branchName = `upload/${fileName}-${Date.now()}`

  try {
    const headers = {
      Authorization: `Bearer ${props.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }

    // 1. Get the default branch reference SHA
    const refRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`,
      { headers }
    )
    if (!refRes.ok) throw new Error('获取仓库信息失败')
    const refData = await refRes.json()
    const mainSha = refData.object.sha

    // 2. Create a new branch
    const branchRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: mainSha,
        }),
      }
    )
    if (!branchRes.ok) throw new Error('创建分支失败')

    // 3. Create the file on the new branch
    const createRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `上传素材: ${title.value}`,
          content: btoa(unescape(encodeURIComponent(fileContent))),
          branch: branchName,
        }),
      }
    )
    if (!createRes.ok) throw new Error('创建素材文件失败')

    // 4. Create a Pull Request
    const prRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `上传素材: ${title.value}`,
          head: branchName,
          base: 'main',
          body: `## 素材信息\n\n- **标题**: ${title.value}\n- **分类**: ${category.value}\n- **标签**: ${tags.value || '无'}\n- **来源**: ${source.value || '未注明'}\n\n由 [${JSON.parse(localStorage.getItem('github_user') || '{}').login || '用户'}] 通过在线表单提交。`,
        }),
      }
    )
    if (!prRes.ok) throw new Error('创建 Pull Request 失败')
    const prData = await prRes.json()

    result.value = {
      type: 'success',
      message: `素材提交成功！已创建 Pull Request #${prData.number}。`,
    }

    // Reset form
    title.value = ''
    tags.value = ''
    content.value = ''
    source.value = ''
  } catch (e: any) {
    result.value = {
      type: 'error',
      message: e.message || '提交失败，请重试',
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="upload-form">
    <div class="form-section">
      <label class="form-label">
        素材标题 <span class="required">*</span>
      </label>
      <input
        v-model="title"
        type="text"
        class="form-input"
        placeholder="例：爱因斯坦"
        :disabled="submitting"
      />
    </div>

    <div class="form-section">
      <label class="form-label">素材分类</label>
      <select v-model="category" class="form-select" :disabled="submitting">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="form-section">
      <label class="form-label">来源</label>
      <input
        v-model="source"
        type="text"
        class="form-input"
        placeholder="素材出处或参考来源"
        :disabled="submitting"
      />
    </div>

    <div class="form-section">
      <label class="form-label">标签</label>
      <input
        v-model="tags"
        type="text"
        class="form-input"
        placeholder="用逗号分隔，如：科技创新, 诺贝尔奖, 坚持"
        :disabled="submitting"
      />
      <p class="form-hint">多个标签请用逗号分隔</p>
    </div>

    <div class="form-section">
      <label class="form-label">
        素材内容 <span class="required">*</span>
      </label>
      <textarea
        v-model="content"
        class="form-textarea"
        placeholder="支持 Markdown 格式&#10;&#10;示例：&#10;## 人物简介&#10;&#10;爱因斯坦（Albert Einstein，1879年3月14日—1955年4月18日）...&#10;&#10;## 核心贡献&#10;&#10;- 相对论&#10;- 质能方程 E=mc²&#10;&#10;## 议论文运用角度&#10;&#10;可用于论证「创新思维」「坚持不懈」等主题"
        rows="15"
        :disabled="submitting"
      ></textarea>
    </div>

    <div v-if="result" :class="['result-msg', result.type]">
      {{ result.message }}
      <a v-if="result.type === 'success'" :href="`https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls`" target="_blank" rel="noopener">
        查看 Pull Request
      </a>
    </div>

    <div class="form-actions">
      <button
        class="submit-btn"
        @click="submit"
        :disabled="submitting || !token"
      >
        {{ submitting ? '提交中...' : '提交素材' }}
      </button>
    </div>

    <div class="submit-info">
      <p>提交后系统将自动创建 Pull Request，审核通过后即可合并到主仓库。</p>
    </div>
  </div>
</template>

<style scoped>
.upload-form {
  max-width: 700px;
}

.form-section {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.required {
  color: var(--vp-c-danger-1);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  line-height: 1.6;
}

.form-hint {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.form-actions {
  margin-top: 1.5rem;
}

.submit-btn {
  padding: 0.65rem 2rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-msg {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.result-msg.success {
  background: var(--vp-c-tip-soft);
  color: var(--vp-c-tip-1);
  border: 1px solid var(--vp-c-tip-1);
}

.result-msg.error {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  border: 1px solid var(--vp-c-danger-1);
}

.result-msg a {
  color: inherit;
  font-weight: 500;
  text-decoration: underline;
}

.submit-info {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.submit-info p {
  margin: 0;
}
</style>
