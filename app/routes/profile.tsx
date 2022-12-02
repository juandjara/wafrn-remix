import Container from "@/components/Container"
import type { UserDetails } from "@/lib/api.server"
import { editProfile } from "@/lib/api.server"
import { getDetails } from "@/lib/api.server"
import { MEDIA_URL } from "@/lib/config"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, cardCN, headingCN, inputCN, labelCN, linkCN } from "@/lib/style"
import { XCircleIcon } from "@heroicons/react/20/solid"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useTransition } from "@remix-run/react"
import type { ChangeEvent} from "react"
import { useEffect} from "react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

type LoaderData = {
  details: UserDetails
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireUserSession(request)
  const details = await getDetails(user.url)

  return json<LoaderData>({ details })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const uploadHandler = unstable_createMemoryUploadHandler()
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)
  const data = await editProfile(token, formData)
  return data
}

export default function Profile() {
  const { details } = useLoaderData<LoaderData>()
  const [image, setImage] = useState(MEDIA_URL.concat(details.avatar))
  const inputFileRef = useRef<HTMLInputElement>(null)
  const actionData = useActionData()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  useEffect(() => {
    if (actionData) {
      toast.success('Your profile was updated successfully', { duration: 5000 })
    }
  }, [actionData])

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
      <h1 className={headingCN}>Edit profile</h1>
      <Form
        method="post"
        encType="multipart/form-data"
        className={cardCN}>
        <div className="relative flex items-end gap-2">
          <div className="group">
            <button
              type="button"
              title="Clear avatar"
              onClick={clearAvatar}
              className="top-0 left-12 absolute group-hover:opacity-100 opacity-0 transition-opacity">
              <XCircleIcon className="w-5 h-5 bg-white rounded-full text-stone-400 hover:text-stone-500" />
            </button>
            <img
              alt=""
              src={image || '/img/default.webp'}
              className="border border-stone-200 w-16 h-16 rounded-md flex-shrink-0"
            />
          </div>
          <div className="flex-grow">
            <label htmlFor="avatar" className={`${labelCN} mb-1`}>Upload your avatar</label>
            <input ref={inputFileRef} type="file" name="avatar" className={inputCN} onChange={handleFileChange} />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="description" className={labelCN}>Description</label>
          <input type="text" name="description" className={inputCN} defaultValue={details.description} />
        </div>  
        <button disabled={busy} className={`mt-6 ${buttonCN.normal} ${buttonCN.primary}`}>
          {busy ? 'Updating...' : 'Update'}
        </button>
        <p className="mt-8">
          To change your password, please use
          {' '}<Link className={linkCN} to='/password-reset'>the password reset form</Link>
        </p>
      </Form>
    </Container>
  )
}
