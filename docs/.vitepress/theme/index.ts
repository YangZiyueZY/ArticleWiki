import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import UploadPage from './components/UploadPage.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('UploadPage', UploadPage)
  },
} satisfies Theme
