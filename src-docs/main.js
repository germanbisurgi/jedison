import { createApp } from 'vue'
import App from './App.vue'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

// @milkdown/crepe ships ESM-only (no UMD/global build like Quill/Jodit/Ace), so
// there's no window.Crepe the way there's a window.Quill/window.Jodit. Exposing it
// here as window.Milkdown keeps string-milkdown.js's resolves() check consistent
// with every other peer editor's "is the global present" pattern.
window.Milkdown = { Crepe, replaceAll }

const app = createApp(App)
app.mount('#app')
