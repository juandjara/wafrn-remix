import Container from "@/components/Container"
import type { UploadedMedia } from "@/components/editor/ImageUpload"
import type { PostEditorMention } from "@/components/editor/PostEditor"
import PostCard from "@/components/post/PostCard"
import Spinner from "@/components/Spinner"
import type { Post } from "@/lib/api.server"
import { createPost, getPost } from "@/lib/api.server"
import env from "@/lib/env.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, cardCN, inputCN, labelCN } from "@/lib/style"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import type { FormEvent} from "react"
import { lazy, useEffect, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { ClientOnly } from "remix-utils"

const PostEditor = lazy(() => import('@/components/editor/PostEditor'))

type LoaderData = {
  token: string
  reblog: Post | null
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const sp = new URL(request.url).searchParams
  const reblogId = sp.get('parent')
  let reblog = null
  if (reblogId) {
    reblog = await getPost(reblogId)
  }

  return json<LoaderData>({
    token,
    reblog,
    recaptchaKey: env.recaptchaKey
  })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  formData.set('captchaKey', formData.get('g-recaptcha-response') as string)
  formData.delete('g-recaptcha-response')

  let content = formData.get('content') as string
  content = content.replaceAll('﻿', '')

  let files = JSON.parse(formData.get('files') as string || '[]') as UploadedMedia[]
  for (const file of files) {
    if (content.includes(file.html)) {
      content = content.replace(file.html, `[wafrnmediaid="${file.id}"]`)
    }
  }

  const mentions = JSON.parse(formData.get('mentions') as string || '[]') as PostEditorMention[]
  for (const mention of mentions) {
    if (content.includes(mention.html)) {
      content = content.replace(mention.html, `[mentionuserid="${mention.id}"]`)
    }
  }

  formData.set('content', content)

  try {
    await createPost(token, formData)
    return json({ success: true, error: null })
  } catch(err) {
    console.error('ERROR', err)
    return json({ success: false, error: err })
  }
}

export default function Write() {
  const [sp] = useSearchParams()
  const parent = sp.get('parent') as string
  const { reblog, recaptchaKey } = useLoaderData<LoaderData>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'
  const hasError = fetcher.data?.error

  useEffect(() => {
    if (fetcher.data?.success) {
      // @ts-ignore
      navigate(-1, { replace: true })
    }
  }, [fetcher, navigate])

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    await recaptchaRef.current?.executeAsync()
    const fd = new FormData(ev.target as HTMLFormElement)
    fetcher.submit(fd, {
      method: 'post',
      encType: 'multipart/form-data'
    })
  }

  return (
    <Container>
      <h1 className='mb-4 text-4xl font-medium text-gray-500'>
        {reblog ? 'Reblog post' : 'Write new post'}  
      </h1>
      <div className={`${cardCN} relative`}>
        <div id="portal-root"></div>
        <Form method="post" onSubmit={handleSubmit}>
          <ClientOnly>{() => <PostEditor />}</ClientOnly>
          <input type="hidden" name="parent" value={parent || ''} />
          <div className="mt-6">
            <label htmlFor="tags" className={labelCN}>Tags</label>
            <input type="text" name="tags" className={`${inputCN} max-w-sm`} placeholder="Enter tags separated by commas" />
          </div>
          {hasError && (
            <p className="text-red-600 text-sm mt-4">There was an error creating your post</p>
          )}
          <button
            type='submit'
            disabled={busy}
            className={`${buttonCN.normal} ${buttonCN.primary} ${buttonCN.iconLeft} mt-6`}
          >
            {busy ? <Spinner size='w-5 h-5' /> : <PaperAirplaneIcon className='w-5 h-5' />}
            <p className="flex-grow text-center">Publish</p>
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={recaptchaKey}
          />
        </Form>
      </div>
      {reblog && (
        <div className="my-4">
          <PostCard root post={reblog} />
        </div>
      )}
    </Container>
  )
}
