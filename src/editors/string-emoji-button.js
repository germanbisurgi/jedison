import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Emoji picker editor using Emoji Button library.
 * @extends EditorString
 */
class EditorStringEmojiButton extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'emojiButton' &&
      window.EmojiButton &&
      getSchemaType(schema) === 'string'
  }

  build () {
    this.control = this.theme.getInputControl({
      type: 'button',
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    this.control.input.classList.add('jedi-emoji-button')
    this.control.input.value = '😀'

    const emojiButtonOptions = getSchemaXOption(this.instance.schema, 'emojiButton') ?? {}

    const options = Object.assign({
      theme: 'auto',
      autoHide: true,
      showPreview: false,
      showSearch: true,
      zIndex: 10000,
      position: 'auto'
    }, emojiButtonOptions)

    this.emojiButton = new window.EmojiButton(options)
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.emojiButton.on('emoji', emoji => {
      this.control.input.value = emoji
      let value = emoji

      if (typeof emoji === 'object') {
        value = emoji.emoji
      }

      this.instance.setValue(value, true, 'user')
    })

    this.control.input.addEventListener('click', () => {
      this.emojiButton.togglePicker(this.control.input)
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.input.value = this.instance.getValue()
  }

  destroy () {
    if (this.emojiButton) {
      this.emojiButton = null
    }

    super.destroy()
  }
}

export default EditorStringEmojiButton
