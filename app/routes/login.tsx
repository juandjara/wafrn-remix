import Container from "@/components/Container"
import Spinner from "@/components/Spinner"
import { login } from '@/lib/api.server'
import env from "@/lib/env.server"
import { getSessionData, setSessionData } from "@/lib/session.server"
import { buttonCN, inputCN, labelCN, linkCN } from "@/lib/style"
import { LockClosedIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react"
import type { FormEvent} from "react"
import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

type LoaderData = {
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  // if the user is already authenticated redirect to /dashboard
  const { user } = await getSessionData(request)
  if (user) {
    throw redirect('/dashboard')
  }

  return json({
    recaptchaKey: env.recaptchaKey
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const captcha = formData.get('g-recaptcha-response') as string

  try {
    const { token } = await login({ email, password, captcha })
    const cookie = await setSessionData(request, { token })
    return redirect('/', {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch(err) {
    return { error: (err as Error).message }
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
    submit(fd, { method: 'post' })
  }

  return (
    <Container>
      <div className="bg-white dark:bg-stone-700 rounded-md shadow-sm px-3 pb-6">
        <div className="bg-purple-900 p-4 -mx-3 rounded-t-md">
          <img src="/img/wafrn-logo.png" alt="WAFRN" className="h-16 mx-auto" />
        </div>
        <h1 className="text-center mt-8 mb-4 font-bold text-2xl">Welcome back!</h1>
        <Form
          method="post"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 my-8">
          <div>
            <label htmlFor="email" className={`mb-1 ${labelCN}`}>Email</label>
            <input autoFocus required type="email" name="email" className={inputCN} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className={labelCN}>Password</label>
              <Link className={`${linkCN} text-sm`} to="/forgotpw">Forgot password?</Link>
            </div>
            <input required type="password" name="password" className={inputCN} />
          </div>
          {actionData?.error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-4 mb-2">
              Incorrect email or password. Check those or if you have received the activation email
            </p>
          )}
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
        <Link to='/explore' className={`${linkCN} text-xl block text-center mt-8`}>
          Click here to take a look without an account
        </Link>
      </div>
    </Container>
  )
}
