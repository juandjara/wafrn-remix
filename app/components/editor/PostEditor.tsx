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
      <span className="ql-formats">
        <select className="ql-size"></select>
      </span>
      <span className="ql-formats h-6">
        <button className="ql-list" value="bullet"></button>
        <select className="ql-align"></select>

        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>

        <select className="ql-color"></select>
        <select className="ql-background"></select>

        <button className="ql-link"></button>
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
    setFiles(prev => prev.concat(files))
    if (quill) {
      for (const file of files) {
        const { url, description, nsfw } = file
        const sel = quill.getSelection(true)
        if (url.startsWith('data:image') || (url.startsWith('http') && url.endsWith('.webp'))) {
          quill.insertEmbed(sel.index, 'image', { src: url, alt: description, 'data-nsfw': String(nsfw) }, 'user')
        }
        if (url.startsWith('data:video') || (url.startsWith('http') && url.endsWith('.mp4'))) {
          quill.insertEmbed(sel.index, 'rawvideo', url, 'user')
        }
        quill.insertText(sel.index + 1, '\n', 'user')
        quill.setSelection(sel.index + 2, 0, 'silent')
      }
    }
  }

  return (
    <div className='dark:bg-stone-800 ql-wrapper border border-stone-300 dark:border-stone-500'>
      <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          padding: 8px 2px;
        }
        .ql-toolbar.ql-snow .ql-picker-options {
          color: #44403c;
        }
        .ql-toolbar.ql-snow .ql-picker {
          color: currentColor;
        }
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: currentColor;
        }
        .ql-toolbar.ql-snow .ql-fill {
          fill: currentColor;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .ql-wrapper {
          border-radius: 4px;
        }
        .ql-wrapper:focus-within {
          outline: auto;
        }
        .ql-wrapper .ql-editor {
          min-height: 140px;
          font-size: 16px;
          border-radius: 0 0 4px 4px;
          outline: none;
          padding: 4px 12px;
        }
        .ql-wrapper .ql-editor + .ql-tooltip::after {
          content: '';
          position: absolute;
          top: -16px;
          right: 50%;
          transform: translateX(-50%);
          margin-left: -8px;
          border-width: 8px;
          border-style: solid;
          border-color: transparent transparent white transparent;
        }
        .ql-wrapper .ql-editor.ql-blank::before {
          left: 8px;
          color: currentColor;
          opacity: 0.4;
        }
        .ql-marquee {
          line-height: 18px;
        }
      `}</style>
      <style>{`
        /* copied and modified from quill-mentions.css */
        .ql-mention-list-container {
          width: 270px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          background-color: #ffffff;
          box-shadow: 0 2px 12px 0 rgba(30, 30, 30, 0.08);
          z-index: 9001;
          overflow: auto;
        }
        
        .ql-mention-loading {
          line-height: 44px;
          padding: 0 20px;
          vertical-align: middle;
          font-size: 16px;
        }
        
        .ql-mention-list {
          list-style: none;
          margin: 0;
          padding: 0;
          overflow: hidden;
          color: #44403c;
        }
        
        .ql-mention-list-item {
          cursor: pointer;
          line-height: 44px;
          font-size: 16px;
          padding: 0 20px;
          vertical-align: middle;
        }
        
        .ql-mention-list-item.disabled {
          cursor: auto;
        }
        
        .ql-mention-list-item.selected {
          background-color: #d3e1eb;
          text-decoration: none;
        }
        
        .mention {
          user-select: all;
          color: #a855f7;
          text-decoration: underline;
        }
      `}</style>
      <EditorToolbar />
      <ImageUpload onUpload={handleUpload} />
      <div ref={quillRef}></div>
      <input type="hidden" name="content" value={value} />
      <input type="hidden" name="mentions" value={JSON.stringify(mentions)} />
      <input type="hidden" name="files" value={JSON.stringify(files)} />
    </div>
  )
}
