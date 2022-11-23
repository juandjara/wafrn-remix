import Container from "@/components/Container"
import Spinner from "@/components/Spinner"
import { createPost } from "@/lib/api.server"
import env from "@/lib/env.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, cardCN, inputCN, labelCN } from "@/lib/style"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useFetcher, useLoaderData, useNavigate, useSearchParams, useSubmit, useTransition } from "@remix-run/react"
import type { FormEvent} from "react"
import { lazy, useEffect, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { ClientOnly } from "remix-utils"

const PostEditor = lazy(() => import('@/components/post/PostEditor'))

type LoaderData = {
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    recaptchaKey: env.recaptchaKey
  })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  formData.set('captchaKey', formData.get('g-recaptcha-response') as string)
  formData.delete('g-recaptcha-response')

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
  const { recaptchaKey } = useLoaderData<LoaderData>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'
  const hasError = fetcher.data?.error

  useEffect(() => {
    if (fetcher.data?.success) {
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
        Write new post        
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
            <p className="flex-grow text-center">Send</p>
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={recaptchaKey}
          />
        </Form>
      </div>
    </Container>
  )
}
