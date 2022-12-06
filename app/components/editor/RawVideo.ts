import type { Quill } from 'quill'

export default function RawVideoBlot(quill: typeof Quill) {
  const BlockEmbed = quill.import('blots/block/embed')

  class RawVideo extends BlockEmbed {
    static create(props: Record<string, any>) {
      const node = super.create()
      node.setAttribute('id', props.id)
      node.setAttribute('src', props.src)
      node.setAttribute('data-nsfw', props['data-nsfw'])
      node.setAttribute('controls', '')
      return node
    }

    static value(domNode: Element) {
      return {
        id: domNode.id,
        src: domNode.getAttribute('src'),
        'data-nsfw': domNode.getAttribute('data-nsfw')
      }
    }
  }

  RawVideo.blotName = 'rawvideo'
  RawVideo.tagName = 'video'

  return RawVideo
}
