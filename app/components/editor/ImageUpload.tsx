import { buttonCN, cardCN, checkboxCN, inputCN, labelCN } from "@/lib/style"
import { Popover } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Form } from "@remix-run/react"
import type { ChangeEvent} from "react"
import { useRef, useState } from "react"
import { createPortal } from "react-dom"

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

export default function ImageUpload() {
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
