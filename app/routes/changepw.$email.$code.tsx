import Container from "@/components/Container"
import Spinner from "@/components/Spinner"
import { changePassword } from "@/lib/api.server"
import env from "@/lib/env.server"
import { setFlashMessage } from "@/lib/session.server"
import { buttonCN, cardCN, headingCN, inputCN, labelCN } from "@/lib/style"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { redirect} from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useTransition } from "@remix-run/react"
import invariant from "tiny-invariant"

type LoaderData = {
  recaptchaKey: string
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    recaptchaKey: env.recaptchaKey
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const { email, code } = params
  invariant(email, 'email param must be defined in activate page')
  invariant(code, 'code param must be defined in activate page')  

  const formData = await request.formData()
  const password = formData.get('password') as string

  try {
    const data = await changePassword({ email, password, code })
    if (data.success) {
      const cookie = await setFlashMessage(request, 'Great! Your password was changed! You can now log in.')
      return redirect('/login', {
        headers: {
          'Set-Cookie': cookie
        },
      })
    }
  } catch (err) {
    console.error('ERROR', err)
    return { error: true }
  }
}

export default function ChangePW() {
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  return (
    <Container>
      <h1 className={headingCN}>
        Password change
      </h1>
      <Form 
        method="post"
        className={cardCN}
      >
        <p className="mb-8">
          Enter your new password here and just log in after that
        </p>
        <label htmlFor="password" className={`mb-1 block ${labelCN}`}>
          New Password
        </label>
        <div>
          <input autoFocus required type="password" name="password" className={`${inputCN} mb-4 flex-grow`} />
          <button
            type='submit'
            disabled={busy}
            className={`${buttonCN.normal} ${buttonCN.primary} ${buttonCN.iconLeft} w-full border border-purple-200`}
          >
            {busy ? <Spinner size='w-5 h-5' className="flex-shrink-0" /> : <PaperAirplaneIcon className='w-5 h-5 flex-shrink-0' />}
            <p className="flex-grow text-center">Change password</p>
          </button>
        </div>
      </Form>
    </Container>
  )
}
