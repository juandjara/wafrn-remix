import Container from "@/components/Container"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import { XCircleIcon } from "@heroicons/react/20/solid"
import { Form, Link } from "@remix-run/react"
import type { ChangeEvent} from "react"
import { useRef, useState } from "react"

export default function Register() {
  const [image, setImage] = useState('')
  const inputFileRef = useRef<HTMLInputElement>(null)

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

  return (
    <Container>
      <div className="mt-6 bg-white rounded-md shadow-sm px-3 pb-6">
        <div className="bg-purple-900 p-4 -mx-3 rounded-t-md">
          <img src="/img/wafrn-logo.png" alt="WAFRN" className="h-16 mx-auto" />
        </div>
        <h1 className="text-center mt-8 mb-2 font-bold text-2xl">
          Welcome! We hope you enjoy this place!
        </h1>
        <p className="text-center">
          Do you have an account? <Link to='/login' className={`${linkCN} text-lg`}>Just log in!</Link>
        </p>
        <Form className="space-y-4 my-8">
          <div>
            <label htmlFor="email" className="text-sm text-stone-500 mb-1">Email</label>
            <input required type="text" name="email" className={inputCN} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-stone-500 mb-1">Password</label>
            <input required type="text" name="password" className={inputCN} />
          </div>
          <div>
            <label htmlFor="url" className="text-sm text-stone-500 mb-1">Public username (your url)</label>
            <input required type="url" name="url" className={inputCN} />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm text-stone-500 mb-1">Describe yourself in a few words</label>
            <input required type="text" name="bio" className={inputCN} />
          </div>
          <div>
            <label htmlFor="birthdate" className="text-sm text-stone-500 mb-1">Your brth date</label>
            <input required type="date" name="birthdate" className={inputCN} />
          </div>
          <div className="relative flex items-end gap-2">
            <div className="group">
              <button
                type="button"
                title="Clear avatar"
                onClick={clearAvatar}
                className="top-0 left-12 absolute group-hover:opacity-100 opacity-0 transition-opacity">
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
              <input ref={inputFileRef} required type="file" name="avatar" className={inputCN} onChange={handleFileChange} />
            </div>
          </div>
          <button type="submit" className={`${buttonCN.big} ${buttonCN.primary} w-full block`}>Register</button>
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
