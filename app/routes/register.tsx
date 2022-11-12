import Container from "@/components/Container"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import { Form, Link } from "@remix-run/react"
import { ChangeEvent, useState } from "react"

export default function Register() {
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

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
          <div className="flex items-center gap-2">
            {image && (
              <img alt="" src={image} className="w-16 h-16 rounded-md flex-shrink-0" />
            )}
            <div className="flex-grow">
              <label htmlFor="birthdate" className="text-sm text-stone-500 mb-1">Upload your avatar</label>
              <input required type="file" name="avatar" className={inputCN} onChange={handleFileChange} />
            </div>
          </div>
          <button className={`${buttonCN.big} ${buttonCN.primary} w-full block`}>Register</button>
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
