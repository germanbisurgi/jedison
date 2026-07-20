/**
 * Represents an EventEmitter instance.
 */
class EventEmitter {
  constructor () {
    this.listeners = new Map()
  }

  /**
   * Adds a named event listener
   * @public
   * @param {string} name - The name of the event
   * @param {function} callback - A callback functions that will be executed when this event is emitted
   */
  on (name, callback) {
    let callbacks = this.listeners.get(name)
    if (!callbacks) {
      callbacks = []
      this.listeners.set(name, callbacks)
    }
    callbacks.push(callback)
  }

  /**
   * Removes event listeners for a named event.
   * @public
   * @param {string} name - The name of the event
   * @param {function} [callback] - When given, only this specific callback is
   * removed; when omitted, all listeners for the event are removed.
   */
  off (name, callback) {
    if (typeof callback !== 'function') {
      this.listeners.delete(name)
      return
    }

    const callbacks = this.listeners.get(name)

    if (!callbacks) {
      return
    }

    const remaining = callbacks.filter((cb) => cb !== callback)

    if (remaining.length === 0) {
      this.listeners.delete(name)
    } else {
      this.listeners.set(name, remaining)
    }
  }

  /**
   * Triggers the callback function of a named event listener
   * @public
   * @param {string} name - The name of the event to be emitted
   * @param {...*} args - Arguments to be passed to the callback function
   */
  emit (name, ...args) {
    const callbacks = this.listeners.get(name)
    if (callbacks) {
      for (const listener of callbacks) {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in listener callback for event "${name}":`, error)
        }
      }
    }
  }

  /**
   * Deletes all properties of the class
   */
  destroy () {
    Object.keys(this).forEach((key) => {
      delete this[key]
    })
  }
}

export default EventEmitter
