import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/ArticleWiki/',
  title: "议论文人物素材库",
  description: "专注于议论文人物素材收集、整理和检索的文档系统",
  head: [
    ['link', { rel: 'icon', href: '/ArticleWiki/icon/favicon.svg' }],
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
      '/materials/人物素材/': [
        {
          text: '人物素材',
          items: [
            { text: '人物素材首页', link: '/materials/人物素材/' },
            { text: '中村修二', link: '/materials/人物素材/中村修二' },
            { text: '威廉·勒梅修里尔', link: '/materials/人物素材/威廉·勒梅修里尔' },
            { text: '弗雷德里克·图多·戈里', link: '/materials/人物素材/弗雷德里克·图多·戈里' },
            { text: '梁文峰', link: '/materials/人物素材/梁文峰' },
            { text: 'Paper2Gal开发者', link: '/materials/人物素材/Paper2Gal开发者' },
            { text: '泰奥·杨森', link: '/materials/人物素材/泰奥·杨森' },
            { text: '马丁·路德·金', link: '/materials/人物素材/马丁·路德·金' },
            { text: '马科长', link: '/materials/人物素材/马科长' },
          ]
        }
      ],
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
