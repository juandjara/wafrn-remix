import type { Quill } from 'quill'

export default function RawVideoBlot(quill: typeof Quill) {
  const BlockEmbed = quill.import('blots/block/embed')

  class RawVideo extends BlockEmbed {
    static create(value: string) {
      const node = super.create()
      node.setAttribute('src', value)
      node.setAttribute('controls', '')
      return node
    }

    static value(node: Element) {
      return node.getAttribute('src')
    }
  }

  RawVideo.blotName = 'rawvideo'
  RawVideo.tagName = 'video'

  return RawVideo
}
