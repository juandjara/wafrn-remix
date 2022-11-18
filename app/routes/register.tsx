import Container from "@/components/Container"
import { register } from "@/lib/api.server"
import env from "@/lib/env.server"
import { getSessionData } from "@/lib/session.server"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import { XCircleIcon } from "@heroicons/react/20/solid"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { json, redirect, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react"
import type { ChangeEvent, FormEvent} from "react"
import { useRef, useState } from "react"
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
    const data = await register(formData)
    if (data.success) {
      return redirect('/mail-sent?action=register')
    }
  } catch(err) {
    if (err instanceof Response) {
      throw err
    }

    console.error('ERROR', err)
    return json({ error: true })
  }
}

export default function Register() {
  const [image, setImage] = useState('')
  const inputFileRef = useRef<HTMLInputElement>(null)
  const { recaptchaKey } = useLoaderData<LoaderData>()
  const actionData = useActionData<{ error: Error }>()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const submit = useSubmit()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImage(reader.result as string)
      }, false)
      reader.readAsDataURL(file)
    }
  }

  function clearAvatar() {
    if (inputFileRef.current) {
      setImage('')
      inputFileRef.current.value = ''
    }
  }

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
        <h1 className="text-center mt-8 mb-2 font-bold text-2xl">
          Welcome! We hope you enjoy this place!
        </h1>
        <p className="text-center">
          Do you have an account? <Link to='/login' className={`${linkCN} text-lg`}>Just log in!</Link>
        </p>
        <Form
          method="post"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-4 my-8">
          {actionData?.error && (
            <p className="text-red-600 text-sm">Email or URL already in use</p>
          )}
          <div>
            <label htmlFor="email" className="text-sm text-stone-500 mb-1">Email</label>
            <input autoFocus required type="email" name="email" className={inputCN} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-stone-500 mb-1">Password</label>
            <input required type="password" name="password" className={inputCN} />
          </div>
          <div>
            <label htmlFor="url" className="text-sm text-stone-500 mb-1">Public username (your url)</label>
            <input required type="text" name="url" className={inputCN} />
          </div>
          <div>
            <label htmlFor="description" className="text-sm text-stone-500 mb-1">Describe yourself in a few words</label>
            <input required type="text" name="description" className={inputCN} />
          </div>
          <div>
            <label htmlFor="birthDate" className="text-sm text-stone-500 mb-1">Your brth date</label>
            <input required type="date" name="birthDate" className={inputCN} />
          </div>
          <div className="relative flex items-end gap-2">
            <div className="group flex-shrink-0">
              <button
                type="button"
                title="Clear avatar"
                onClick={clearAvatar}
                className="top-0 left-12 absolute focus:opacity-100 group-hover:opacity-100 opacity-0 transition-opacity">
                <XCircleIcon className="w-5 h-5 text-stone-400 hover:text-stone-500" />
              </button>
              <img
                alt=""
                src={image || '/img/default.webp'}
                className="border border-stone-200 w-16 h-16 rounded-md flex-shrink-0"
              />
            </div>
            <div className="flex-grow">
              <label htmlFor="avatar" className="text-sm text-stone-500 mb-1">Upload your avatar</label>
              <input ref={inputFileRef} type="file" name="avatar" className={inputCN} onChange={handleFileChange} />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className={`${buttonCN.big} ${buttonCN.primary} w-full block`}
          >
            Register
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={recaptchaKey}
          />
        </Form>
        <p className="text-sm mt-8">
          This site is protected by reCAPTCHA and the Google
          {' '}<a className={linkCN} href="https://policies.google.com/privacy">Privacy Policy</a> and 
          {' '}<a className={linkCN} href="https://policies.google.com/terms">Terms of Service</a> apply. 
        </p>
      </div>
    </Container>
  )
}
