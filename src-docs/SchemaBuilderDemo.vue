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

export default {
  data() {
    return {
      builder: null,
      view: 'visual',
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
            price: { type: 'number', exclusiveMinimum: 0 },
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
    this.initBuilder()
  },
  beforeUnmount() {
    if (this.builder) {
      this.builder.destroy()
      this.builder = null
    }
  },
  methods: {
    initBuilder() {
      if (this.builder) {
        this.builder.destroy()
        this.builder = null
      }
      this.builder = new SchemaBuilder({
        container: this.$refs.container,
        view: this.view,
        schema: this.presets.Contact
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
