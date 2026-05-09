import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getMaterialsSidebar(baseDir: string, categoryPath: string) {
  const absDir = path.resolve(__dirname, '..', baseDir, categoryPath)
  let files: string[] = []
  try {
    files = fs.readdirSync(absDir)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  } catch {
    files = []
  }

  const prefix = `/${baseDir}/${categoryPath}/`

  return [
    {
      text: '人物素材',
      items: [
        { text: '人物素材首页', link: `${prefix}` },
        ...files.map(f => ({
          text: f.replace('.md', ''),
          link: `${prefix}${f.replace('.md', '')}`,
        })),
      ],
    },
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "议论文人物素材库",
  description: "专注于议论文人物素材收集、整理和检索的文档系统",
  head: [
    ['link', { rel: 'icon', href: '/icon/favicon.svg' }],
  ],
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: "/icon/favicon.svg",
    lastUpdated: {
      text: '最后更新于'
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "人物素材", link: "/materials/人物素材/" },
      { text: "上传素材", link: "/upload" },
    ],
    sidebar: {
      '/materials/人物素材/': getMaterialsSidebar('materials', '人物素材'),
      '/materials/': [
        {
          text: '素材库',
          items: [
            { text: '人物素材', link: '/materials/人物素材/' },
          ]
        }
      ],
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 ArticleWiki'
    },
    editLink: {
      pattern: 'https://github.com/YangZiyueZY/ArticleWiki/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    darkModeSwitchLabel:'亮/暗模式',
    lightModeSwitchTitle:'调整为亮色模式',
    darkModeSwitchTitle:'调整为暗色模式',
    sidebarMenuLabel:'菜单',
    returnToTopLabel:'回到顶部',
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YangZiyueZY/ArticleWiki' },
    ]
  }
})
