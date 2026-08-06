export function createElement (tag, attributes = {}, children = []) {
  const node = document.createElement(tag)

  for (const [key, value] of Object.entries(attributes || {})) {
    if (value === undefined || value === null) continue
    if (key === 'class') {
      node.className = value
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value)
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value)
    } else if (key.startsWith('on')) {
      node.addEventListener(key.slice(2), value)
    } else {
      node.setAttribute(key, value)
    }
  }

  for (const child of children || []) {
    if (child === undefined || child === null || child === false) continue
    node.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child)
  }

  return node
}

export function fieldRow ({ id, label, input, hint, error }) {
  if (id && input) {
    input.id = id
  }

  const labelEl = createElement('label', { for: id }, [label])
  const container = createElement('div', { class: 'jedi-sb-field' }, [labelEl, input])

  if (hint) {
    container.appendChild(createElement('div', { class: 'jedi-sb-hint' }, [hint]))
  }

  if (error) {
    container.appendChild(createElement('div', { class: 'jedi-sb-error', style: { color: '#d9534f', fontSize: '12px' } }, [error]))
  }

  return container
}

export const row = (left, right) => createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' } }, [left, right])

export const btn = (text, onClick, extra = {}) => createElement('button', {
  type: 'button',
  class: 'jedi-sb-btn',
  onClick,
  style: {
    padding: '2px 8px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  ...extra
}, [text])

export const section = (title, body) => {
  const heading = createElement('h4', { class: 'jedi-sb-section-title', style: { fontSize: '13px', fontWeight: '600', margin: '14px 0 6px', textTransform: 'uppercase', color: '#6c757d' } }, [title])
  return createElement('div', { class: 'jedi-sb-section' }, [heading, body])
}
