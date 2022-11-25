const ATTRIBUTES = ['alt', 'height', 'width', 'style', 'data-nsfw']
const ALLOWED_STYLE_KEYS = ['display', 'margin', 'float']

function sanitize(style: string) {
  return style
    .split(';')
    .filter(rule => {
      const key = rule.trim().split(':')[0]
      return ALLOWED_STYLE_KEYS.indexOf(key) !== -1
    })
    .join(';')
}

export default function CustomImageFactory(Quill: any) {
  const Image = Quill.import('formats/image') // Using this instead of ES6 imports so quill can register it without errors

  class CustomImage extends Image {
    static create(props: string | Record<string, any>) {
      if (typeof props === 'string') {
        props = { src: props }
      }
      let domNode = super.create()
      if (props) {
        domNode.setAttribute('src', props.src)
        for (const attr of ATTRIBUTES) {
          if (props[attr]) {
            domNode.setAttribute(attr, props[attr])
          }
        }
      }

      return domNode
    }

    static value(domNode: Element) {
      const attrs = CustomImage.formats(domNode)
      return {
        ...attrs,
        src: domNode.getAttribute('src')
      }
    }

    static formats(domNode: Element) {
      const attrs = {} as Record<string, any>
      for (const attr of ATTRIBUTES) {
        if (domNode.hasAttribute(attr)) {
          attrs[attr] = domNode.getAttribute(attr)
        }
      }
      return attrs
    }

    format(name: string, value: string) {
      if (ATTRIBUTES.indexOf(name) !== -1) {
        if (value) {
          if (name === 'style') {
            value = sanitize(value)
          }
          this.domNode.setAttribute(name, value)
        } else {
          this.domNode.removeAttribute(name)
        }
      } else {
        super.format(name, value)
      }
    }
  }

  return CustomImage
}
