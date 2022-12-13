import Container from "@/components/Container"
import PostCard from "@/components/post/PostCard"
import Spinner from "@/components/Spinner"
import type { Post } from "@/lib/api.server"
import { getPost } from "@/lib/api.server"
import env from "@/lib/env.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, cardCN, headingCN, inputCN, labelCN } from "@/lib/style"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react"
import type { FormEvent} from "react"
import { lazy, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "react-hot-toast"
import { ClientOnly } from "remix-utils"
import editorCSS from '@/components/editor/styles/editor.css'
import mentionsCSS from '@/components/editor/styles/mentions.css'

export function links() {
  return [
    { rel: "stylesheet", href: editorCSS },
    { rel: "stylesheet", href: mentionsCSS },
  ]
}

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

export default function Write() {
  const [sp] = useSearchParams()
  const parent = sp.get('parent') as string
  const { reblog, recaptchaKey } = useLoaderData<LoaderData>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'
  const hasError = fetcher.data?.error

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    try {
      await recaptchaRef.current?.executeAsync()
    } catch (err) {
      console.error(err)
      toast.error('Error getting CAPTCHA code')
    }
    const fd = new FormData(ev.target as HTMLFormElement)
    fetcher.submit(fd, {
      action: '/api/write',
      method: 'post'
    })
  }

  return (
    <Container>
      <h1 className={headingCN}>
        {reblog ? 'Reblog post' : 'Write new post'}  
      </h1>
      <div className={`${cardCN} relative`}>
        <div id="portal-root"></div>
        <fetcher.Form action="/api/write" method="post" onSubmit={handleSubmit}>
          <ClientOnly>{() => <PostEditor />}</ClientOnly>
          <div className="flex items-end gap-3">
            <div className="mt-6 flex-grow">
              <label htmlFor="tags" className={`${labelCN} mb-1 block`}>
                Tags (<small>separated by comma</small>)
              </label>
              <input type="text" name="tags" className={inputCN} placeholder="Write your tags here" />
            </div>
            <button
              type='submit'
              disabled={busy}
              className={`${buttonCN.normal} ${buttonCN.primary} ${buttonCN.iconLeft} flex-shrink-0`}
            >
              {busy ? <Spinner size='w-5 h-5' /> : <PaperAirplaneIcon className='w-5 h-5' />}
              <p className="flex-grow text-center">Publish</p>
            </button>
          </div>
          <input type="hidden" name="parent" value={parent || ''} />
          {hasError && (
            <p className="text-red-600 text-sm mt-4">There was an error creating your post</p>
          )}
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={recaptchaKey}
          />
        </fetcher.Form>
      </div>
      {reblog && (
        <div className="mt-12">
          <label className={`${labelCN} block mb-2`}>Reblogging this post</label>
          <PostCard disableThread root post={reblog} />
        </div>
      )}
    </Container>
  )
}
