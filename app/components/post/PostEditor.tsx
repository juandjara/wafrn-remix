import type { ChangeEvent} from 'react'
import { useEffect, useRef, useState } from 'react'
import { useQuill } from 'react-quilljs'
import BlotFormatter from 'quill-blot-formatter-mobile'
import CustomImageFactory from './CustomImageFactory'
import type { PostUser } from '@/lib/api.server'
// @ts-ignore
import { MentionBlot, Mention } from "@thesocialdev/quill-mention"
import MagicUrl from 'quill-magic-url'
import { MEDIA_URL } from '@/lib/config'
import { Popover } from '@headlessui/react'
import { buttonCN, cardCN, checkboxCN, inputCN, labelCN } from '@/lib/style'
import { Form } from '@remix-run/react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

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

const portalRoot = document.getElementById('portal-root')

async function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      resolve(url)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  }) as Promise<string>
}

function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [urls, setUrls] = useState([] as string[])

  async function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    if (ev.target.files) {
      const urls = [] as string[]
      for (const file of ev.target.files) {
        const url = await readFile(file)
        urls.push(url)
      }

      setUrls(urls)
    }
  }

  return portalRoot && createPortal(
    <Popover className="absolute top-6 right-6">
      <Popover.Button title='Upload image or video' aria-label='Upload image or video'>
        <svg viewBox="0 0 18 18" height='18px'>
          <rect stroke='currentColor' fill='none' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' height="10" width="12" x="3" y="4"></rect>
          <circle fill='currentColor' cx="6" cy="7" r="1"></circle>
          <polyline fillRule='evenodd' fill='currentColor' points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline>
        </svg>
      </Popover.Button>
      <Popover.Panel className={`absolute top-full right-0 z-10 w-80 shadow-md ${cardCN}`}>
        <Form method='post' action='/api/image-upload' encType='multipart/form-data'>
          <input multiple onChange={handleFileChange} accept='image/*, video/*' type="file" className='hidden' ref={inputRef} />  
          {urls.length > 0 ? (
            <>
              <label className={`${labelCN} mb-4 flex items-center gap-2`}>
                <input name="nsfw" type="checkbox" className={checkboxCN} />
                <span>Mark these files as NSFW</span>
              </label>
              <div>
                <label htmlFor='description' className={labelCN}>Description</label>
                <input type="text" name="description" className={inputCN} />
              </div>
              {urls.map(url => {
                if (url.startsWith('data:image')) {
                  return (
                    <div className='my-4 flex items-start gap-2' key={url}>
                      <div><img src={url} alt="" /></div>
                      <button
                        title='Delete file'
                        aria-label='Delete file'
                        onClick={() => setUrls(urls => urls.filter(u => u !== url))}
                        className={`p-1 rounded-md ${buttonCN.delete}`}>
                        <XMarkIcon className='w-5 h-5' />
                      </button>
                    </div>
                  )
                }
                if (url.startsWith('data:video')) {
                  return (
                    <div className='my-4 flex items-start gap-2' key={url}>
                      <div><video src={url} controls /></div>
                      <button
                        title='Delete file'
                        aria-label='Delete file'
                        onClick={() => setUrls(urls => urls.filter(u => u !== url))}
                        className={`p-1 rounded-md ${buttonCN.delete}`}>
                        <XMarkIcon className='w-5 h-5' />
                      </button>
                    </div>
                  )
                }
                return null
              })}
              <button
                className='text-purple-700'
                style={{ width: '100%' }}
                type='submit'>
                Confirm upload
              </button>
            </>
          ) : (
            <button
              type='button'
              style={{ width: '100%' }}
              onClick={() => inputRef.current?.click()}
              className={`${buttonCN.normal} ${buttonCN.primary}`}>
              Click here to upload files
            </button>
          )}
        </Form>
      </Popover.Panel>
    </Popover>,
    portalRoot
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

    const Inline = Quill.import('blots/inline')
    class Marquee extends Inline {
      static create (value: boolean) {
        const node = super.create()
        node.setAttribute('contenteditable', 'false')
        return node
      }
    }
    Marquee.blotName = 'marquee'
    Marquee.tagName = 'marquee'

    Quill.register(Marquee)
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
        .ql-editor {
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
