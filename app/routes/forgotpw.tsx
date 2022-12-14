import Container from "@/components/Container"
import Spinner from "@/components/Spinner"
import { requestPasswordChange } from "@/lib/api.server"
import env from "@/lib/env.server"
import { buttonCN, cardCN, headingCN, inputCN, labelCN } from "@/lib/style"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react"
import { FormEvent, useEffect} from "react"
import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import toast from "react-hot-toast"

type LoaderData = {
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    recaptchaKey: env.recaptchaKey
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const captchaResponse = formData.get('g-recaptcha-response') as string
  const email = formData.get('email') as string

  try {
    const data = await requestPasswordChange({ email, captchaResponse })
    if (data.success) {
      return redirect(`/mail-sent?action=changepw&email=${email}`)
    }
  } catch(err) {
    return { error: (err as Error).message }
  }
}


export default function ForgotPW() {
  const { recaptchaKey } = useLoaderData<LoaderData>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const submit = useSubmit()
  const transition = useTransition()
  const busy = transition.state !== 'idle'
  const { error } = useActionData() || {}

  useEffect(() => {
    if (error && !busy) {
      toast.error(error)
    }
  }, [error, busy])

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    try {
      await recaptchaRef.current?.executeAsync()
    } catch (err) {
      console.error(err)
      toast.error('Error getting CAPTCHA code')
    }
    const fd = new FormData(ev.target as HTMLFormElement)
    submit(fd, { method: 'post' })
  }

  return (
    <Container>
      <h1 className={headingCN}>
        Password change request
      </h1>
      <Form 
        method="post"
        className={cardCN}
        onSubmit={handleSubmit}
      >
        <p className="mb-8">
          Forgot your password? Don't worry. Happens to the best of us.
          <br />
          Enter your email here and we will send you a link to the passowrd reset page
        </p>
        <label htmlFor="email" className={`mb-1 ${labelCN} block`}>
          Email
        </label>
        <div>
          <input autoFocus required type="email" name="email" className={`${inputCN} mb-4 flex-grow`} />
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-4 mb-2">There was an error changing your password</p>
          )}
          <button
            type='submit'
            disabled={busy}
            className={`${buttonCN.normal} ${buttonCN.primary} ${buttonCN.iconLeft} w-full border border-purple-200`}
          >
            {busy ? <Spinner size='w-5 h-5' /> : <PaperAirplaneIcon className='w-5 h-5' />}
            <p className="flex-grow text-center">Request</p>
          </button>
        </div>
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={recaptchaKey}
        />
      </Form>
    </Container>
  )
}
