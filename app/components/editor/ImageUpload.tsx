import { API_URL, MEDIA_URL } from "@/lib/config"
import { buttonCN, cardCN, checkboxCN, inputCN, labelCN } from "@/lib/style"
import { Popover } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useLoaderData } from "@remix-run/react"
import type { ChangeEvent} from "react"
import { useRef, useState } from "react"
import { createPortal } from "react-dom"

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

type uploadMediaParams = {
  files: File[]
  description: string
  nsfw: boolean
}

async function uploadMedia(token: string, { files, description, nsfw }: uploadMediaParams) {
  const fd = new FormData()
  fd.set('description', description)
  fd.set('nsfw', nsfw ? 'true' : 'false')
  for (const f of files) {
    fd.append('image', f)
  }

  const url = `${API_URL}/uploadMedia`

  const res = await fetch(url, {
    body: fd,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Error calling API at /uploadMedia - bad status code')
  }

  const data = await res.json()

  if (data.success === false) {
    throw new Error('Error calling API at /uploadMedia - bad success response')
  }

  return data
}


export type UploadedMedia = {
  id: string
  url: string
  description: string
  nsfw: boolean
  html: string
}

export default function ImageUpload({ onUpload }: { onUpload: (files: UploadedMedia[]) => void }) {
  const portalRoot = document.getElementById('portal-root')
  const { token } = useLoaderData()

  const inputRef = useRef<HTMLInputElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    description: '',
    nsfw: false,
    files: [] as File[],
    urls: [] as string[]
  })

  function update(key: keyof typeof form, value: any) {
    setForm(form => ({ ...form, [key]: value }))
  }

  function resetForm() {
    setForm({
      description: '',
      nsfw: false,
      files: [],
      urls: []
    })
  }

  async function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    if (ev.target.files) {
      update('files', ev.target.files)
      const urls = [] as string[]
      for (const file of ev.target.files) {
        const url = await readFile(file)
        urls.push(url)
      }

      update('urls', urls)
    }
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    const { files, nsfw, description } = form
    try {
      const data = await uploadMedia(token, { files, nsfw, description }) as Pick<UploadedMedia, 'id' | 'url'>[]
      const medias = data.map((d) => ({
        id: d.id,
        url: MEDIA_URL.concat(d.url),
        description,
        nsfw,
        html: ''
      }))
      onUpload(medias)
      resetForm()
    } catch (err) {
      const msg = (err as Error).message
      console.error('Error uploading files', msg)
      setError(msg)
    }
    setLoading(false)
  }

  return portalRoot && createPortal(
    <Popover className="absolute w-full top-2 inset-x-0 z-10 pr-2">
      <Popover.Button className='ml-auto block' ref={toggleButtonRef} title='Upload image or video' aria-label='Upload image or video'>
        <svg viewBox="0 0 18 18" height='18px'>
          <rect stroke='currentColor' fill='none' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' height="10" width="12" x="3" y="4"></rect>
          <circle fill='currentColor' cx="6" cy="7" r="1"></circle>
          <polyline fillRule='evenodd' fill='currentColor' points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline>
        </svg>
      </Popover.Button>
      <Popover.Panel className={`max-w-xs w-full absolute top-full right-0 mt-2 z-10 shadow-md ${cardCN}`}>
        <div>
          <input
            multiple
            name="files"
            onChange={handleFileChange}
            accept='image/*, video/*'
            type="file"
            className='hidden'
            ref={inputRef}
          />
          {form.urls.length > 0 ? (
            <>
              <label className={`mb-4 flex items-center gap-2`}>
                <input
                  checked={form.nsfw}
                  onChange={ev => update('nsfw', ev.target.checked)}
                  name="nsfw"
                  type="checkbox"
                  className={checkboxCN} 
                />
                <span>Mark these files as NSFW</span>
              </label>
              <div>
                <label htmlFor='description' className={labelCN}>Description</label>
                <input
                  value={form.description}
                  onChange={ev => update('description', ev.target.value)}
                  type="text"
                  name="description"
                  className={inputCN}
                />
              </div>
              {form.urls.map(url => {
                let media = null
                if (url.startsWith('data:image')) {
                  media = <img src={url} alt="" />
                }
                if (url.startsWith('data:video')) {
                  media = <video src={url} controls />
                }
                return (
                  <div className='my-4 flex items-start gap-2' key={url}>
                    <div>{media}</div>
                    <button
                      type="button"
                      title='Delete file'
                      aria-label='Delete file'
                      onClick={() => update('urls', form.urls.filter(u => u !== url))}
                      className={`p-1 rounded-md ${buttonCN.delete}`}>
                      <XMarkIcon className='w-5 h-5' />
                    </button>
                  </div>
                )
              })}
              <button
                disabled={loading}
                type='button'
                onClick={handleSubmit}
                className={`w-full ${buttonCN.normal} ${buttonCN.primary}`}>
                {loading ? 'Uploading...' : 'Confirm upload'}
              </button>
            </>
          ) : (
            <button
              type='button'
              onClick={() => inputRef.current?.click()}
              className={`w-full ${buttonCN.normal} ${buttonCN.primary}`}>
              Click here to upload files
            </button>
          )}
          {error && (
            <p className="text-red-600 text-sm mt-4">There was an error uploading your files</p>
          )}
        </div>
      </Popover.Panel>
    </Popover>,
    portalRoot
  )
}
