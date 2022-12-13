import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
import BlotFormatter from 'quill-blot-formatter-mobile'
import CustomImageFactory from './CustomImageFactory'
import type { PostUser } from '@/lib/api.server'
// @ts-ignore
import { MentionBlot, Mention } from "@thesocialdev/quill-mention"
import MagicUrl from 'quill-magic-url'
import { MEDIA_URL } from '@/lib/config'
import MarqueeBlot from './Marquee'
import type { UploadedMedia } from './ImageUpload'
import ImageUpload from './ImageUpload'
import RawVideoBlot from './RawVideo'

function EditorToolbar() {
  return (
    <div id="ql-toolbar-container">
      <span className="ql-formats z-10 absolute top-2 left-2">
        <select className="ql-size"></select>
      </span>
      <span className="ql-formats h-6 z-10 absolute bottom-2 left-2">
        <button className="ql-list" value="bullet"></button>
        <select className="ql-align"></select>
        <button className="ql-link"></button>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
        <select className="ql-color"></select>
        <select className="ql-background"></select>
        <button className='ql-marquee'>M</button>
      </span>
    </div>
  )
}

async function searchUsers(q: string) {
  const res = await fetch(`/api/search?q=${q}`)
  if (!res.ok) {
    throw new Error('Error calling api at /search with POST - bad status code')
  }
  const json = await res.json()
  return json.users.map((u: PostUser) => ({ ...u, value: u.url })).slice(0, 10) as PostUser[]
}

export type PostEditorMention = {
  denotationChar: '@' | '#'
  id: string
  value: string
  index: string
  html: string
}

export default function PostEditor() {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState([] as UploadedMedia[])
  const [mentions, setMentions] = useState([] as PostEditorMention[])
  const { Quill, quill, quillRef } = useQuill({
    theme: 'snow',
    placeholder: 'Write your post here',
    formats: [
      'bold',
      'italic',
      'underline',
      'strike',
      'align',
      'list',
      'size',
      'link',
      'image',
      'color',
      'background',
      'mention'
    ],
    modules: {
      toolbar: '#ql-toolbar-container',
      magicUrl: true,
      blotFormatter: true,
      mention: {
        allowedChars: /^[A-Za-z\s_]*$/,
        mentionDenotationChars: ["@"],
        source: async function (searchTerm: string, renderList: (list: any[], q: string) => void) {
          const users = await searchUsers(searchTerm)
          renderList(users, searchTerm)
        },
        onSelect: (item: PostEditorMention, insertItem: (item: PostEditorMention) => void) => {
          insertItem(item)
          setMentions(prev => prev.concat({
            ...item,
            html: [
              `<span class="mention" data-index="${item.index}" data-denotation-char="${item.denotationChar}" data-id="${item.id}" data-value="${item.value}">`,
                '<span contenteditable="false">',
                  '<span class="ql-mention-denotation-char">',item.denotationChar,'</span>',
                  item.value,
                '</span>',
              '</span>',
            ].join('')
          }))
        },
        renderLoading: () => 'Loading...',
        renderItem: (item: PostUser, searchTerm: string) => `
          <div class="flex items-center gap-2">
            <img
              alt='avatar'
              loading='lazy'
              class='w-8 h-8 rounded-lg'
              src="${MEDIA_URL.concat(item.avatar)}"
            />
            <span>@${item.url}</span>
          </div>
        `
      }
    }
  })

  if (Quill && !quill) {
    Quill.register('modules/magicUrl', MagicUrl)
    Quill.register('formats/image', CustomImageFactory(Quill))
    Quill.register('modules/blotFormatter', BlotFormatter)
    Quill.register(MentionBlot)
    Quill.register("modules/mention", Mention)
    Quill.register(MarqueeBlot(Quill))
    Quill.register(RawVideoBlot(Quill))
  }

  useEffect(() => {
    if (quill) {
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          setValue(quill.root.innerHTML || '')
        }
      })
    }
  }, [quill, Quill])

  function handleUpload(files: UploadedMedia[]) {
    if (quill) {
      for (const file of files) {
        const { url, description, nsfw } = file
        const sel = quill.getSelection(true)
        if (url.startsWith('data:image') || (url.startsWith('http') && url.endsWith('.webp'))) {
          quill.insertEmbed(sel.index, 'image', { src: url, id: file.id, alt: description, 'data-nsfw': String(nsfw) }, 'user')
          file.html = document.getElementById(file.id)?.outerHTML || ''
        }
        if (url.startsWith('data:video') || (url.startsWith('http') && url.endsWith('.mp4'))) {
          quill.insertEmbed(sel.index, 'rawvideo', { src: url, id: file.id, 'data-nsfw': String(nsfw) }, 'user')
          file.html = document.getElementById(file.id)?.outerHTML || ''
        }
        quill.insertText(sel.index + 1, '\n', 'user')
        quill.setSelection(sel.index + 2, 0, 'silent')
      }
    }
    setFiles(prev => prev.concat(files))
  }
  
  const wrapperCN = [
    'ql-wrapper',
    'dark:bg-stone-800 bg-stone-50',
    'border border-stone-300 dark:border-stone-500',
    '-m-3 mb-0 rounded-t-md relative'
  ].join(' ')

  return (
    <div className={wrapperCN}>
      <ImageUpload onUpload={handleUpload} />
      <div ref={quillRef}></div>
      <EditorToolbar />
      <input type="hidden" name="content" value={value} />
      <input type="hidden" name="mentions" value={JSON.stringify(mentions)} />
      <input type="hidden" name="files" value={JSON.stringify(files)} />
    </div>
  )
}
