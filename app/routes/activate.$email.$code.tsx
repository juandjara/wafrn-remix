import Container from "@/components/Container"
import { activate } from "@/lib/api.server"
import { setFlashMessage } from "@/lib/session.server"
import { buttonCN, cardCN, headingCN } from "@/lib/style"
import type { ActionFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import invariant from "tiny-invariant"

export const action: ActionFunction = async ({ request, params }) => {
  const { email, code } = params
  invariant(email, 'email param must be defined in activate page')
  invariant(code, 'code param must be defined in activate page')  
  try {
    const data = await activate({ email, code })
    if (data.success) {
      const cookie = await setFlashMessage(request, 'Yay! Your account was activated! You can now log in.')
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

export default function Activate() {
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'
  const hasError = fetcher.data?.error

  return (
    <Container>
      <h1 className={headingCN}>
        Activate account
      </h1>
      <div className={cardCN}>
        <p className="my-1">
          Click on the button below to activate your account.
        </p>
        <p className="my-1">
          After that, you will be able to <strong>log in</strong> into your account.
        </p>
        {hasError && (
          <p className="text-red-600 text-sm mt-4">There was an error activating your account</p>
        )}
        <fetcher.Form method="post">
          <button disabled={busy} type="submit" className={`mt-6 ${buttonCN.primary} ${buttonCN.normal}`}>
            {busy ? 'Activating...' : 'Activate'}
          </button>
        </fetcher.Form>
      </div>
    </Container>
  )
}
