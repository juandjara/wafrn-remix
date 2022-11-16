import Container from "@/components/Container"
import { login } from '@/lib/api.server'
import env from "@/lib/env.server"
import { getSessionData, setSessionData } from "@/lib/session.server"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useSearchParams, useSubmit, useTransition } from "@remix-run/react"
import type { FormEvent} from "react"
import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

type LoaderData = {
  env: typeof env
}

export const loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  const { user } = await getSessionData(request)
  if (user) {
    throw redirect('/dashboard')
  }

  return json({ env })
}

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_createMemoryUploadHandler()
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  )
  formData.set('captchaResponse', formData.get('g-recaptcha-response') as string)
  formData.delete('g-recaptcha-response')
  try {
    const token = await login(formData)
    const cookie = await setSessionData(request, { token })
    return redirect('/', {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch(err) {
    console.error('ERROR', err)
    return json({ error: err })
  }
}

export default function Login() {
  const { env } = useLoaderData<LoaderData>()
  const actionData = useActionData<{ error: Error }>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const submit = useSubmit()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  async function handleReCaptcha(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    await recaptchaRef.current?.executeAsync()
    const fd = new FormData(ev.target as HTMLFormElement)
    submit(fd, {
      method: 'post',
      encType: 'multipart/form-data'
    })
  }

  return (
    <Container>
      <div className="bg-white rounded-md shadow-sm px-3 pb-6">
        <div className="bg-purple-900 p-4 -mx-3 rounded-t-md">
          <img src="/img/wafrn-logo.png" alt="WAFRN" className="h-16 mx-auto" />
        </div>
        <h1 className="text-center mt-8 mb-4 font-bold text-2xl">Welcome back!</h1>
        <Form
          method="post"
          onSubmit={handleReCaptcha}
          encType="multipart/form-data"
          className="space-y-4 my-8">
          <div>
            <label htmlFor="email" className="text-sm text-stone-500 mb-1">Email</label>
            <input required type="email" name="email" className={inputCN} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-stone-500 mb-1">Password</label>
            <input required type="password" name="password" className={inputCN} />
          </div>
          {actionData?.error && (
            <p className="text-red-600 pt-6 text-sm">Incorrect email or password</p>
          )}
          <button disabled={busy} className={`${buttonCN.big} ${buttonCN.primary} w-full block`}>
            Log in
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={env.recaptchaKey}
          />
        </Form>
        <p>Don't have an account? <Link to='/register' className={`${linkCN} text-lg`}>Register now!</Link> </p>
        <p>If you have any issue please check your spam folder!</p>
        <p>Still having problems? Send us an email at info @ wafrn.net</p>
        <Link to='/explore' className="text-purple-900 text-xl block text-center mt-8">
          Click here to take a look without an account
        </Link>
      </div>
    </Container>
  )
}
