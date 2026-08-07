<template>
  <div>
    <div class="row mb-3">
      <div class="col-md-4">
        <div class="form-group mb-0">
          <label for="builder-view"><code>view</code></label>
          <select class="form-control" id="builder-view" v-model="view" @change="initBuilder()">
            <option value="visual">visual</option>
            <option value="text">text</option>
          </select>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group mb-0">
          <label for="builder-theme"><code>theme</code></label>
          <select class="form-control" id="builder-theme" v-model="theme" @change="onThemeChange()">
            <option value="bootstrap3">bootstrap3</option>
            <option value="bootstrap4">bootstrap4</option>
            <option value="bootstrap5">bootstrap5</option>
            <option value="barebones">barebones</option>
          </select>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group mb-0">
          <div class="form-check mt-2">
            <input type="checkbox" class="form-check-input" id="builder-composition" v-model="enableComposition" @change="initBuilder()">
            <label class="form-check-label" for="builder-composition"><code>enableComposition</code></label>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-group mb-3">
      <button
        v-for="(preset, name) in presets"
        :key="name"
        class="btn btn-outline-primary"
        type="button"
        @click="loadPreset(name)"
      >
        {{ name }}
      </button>
    </div>

    <div ref="container"></div>

    <div v-if="view === 'visual'" class="form-group mb-3">
      <label for="builder-json"><code>schema</code> (live)</label>
      <textarea
        ref="json"
        id="builder-json"
        class="form-control"
        wrap="off"
        readonly
        style="font-size: 12px; font-family: monospace; min-height: 200px;"
      ></textarea>
    </div>
  </div>
</template>

<script>
import Jedison from '/src/index.js'
const { SchemaBuilder } = Jedison

const THEME_INSTANCES = {
  bootstrap3: 'ThemeBootstrap3',
  bootstrap4: 'ThemeBootstrap4',
  bootstrap5: 'ThemeBootstrap5',
  barebones: 'Theme'
}

const THEME_STYLESHEETS = {
  bootstrap3: 'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css',
  bootstrap4: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
  bootstrap5: 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
}

function defaultTheme() {
  const theme = new URLSearchParams(window.location.search).get('theme')
  return THEME_INSTANCES[theme] ? theme : 'bootstrap5'
}

export default {
  data() {
    return {
      builder: null,
      view: 'visual',
      theme: defaultTheme(),
      enableComposition: false,
      presets: {
        Contact: {
          title: 'Contact',
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', minLength: 2, description: 'Full name' },
            email: { type: 'string', format: 'email' },
            age: { type: 'integer', minimum: 18, maximum: 99 },
            subscribe: { type: 'boolean', default: true },
            tags: { type: 'array', items: { type: 'string' }, minItems: 0 }
          }
        },
        Product: {
          title: 'Product',
          type: 'object',
          required: ['sku', 'price'],
          properties: {
            sku: { type: 'string', pattern: '^[A-Z]{3}-[0-9]{4}$' },
            name: { type: 'string' },
            price: { type: 'number', exclusiveMinimum: true },
            category: {
              type: 'string',
              enum: ['books', 'electronics', 'clothing', 'toys']
            },
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
                depth: { type: 'number' }
              }
            }
          }
        },
        Survey: {
          title: 'Survey',
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            favorite: {
              type: 'string',
              enum: ['red', 'green', 'blue']
            },
            comments: { type: 'string' }
          }
        }
      }
    }
  },
  mounted() {
    this.ensureStylesheet()
    this.initBuilder()
  },
  beforeUnmount() {
    if (this.builder) {
      this.builder.destroy()
      this.builder = null
    }
  },
  methods: {
    getTheme() {
      return new Jedison[THEME_INSTANCES[this.theme]]()
    },
    ensureStylesheet() {
      const href = THEME_STYLESHEETS[this.theme]
      if (!href) {
        this.removeStylesheets()
        return
      }
      this.removeStylesheets()
      const link = document.createElement('link')
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('href', href)
      link.setAttribute('data-jedi-sb-theme', this.theme)
      document.head.appendChild(link)
    },
    removeStylesheets() {
      document.querySelectorAll('link[data-jedi-sb-theme]').forEach((link) => link.remove())
    },
    onThemeChange() {
      this.ensureStylesheet()
      this.initBuilder()
    },
    initBuilder() {
      if (this.builder) {
        this.builder.destroy()
        this.builder = null
      }
      this.builder = new SchemaBuilder({
        container: this.$refs.container,
        view: this.view,
        enableComposition: this.enableComposition,
        schema: this.presets.Contact,
        theme: this.getTheme()
      })
      this.builder.on('change', () => this.syncJson())
      this.syncJson()
    },
    loadPreset(name) {
      this.builder.setSchema(this.presets[name])
    },
    syncJson() {
      if (this.$refs.json) {
        this.$refs.json.value = JSON.stringify(this.builder.getSchema(), null, 2)
      }
    }
  }
}
</script>
