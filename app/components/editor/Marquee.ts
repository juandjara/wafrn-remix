import type { Quill } from 'quill'

export default function MarqueeBlot(quill: typeof Quill) {
  const Inline = quill.import('blots/inline')
  class Marquee extends Inline {
    static create (value: boolean) {
      const node = super.create()
      node.setAttribute('contenteditable', 'false')
      return node
    }
  }
  Marquee.blotName = 'marquee'
  Marquee.tagName = 'marquee'
}
