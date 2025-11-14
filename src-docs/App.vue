<template>
  <div class="container-fluid">
    <header>
      <h1>Playground</h1>
    </header>

    <div class="row">
      <div class="col-xs-12 col-md-12">
        <div class="form-group mb-3">
          <label for="examples">Examples</label>
          <select class="form-control" id="examples" v-model="example" @change="reload">
            <optgroup v-for="(options, category) in examples" :label="category" :key="category">
              <option v-for="(value, key) in options" :value="key" :key="key">
                {{ key }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-xs-12 col-md-4">
        <aside>
          <div class="form-group mb-0">
            <label for="schema"><code>schema</code></label>
            <textarea ref="schema" class="form-control" id="schema" wrap="off" style="font-size: 12px; font-family: monospace; min-height: 400px;"></textarea>
          </div>

          <button class="btn btn-primary btn-block w-100 mb-3" id="set-schema" @click="setSchema()">Set schema</button>

          <br><br>

          <div class="form-group mb-0">
            <label for="data"><code>data</code></label>
            <textarea ref="data" class="form-control" id="data" wrap="off" style="font-size: 12px; font-family: monospace; min-height: 400px;"></textarea>
          </div>

          <button class="btn btn-primary btn-block w-100 mb-3" id="set-data" @click="setData()">Set data</button>

          <br><br>

          <div class="form-group mb-3">
            <label for="theme"><code>theme</code></label>
            <select class="form-control" id="theme" v-model="theme" @change="reload()">
              <option v-for="theme in themes" :value="theme">{{ theme }}</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label for="icon-lib"><code>iconLib</code></label>
            <select class="form-control" id="icon-lib" v-model="iconLib" @change="reload()">
              <option v-for="iconLib in iconLibs" :value="iconLib">{{ iconLib }}</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label for="language"><code>language</code></label>
            <select class="form-control" id="language" v-model="language" @change="reload()">
              <option v-for="language in languageOptions" :value="language">{{ language }}</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label for="show-errors"><code>showErrors</code></label>
            <select class="form-control" id="show-errors" v-model="showErrors" @change="reload()">
              <option v-for="showErrors in showErrorsOptions" :value="showErrors">{{ showErrors }}</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label for="switcher-inputs"><code>switcherInput</code></label>
            <select class="form-control" id="switcher-inputs" v-model="switcherInput" @change="reload()">
              <option v-for="switcherInput in switcherInputOptions" :value="switcherInput">{{ switcherInput }}</option>
            </select>
          </div>

          <br><br>

          <div class="form-group mb-3">
            <input type="checkbox" id="btnContents" v-model="btnContents" @change="initEditor()">
            <label for="btnContents"><code>btnContents</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="btnIcons" v-model="btnIcons" @change="initEditor()">
            <label for="btnIcons"><code>btnIcons</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enablePropertiesToggle" v-model="enablePropertiesToggle" @change="initEditor()">
            <label for="enablePropertiesToggle"><code>enablePropertiesToggle</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enableCollapseToggle" v-model="enableCollapseToggle" @change="initEditor()">
            <label for="enableCollapseToggle"><code>enableCollapseToggle</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="startCollapsed" v-model="startCollapsed" @change="initEditor()">
            <label for="startCollapsed"><code>startCollapsed</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="assertFormat" v-model="assertFormat" @change="initEditor()">
            <label for="assertFormat"><code>assertFormat</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enforceEnum" v-model="enforceEnum" @change="initEditor()">
            <label for="enforceEnum"><code>enforceEnum</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enforceRequired" v-model="enforceRequired" @change="initEditor()">
            <label for="enforceRequired"><code>enforceRequired</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enforceAdditionalProperties" v-model="enforceAdditionalProperties" @change="initEditor()">
            <label for="enforceAdditionalProperties"><code>enforceAdditionalProperties</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enforceMinItems" v-model="enforceMinItems" @change="initEditor()">
            <label for="enforceMinItems"><code>enforceMinItems</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="enforceMaxItems" v-model="enforceMaxItems" @change="initEditor()">
            <label for="enforceMaxItems"><code>enforceMaxItems</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="parseMarkdown" v-model="parseMarkdown" @change="initEditor()">
            <label for="parseMarkdown"><code>parseMarkdown</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="purifyHtml" v-model="purifyHtml" @change="initEditor()">
            <label for="purifyHtml"><code>purifyHtml</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="mergeAllOf" v-model="mergeAllOf" @change="initEditor()">
            <label for="mergeAllOf"><code>mergeAllOf</code></label>
          </div>

          <div class="form-group mb-3">
            <input type="checkbox" id="editJsonData" v-model="editJsonData" @change="initEditor()">
            <label for="editJsonData"><code>editJsonData</code></label>
          </div>
        </aside>
      </div>

      <div class="col-xs-12 col-md-5">
        <main>
          <div class="btn-group">
            <button class="btn btn-primary" id="disable-editor" @click="disableEditor()">Disable</button>
            <button class="btn btn-primary" id="enable-editor" @click="enableEditor()">Enable</button>
            <button class="btn btn-primary" id="show-validation-errors" @click="showValidationErrors()">Show validation errors</button>
            <button class="btn btn-primary" id="destroy-editor" @click="destroyEditor()">Destroy</button>
            <button class="btn btn-primary" id="init-editor" @click="initEditor()">Init</button>
          </div>

          <br>
          <br>

          <form action="" method="POST">
            <div ref="jediContainer" id="jedison-container"></div>
          </form>
        </main>
      </div>

      <div class="col-xs-12 col-md-3">
        <aside>
          <div class="btn-group btn-block w-100">
            <button class="btn btn-primary" id="disable-editor" @click="shareLink()">Share Link</button>
          </div>

          <br><br>

          <div class="form-group mb-0">
            <label for="editor-value">Value</label>
            <textarea ref="editorValue" class="form-control" id="editor-value" wrap="off" style="font-size: 12px; font-family: monospace;min-height: 400px;"></textarea>
          </div>

          <button class="btn btn-primary btn-block w-100 mb-3" id="set-value" @click="setEditorValue()">Set value</button>

          <br><br>

          <div class="form-group mb-3">
            <label for="editor-errors">
              <span>Errors: </span>
              <span>{{ errorCount }}</span>
            </label>
            <textarea ref="editorErrors" class="form-control" id="editor-errors" wrap="off" style="font-size: 12px; font-family: monospace; min-height: 400px;"></textarea>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>

import EditorStringCustom from "./js/custom-editor.js"

import Jedison from '/src/index.js'
import all from './json/editors/all.json'
import array from './json/editors/array.json'
import arrayButtonsContent from './json/editors/array-buttons-content.json'
import arrayNoButtons from './json/editors/array-no-buttons.json'
import arrayCheckboxes from './json/editors/array-checkboxes.json'
import arrayCheckboxesInline from './json/editors/array-checkboxes-inline.json'
import arrayTable from './json/editors/array-table.json'
import arrayTableObject from './json/editors/array-table-object.json'
import arrayNavVertical from './json/editors/array-nav-vertical.json'
import arrayNavHorizontal from './json/editors/array-nav-horizontal.json'
import arrayEnforceMinItems from './json/editors/array-enforceMinItems.json'
import booleanCheckbox from './json/editors/boolean-checkbox.json'
import booleanSelect from './json/editors/boolean-select.json'
import booleanRadios from './json/editors/boolean-radios.json'
import booleanRadiosInline from './json/editors/boolean-radios-inline.json'
import integerInput from './json/editors/integer-input.json'
import nullJson from './json/editors/null.json'
import numberInput from './json/editors/number-input.json'
import numberInputNullable from './json/editors/number-input-nullable.json'
import numberRadios from './json/editors/number-radios.json'
import numberRadiosInline from './json/editors/number-radios-inline.json'
import numberSelect from './json/editors/number-select.json'
import numberRange from './json/editors/number-range.json'
import objectJson from './json/editors/object.json'
import objectButtonsContent from './json/editors/object-buttons-content.json'
import objectGrid from './json/editors/object-grid.json'
import objectGridBreakpoints from './json/editors/object-grid-breakpoints.json'
import objectNavVertical from './json/editors/object-nav-vertical.json'
import objectNavHorizontal from './json/editors/object-nav-horizontal.json'
import objectPropertyOrder from './json/editors/object-propertyOrder.json'
import objectEnforceRequired from './json/editors/object-enforceRequired.json'
import objectEnforceAdditionalProperties from './json/editors/object-enforceAdditionalProperties.json'
import objectPropGroup from './json/editors/object-propGroup.json'
import stringRadios from './json/editors/string-radios.json'
import stringRadiosInline from './json/editors/string-radios-inline.json'
import stringSelect from './json/editors/string-select.json'
import stringInput from './json/editors/string-input.json'
import stringTextarea from './json/editors/string-textarea.json'
import showErrorsInputMixed from './json/editors/show-errors-input-mixed.json'
import containerAttributes from './json/editors/editor-containerAttributes.json'
import editorHidden from './json/editors/editor-hidden.json'
import additionalProperties from './json/validator/additionalProperties.json'
import allOf from './json/validator/allOf.json'
import anyOf from './json/validator/anyOf.json'
import constJson from './json/validator/const.json'
import contains from './json/validator/contains.json'
import dependentRequired from './json/validator/dependentRequired.json'
import dependentSchemas from './json/validator/dependentSchemas.json'
import enumValidator from './json/validator/enum.json'
import exclusiveMaximum from './json/validator/exclusiveMaximum.json'
import exclusiveMinimum from './json/validator/exclusiveMinimum.json'
import format from './json/validator/format.json'
import ifElse from './json/validator/if-else.json'
import ifThen from './json/validator/if-then.json'
import ifThenElse from './json/validator/if-then-else.json'
import ifThenElseAllOf from './json/validator/if-then-else-allOf.json'
import ifThenElseNested from './json/validator/if-then-else-nested.json'
import ifThenElseNestedSimple from './json/validator/if-then-else-nested-simple.json'
import ifThenElseNestedComplex from './json/validator/if-then-else-nested-complex.json'
import ifThenElseNestedComplex2 from './json/validator/if-then-else-nested-complex-2.json'
import ifThenElseDeeplyNestedAndUnselected from './json/validator/if-then-else-deeply-nested-and-unselected.json'
import items from './json/validator/items.json'
import maxContains from './json/validator/maxContains.json'
import maximum from './json/validator/maximum.json'
import maxItems from './json/validator/maxItems.json'
import maxLength from './json/validator/maxLength.json'
import maxProperties from './json/validator/maxProperties.json'
import minContains from './json/validator/minContains.json'
import minimum from './json/validator/minimum.json'
import minItems from './json/validator/minItems.json'
import minLength from './json/validator/minLength.json'
import minProperties from './json/validator/minProperties.json'
import multipleOf from './json/validator/multipleOf.json'
import notValidator from './json/validator/not.json'
import oneOf from './json/validator/oneOf.json'
import pattern from './json/validator/pattern.json'
import patternProperties from './json/validator/patternProperties.json'
import prefixItems from './json/validator/prefixItems.json'
import propertyNames from './json/validator/propertyNames.json'
import required from './json/validator/required.json'
import typeValidator from './json/validator/type.json'
import uniqueItems from './json/validator/uniqueItems.json'
import messagesArray from './json/validator/messages-array.json'
import messagesByLanguage from './json/validator/messages-by-language.json'
import messagesByConstraint from './json/validator/messages-by-constraint.json'
import choices from './json/plugins/array-choices.json'
import awesomplete from './json/plugins/string-awesomplete.json'
import emojiButton from './json/plugins/string-emoji-button.json'
import simplemde from './json/plugins/string-simplemde.json'
import quill from './json/plugins/string-quill.json'
import jodit from './json/plugins/string-jodit.json'
import flatpickr from './json/plugins/string-flatpickr.json'
import numberImask from './json/plugins/number-imask.json'
import imask from './json/plugins/string-imask.json'
import imaskSettings from './json/plugins/string-imask-settings.json'
import raty from './json/plugins/number-raty.json'
import custom from './json/custom/custom.json'
import customConstraint from './json/custom/custom-constraint.json'
import metaSchema from './json/meta-schema.json'
import europass from './json/europass.json'
import blackParade from './json/examples/black-parade.json'
import geojson from './json/examples/geojson.json'
import johnFrusciante from './json/examples/john-frusciante.json'
import resumeSchema from './json/examples/resume-schema.json'
import loginExample from './json/examples/login.json'
import contactExample from './json/examples/contact.json'
import testJson from './json/test.json'
import markdownAnnotations from './json/experimental/markdon-annotations.json'
import jsonPatch from './json/parsing/json-patch.json'
import allOfRefs from './json/parsing/allOf-refs.json'
import allOfIfThen from './json/parsing/allOf-if-then.json'
import oneOfRefs from './json/parsing/oneOf-refs.json'
import anyOfRefs from './json/parsing/anyOf-refs.json'
import recursiveRefs from './json/parsing/recursive-refs.json'
import optionsOverrides from './json/features/options-overrides.json'
import ifThenElseValueOverrides from './json/issues/if-then-else-value-overrides.json'
import ifThenElseInitialValue from './json/issues/if-then-else-initial-value.json'
import ifThenElseInitialValueEnforceConst from './json/issues/if-then-else-initial-value-enforceConst.json'
import arrayItemsDisabledStates from './json/issues/array-items-disabled-state.json'
import ifThenElseNullableInitialValue from './json/issues/if-then-else-nullable-initial-value.json'
import ifThenElseNullableInitialValue2 from './json/issues/if-then-else-nullable-initial-value-2.json'
import multipleRegister from './json/issues/multiple-register.json'
import childrenDisableState from './json/issues/children-disable-state.json'
import templates from './json/features/templates.json'
import editJsonData from './json/features/edit-json-data.json'
import {isSet} from "../src/helpers/utils.js"


export default {
  data() {
    return {
      errorCount: 0,
      examples: {
        'Examples': {
          'examples/geojson': geojson,
          'examples/john-frusciante': johnFrusciante,
          'examples/resume-schema': resumeSchema,
          'examples/login': loginExample,
          'examples/contact': contactExample,
          'custom/custom': custom,
          'custom/custom-constraint': customConstraint,
          'meta-schema': metaSchema,
          'europass-xml-3.3.0': europass,
          'examples/black-parade': blackParade,
          'test': testJson,
        },
        'Editors': {
          'editors/all': all,
          'editors/array': array,
          'editors/array-buttons-content': arrayButtonsContent,
          'editors/array-no-buttons': arrayNoButtons,
          'editors/array-checkboxes': arrayCheckboxes,
          'editors/array-checkboxes-inline': arrayCheckboxesInline,
          'editors/array-nav-vertical': arrayNavVertical,
          'editors/array-nav-horizontal': arrayNavHorizontal,
          'editors/array-table': arrayTable,
          'editors/array-table-object': arrayTableObject,
          'editors/array-enforceMinItems': arrayEnforceMinItems,
          'editors/boolean-checkbox': booleanCheckbox,
          'editors/boolean-radios': booleanRadios,
          'editors/boolean-radios-inline': booleanRadiosInline,
          'editors/boolean-select': booleanSelect,
          'editors/integer-input': integerInput,
          'editors/null': nullJson,
          'editors/number-input': numberInput,
          'editors/number-input-nullable': numberInputNullable,
          'editors/number-radios': numberRadios,
          'editors/number-radios-inline': numberRadiosInline,
          'editors/number-select': numberSelect,
          'editors/number-range': numberRange,
          'editors/object': objectJson,
          'editors/object-buttons-content': objectButtonsContent,
          'editors/object-grid': objectGrid,
          'editors/object-grid-breakpoints': objectGridBreakpoints,
          'editors/object-nav-vertical': objectNavVertical,
          'editors/object-nav-horizontal': objectNavHorizontal,
          'editors/object-propertyOrder': objectPropertyOrder,
          'editors/object-enforceRequired': objectEnforceRequired,
          'editors/object-enforceAdditionalProperties': objectEnforceAdditionalProperties,
          'editors/object-propGroup': objectPropGroup,
          'editors/string-radios': stringRadios,
          'editors/string-radios-inline': stringRadiosInline,
          'editors/string-select': stringSelect,
          'editors/string-input': stringInput,
          'editors/string-textarea': stringTextarea,
          'editors/show-errors-input-mixed': showErrorsInputMixed,
          'editors/editor-containerAttributes': containerAttributes,
          'editors/editor-hidden': editorHidden
        },
        'Plugins': {
          'plugins/choices': choices,
          'plugins/awesomplete': awesomplete,
          'plugins/emoji-button': emojiButton,
          'plugins/flatpickr': flatpickr,
          'plugins/number-imask': numberImask,
          'plugins/imask': imask,
          'plugins/imask-settings': imaskSettings,
          'plugins/jodit': jodit,
          'plugins/quill': quill,
          'plugins/simplemde': simplemde,
          'plugins/raty': raty,
        },
        'Features': {
          'features/templates': templates,
          'features/edit-json-data': editJsonData,
          'features/markdown-annotations': markdownAnnotations,
          'features/options-overrides': optionsOverrides,
          'parsing/json-patch': jsonPatch,
          'parsing/allOf-refs': allOfRefs,
          'parsing/allOf-if-then': allOfIfThen,
          'parsing/oneOf-refs': oneOfRefs,
          'parsing/anyOf-refs': anyOfRefs,
          'parsing/recursive-refs': recursiveRefs,
        },
        'Validators': {
          'validator/additionalProperties': additionalProperties,
          'validator/allOf': allOf,
          'validator/anyOf': anyOf,
          'validator/const': constJson,
          'validator/contains': contains,
          'validator/dependentRequired': dependentRequired,
          'validator/dependentSchemas': dependentSchemas,
          'validator/enum': enumValidator,
          'validator/exclusiveMaximum': exclusiveMaximum,
          'validator/exclusiveMinimum': exclusiveMinimum,
          'validator/format': format,
          'validator/if-else': ifElse,
          'validator/if-then': ifThen,
          'validator/if-then-else': ifThenElse,
          'validator/if-then-else-allOf': ifThenElseAllOf,
          'validator/if-then-else-deeply-nested-and-unselected': ifThenElseDeeplyNestedAndUnselected,
          'validator/if-then-else-nested': ifThenElseNested,
          'validator/if-then-else-nested-complex': ifThenElseNestedComplex,
          'validator/if-then-else-nested-complex-2': ifThenElseNestedComplex2,
          'validator/if-then-else-nested-simple': ifThenElseNestedSimple,
          'validator/items': items,
          'validator/maxContains': maxContains,
          'validator/maximum': maximum,
          'validator/maxItems': maxItems,
          'validator/maxLength': maxLength,
          'validator/maxProperties': maxProperties,
          'validator/messages-array': messagesArray,
          'validator/messages-by-language': messagesByLanguage,
          'validator/messages-by-constraint': messagesByConstraint,
          'validator/minContains': minContains,
          'validator/minimum': minimum,
          'validator/minItems': minItems,
          'validator/minLength': minLength,
          'validator/minProperties': minProperties,
          'validator/multipleOf': multipleOf,
          'validator/not': notValidator,
          'validator/oneOf': oneOf,
          'validator/pattern': pattern,
          'validator/patternProperties': patternProperties,
          'validator/prefixItems': prefixItems,
          'validator/propertyNames': propertyNames,
          'validator/required': required,
          'validator/type': typeValidator,
          'validator/uniqueItems': uniqueItems,
        },
        'Fixed issues': {
          'issue/if-then-else-value-overrides': ifThenElseValueOverrides,
          'issue/if-then-else-initial-value': ifThenElseInitialValue,
          'issue/if-then-else-initial-value-enforceConst': ifThenElseInitialValueEnforceConst,
          'issue/array-items-disabled-state': arrayItemsDisabledStates,
          'issue/if-then-else-nullable-initial-value': ifThenElseNullableInitialValue,
          'issue/if-then-else-nullable-initial-value-2': ifThenElseNullableInitialValue2,
          'issue/multiple-register': multipleRegister,
          'issue/children-disable-state': childrenDisableState
        }
      },
      example: 'editors/all',
      themes: [
        'bootstrap5',
        'bootstrap4',
        'bootstrap3',
        'barebones'
      ],
      iconLibs: [
        'none',
        'glyphicons',
        'bootstrap-icons',
        'fontawesome3',
        'fontawesome4',
        'fontawesome5',
        'fontawesome6'
      ],
      showErrorsOptions: [
        'never',
        'change',
        'input',
        'always'
      ],
      switcherInputOptions: [
        'select',
        'radios',
        'radios-inline'
      ],
      languageOptions: [
        'en',
        'de',
        'it',
        'es'
      ],
      btnContents: false,
      btnIcons: true,
      enablePropertiesToggle: true,
      enableCollapseToggle: true,
      startCollapsed: false,
      schema: all,
      editor: null,
      theme: 'barebones',
      iconLib: 'bootstrap-icons',
      showErrors: 'change',
      switcherInput: 'select',
      language: 'en',
      assertFormat: false,
      parseMarkdown: true,
      purifyHtml: true,
      mergeAllOf: false,
      enforceEnum: true,
      enforceRequired: true,
      enforceMinItems: true,
      enforceMaxItems: true,
      enforceAdditionalProperties: true,
      editJsonData: false
    }
  },
  created() {
    this.theme = this.getQueryParam('theme') || 'bootstrap5'
    this.iconLib = this.getQueryParam('iconLib') || 'fontawesome5'
    this.example = this.getQueryParam('example') || 'editors/all'
    this.showErrors = this.getQueryParam('showErrors') || 'change'
    this.switcherInput = this.getQueryParam('switcherInput') || 'select'
    this.language = this.getQueryParam('language') || 'en'
    this.assertFormat = this.getQueryParam('assertFormat') ? this.parseBooleanString(this.getQueryParam('assertFormat')) : false
    this.parseMarkdown = this.getQueryParam('parseMarkdown') ? this.parseBooleanString(this.getQueryParam('parseMarkdown')) : true
    this.purifyHtml = this.getQueryParam('purifyHtml') ? this.parseBooleanString(this.getQueryParam('purifyHtml')) : true
    this.mergeAllOf = this.getQueryParam('mergeAllOf') ? this.parseBooleanString(this.getQueryParam('mergeAllOf')) : false
    this.enforceEnum = this.getQueryParam('enforceEnum') ? this.parseBooleanString(this.getQueryParam('enforceEnum')) : true
    this.enforceRequired = this.getQueryParam('enforceRequired') ? this.parseBooleanString(this.getQueryParam('enforceRequired')) : true
    this.enforceMinItems = this.getQueryParam('enforceMinItems') ? this.parseBooleanString(this.getQueryParam('enforceMinItems')) : true
    this.enforceMaxItems = this.getQueryParam('enforceMaxItems') ? this.parseBooleanString(this.getQueryParam('enforceMaxItems')) : true
    this.enforceAdditionalProperties = this.getQueryParam('enforceAdditionalProperties') ? this.parseBooleanString(this.getQueryParam('enforceAdditionalProperties')) : true
    this.btnContents = this.getQueryParam('btnContents') ? this.parseBooleanString(this.getQueryParam('btnContents')) : false
    this.btnIcons = this.getQueryParam('btnIcons') ? this.parseBooleanString(this.getQueryParam('btnIcons')) : true
    this.enablePropertiesToggle = this.getQueryParam('enablePropertiesToggle') ? this.parseBooleanString(this.getQueryParam('enablePropertiesToggle')) : true
    this.enableCollapseToggle = this.getQueryParam('enableCollapseToggle') ? this.parseBooleanString(this.getQueryParam('enableCollapseToggle')) : true
    this.startCollapsed = this.getQueryParam('startCollapsed') ? this.parseBooleanString(this.getQueryParam('startCollapsed')) : false
    this.editJsonData = this.getQueryParam('editJsonData') ? this.parseBooleanString(this.getQueryParam('editJsonData')) : false
  },
  mounted() {
    switch (this.theme) {
      case 'bootstrap3':
        this.loadStylesheets([
          'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css'
        ])

        this.loadScripts([
          'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js',
          'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js'
        ])
        break
      case 'bootstrap4':
        this.loadStylesheets([
          'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
        ])

        this.loadScripts([
          'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js',
          'https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js',
          'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js'
        ])
        break
      case 'bootstrap5':
        this.loadStylesheets([
          'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
        ])

        this.loadScripts([
          'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js'
        ])
        break
    }

    switch (this.iconLib) {
      case 'bootstrap-icons':
        this.loadStylesheets([
          'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'
        ])
        break
      case 'fontawesome3':
        this.loadStylesheets([
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/3.2.1/css/font-awesome.css',
        ])
        break
      case 'fontawesome4':
        this.loadStylesheets([
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css'
        ])
        break
      case 'fontawesome5':
        this.loadStylesheets([
          'https://use.fontawesome.com/releases/v5.6.1/css/all.css'
        ])
        break
      case 'fontawesome6':
        this.loadStylesheets([
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
        ])
        break
    }

    this.initEditor()
  },
  methods: {
    getThemeInstance(name) {
      let theme

      switch (name) {
        case 'barebones':
          theme = new Jedison.Theme()
          break
        case 'bootstrap3':
          theme = new Jedison.ThemeBootstrap3()
          break
        case 'bootstrap4':
          theme = new Jedison.ThemeBootstrap4()
          break
        case 'bootstrap5':
          theme = new Jedison.ThemeBootstrap5()
          break
      }

      return theme
    },
    getSchema() {
      const examples = Object.assign({}, ...Object.values(this.examples))
      return examples[this.example] || null
    },
    async initEditor(schema, data) {
      if (this.editor) {
        this.editor.destroy()
      }

      // schema
      const querySchema = this.getQueryParam('schema')

      this.schema = querySchema ? JSON.parse(this.decompress(querySchema)) : this.getSchema()

      if (schema) {
        this.schema = schema
      }

      // data
      const queryData = this.getQueryParam('data')

      this.data = queryData ? JSON.parse(this.decompress(queryData)) : undefined

      if (data) {
        this.data = data
      }

      if (this.data) {
        this.$refs.data.value = JSON.stringify(this.data, null, 2)
      }

      const refParser = new Jedison.RefParser()
      await refParser.dereference(this.schema)

      if (refParser.hasRefCycles()) {
        console.warn('Schema has refs cycles:')
        console.warn(refParser.cycles)
      }

      const options = {
        container: document.querySelector('#jedison-container'),
        btnContents: this.btnContents,
        btnIcons: this.btnIcons,
        enablePropertiesToggle: this.enablePropertiesToggle,
        enableCollapseToggle: this.enableCollapseToggle,
        startCollapsed: this.startCollapsed,
        iconLib: this.iconLib,
        showErrors: this.showErrors,
        switcherInput: this.switcherInput,
        language: this.language,
        assertFormat: this.assertFormat,
        parseMarkdown: this.parseMarkdown,
        purifyHtml: this.purifyHtml,
        mergeAllOf: this.mergeAllOf,
        enforceEnum: this.enforceEnum,
        enforceRequired: this.enforceRequired,
        enforceMinItems: this.enforceMinItems,
        enforceMaxItems: this.enforceMaxItems,
        enforceAdditionalProperties: this.enforceAdditionalProperties,
        editJsonData: this.editJsonData,
        schema: this.schema,
        data: this.data,
        theme: this.getThemeInstance(this.theme),
        refParser,
        customEditors: [
          EditorStringCustom
        ],
        settings: {
          imaskDate: {
            mask: Date,
            min: new Date(1990, 0, 1),
            max: new Date(2020, 0, 1),
            lazy: false
          },
          mySearchPanelSettings: {
            load: async ({ editor, searchTerm }) => {
              const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${searchTerm}`)
              const data = await response.json()
              return data.results || []
            },
            renderItem: ({ item }) => {
              const element = document.createElement('div')
              element.style.cursor = 'pointer'
              element.style.textAlign = 'center'
              element.style.width = '150px'

              const img = document.createElement('img')
              img.src = item.image
              img.alt = item.name
              img.style.width = '100%'

              const name = document.createElement('div')
              name.textContent = item.name
              name.style.marginTop = '8px'

              element.appendChild(img)
              element.appendChild(name)

              return element
            },
            getValue: ({ item }) => {
              return item.image
            }
          }
        },
        constraints: {
          'x-my-constraint': (context) => {
            const errors = []
            const schemaMyConstraint = context.schema['x-my-constraint']

            if (isSet(schemaMyConstraint)) {
              const invalid = context.value !== schemaMyConstraint

              if (invalid) {
                errors.push({
                  type: 'warning',
                  path: context.path,
                  constraint: 'x-my-constraint',
                  messages: [
                    `Value should be equal to "${schemaMyConstraint}".`
                  ]
                })
              }
            }

            return errors
          }
        }
      }

      const t1 = window.performance.now()
      this.editor = new Jedison.Create(options)
      const t2 = window.performance.now()
      console.log('init time', t2 - t1)
      console.log(this.editor.instances)
      window.editor = this.editor
      this.editorChangeHandler()
      this.editor.on('change', this.editorChangeHandler)
    },
    editorChangeHandler() {
      const errors = this.editor.getErrors()
      this.errorCount = errors.length
      this.$refs.editorErrors.value = JSON.stringify(errors, null, 2)
      this.$refs.editorValue.value = JSON.stringify(this.editor.getValue(), null, 2)
      this.$refs.schema.value = JSON.stringify(this.editor.schema, null, 2)
    },
    showValidationErrors() {
      const errors = this.editor.getErrors()
      this.editor.showValidationErrors(errors)
    },
    destroyEditor() {
      this.editor.destroy()
      this.editor = null
    },
    enableEditor() {
      this.editor.enable()
    },
    disableEditor() {
      this.editor.disable()
    },
    setEditorValue() {
      this.editor.setValue(JSON.parse(this.$refs.editorValue.value))
    },
    setSchema() {
      try {
        this.schema = JSON.parse(this.$refs.schema.value)
        this.initEditor(this.schema)
      } catch (error) {
        alert('Invalid Schema: ' + error.message)
      }
    },
    setData() {
      try {
        this.data = JSON.parse(this.$refs.data.value)
        this.initEditor(this.schema, this.data)
      } catch (error) {
        alert('Invalid data: ' + error.message)
      }
    },
    reload() {
      let newUrl = window.location.origin + window.location.pathname
      newUrl += "?theme=" + this.theme
      newUrl += "&iconLib=" + this.iconLib
      newUrl += "&example=" + this.example
      newUrl += "&showErrors=" + this.showErrors
      newUrl += "&switcherInput=" + this.switcherInput
      newUrl += "&language=" + this.language
      newUrl += "&assertFormat=" + this.assertFormat
      newUrl += "&parseMarkdown=" + this.parseMarkdown
      newUrl += "&purifyHtml=" + this.purifyHtml
      newUrl += "&mergeAllOf=" + this.mergeAllOf
      newUrl += "&enforceEnum=" + this.enforceEnum
      newUrl += "&enforceRequired=" + this.enforceRequired
      newUrl += "&enforceMinItems=" + this.enforceMinItems
      newUrl += "&enforceMaxItems=" + this.enforceMaxItems
      newUrl += "&enforceAdditionalProperties=" + this.enforceAdditionalProperties
      newUrl += "&btnContents=" + this.btnContents
      newUrl += "&btnIcons=" + this.btnIcons
      newUrl += "&enablePropertiesToggle=" + this.enablePropertiesToggle
      newUrl += "&enableCollapseToggle=" + this.enableCollapseToggle
      newUrl += "&startCollapsed=" + this.startCollapsed
      newUrl += "&editJsonData=" + this.editJsonData

      window.open(newUrl, '_self')
    },
    shareLink() {
      let newUrl = window.location.origin + window.location.pathname
      newUrl += "?theme=" + this.theme
      newUrl += "&iconLib=" + this.iconLib
      newUrl += "&example=" + this.example
      newUrl += "&showErrors=" + this.showErrors
      newUrl += "&switcherInput=" + this.switcherInput
      newUrl += "&language=" + this.language
      newUrl += "&assertFormat=" + this.assertFormat
      newUrl += "&parseMarkdown=" + this.parseMarkdown
      newUrl += "&purifyHtml=" + this.purifyHtml
      newUrl += "&mergeAllOf=" + this.mergeAllOf
      newUrl += "&enforceEnum=" + this.enforceEnum
      newUrl += "&enforceRequired=" + this.enforceRequired
      newUrl += "&enforceMinItems=" + this.enforceMinItems
      newUrl += "&enforceMaxItems=" + this.enforceMaxItems
      newUrl += "&enforceAdditionalProperties=" + this.enforceAdditionalProperties
      newUrl += "&btnContents=" + this.btnContents
      newUrl += "&btnIcons=" + this.btnIcons
      newUrl += "&enablePropertiesToggle=" + this.enablePropertiesToggle
      newUrl += "&enableCollapseToggle=" + this.enableCollapseToggle
      newUrl += "&startCollapsed=" + this.startCollapsed
      newUrl += "&editJsonData=" + this.editJsonData
      newUrl += "&schema=" + this.compress(JSON.stringify(this.schema))
      newUrl += "&data=" + this.compress(JSON.stringify(this.editor.getValue()))

      // Copy newUrl to the clipboard
      navigator.clipboard.writeText(newUrl)
      .then(() => {
        alert('The shareable link has been copied to your clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy the link: ', err)
        alert('An error occurred while copying the link. Please try again.')
      })
    },
    compress(string) {
      return LZString.compressToEncodedURIComponent(string)
    },
    decompress(string) {
      return LZString.decompressFromEncodedURIComponent(string)
    },
    getQueryParam(name) {
      const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
      return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
    },
    parseBooleanString(string) {
      return string === 'true'
    },
    loadStylesheets(resources) {
      const head = document.head

      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i]
        const linkElement = document.createElement('link')
        linkElement.rel = 'stylesheet'
        linkElement.href = resource
        head.appendChild(linkElement)
      }
    },
    loadScripts(scriptUrls, callback) {
      let currentIndex = 0

      function loadScript(url) {
        const script = document.createElement('script')
        script.src = url
        script.onload = function () {
          currentIndex++
          if (currentIndex < scriptUrls.length) {
            loadScript(scriptUrls[currentIndex])
          } else {
            if (typeof callback === 'function') {
              callback()
            }
          }
        }
        document.head.appendChild(script)
      }

      if (scriptUrls.length > 0) {
        loadScript(scriptUrls[0])
      }
    }
  }
}
</script>