import Container from "@/components/Container"
import Spinner from "@/components/Spinner"
import { login } from '@/lib/api.server'
import env from "@/lib/env.server"
import { getSessionData, setSessionData } from "@/lib/session.server"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import { LockClosedIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useSearchParams, useSubmit, useTransition } from "@remix-run/react"
import type { FormEvent} from "react"
import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

type LoaderData = {
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  const { user } = await getSessionData(request)
  if (user) {
    throw redirect('/dashboard')
  }

  return json({
    recaptchaKey: env.recaptchaKey
  })
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
  const { recaptchaKey } = useLoaderData<LoaderData>()
  const actionData = useActionData<{ error: Error }>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const submit = useSubmit()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
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
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 my-8">
          {actionData?.error && (
            <p className="text-red-600 text-sm">
              Incorrect email or password. Check those or if you have received the activation email
            </p>
          )}
          <div>
            <label htmlFor="email" className="text-sm text-stone-500 mb-1">Email</label>
            <input autoFocus required type="email" name="email" className={inputCN} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-sm text-stone-500">Password</label>
              <Link className={`${linkCN} text-sm`} to="/forgotpw">Forgot password?</Link>
            </div>
            <input required type="password" name="password" className={inputCN} />
          </div>
          <button
            type='submit'
            disabled={busy}
            className={`${buttonCN.big} ${buttonCN.primary} ${buttonCN.iconLeft} w-full border border-purple-200`}
          >
            {busy ? <Spinner size='w-6 h-6' /> : <LockClosedIcon className='w-6 h-6' />}
            <p className="flex-grow text-center">Log in</p>
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={recaptchaKey}
          />
        </Form>
        <p className="text-sm my-4">
          This site is protected by reCAPTCHA and the Google
          {' '}<a className={linkCN} href="https://policies.google.com/privacy">Privacy Policy</a> and 
          {' '}<a className={linkCN} href="https://policies.google.com/terms">Terms of Service</a> apply. 
        </p>
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
