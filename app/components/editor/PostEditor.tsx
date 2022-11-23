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
import ImageUpload from './ImageUpload'

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
        <ImageUpload />
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

export default function PostEditor() {
  const [value, setValue] = useState('')
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
        onSelect: (item: DOMStringMap, insertItem: (item: DOMStringMap) => void) => {
          console.log(item)
          insertItem(item)
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
    Quill.register(MarqueeBlot)
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

  return (
    <div className='ql-wrapper'>
      <style>{`
        .ql-toolbar.ql-snow {
          border-radius: 4px 4px 0 0;
          border-bottom: none;
        }
        .ql-container {
          border-radius: 0 0 4px 4px;
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
          color: #581c87;
          text-decoration: underline;
        }   
      `}</style>
      <EditorToolbar />
      <div ref={quillRef}></div>
      <input type="hidden" name="content" value={value} />
    </div>
  )
}
