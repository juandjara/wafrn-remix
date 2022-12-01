import Container from "@/components/Container"
import PostCard from "@/components/post/PostCard"
import Spinner from "@/components/Spinner"
import { blockUser, Post, reportPost } from "@/lib/api.server"
import { getPost } from "@/lib/api.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { buttonCN, cardCN, checkboxCN, inputCN, labelCN } from "@/lib/style"
import { ShieldExclamationIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import { useEffect } from "react"

type LoaderData = {
  post: Post
}

const severityOptions = [
  { value: 0, label: 'This post is spam' },
  { value: 1, label: 'This post contains NSFW media and is not labelled as such' },
  { value: 5, label: 'This post is inciting hate against a person or collective' },
  { value: 10, label: 'This post contains illegal content' }
]

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    throw redirect('/')
  }

  const post = await getPost(params.id)
  return json<LoaderData>({ post })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const userToBlock = formData.get('userToBlock') as string
  const doBlock = formData.get('doBlock') === 'on'

  if (doBlock) {
    await blockUser(token, userToBlock)
  }

  await reportPost(token, formData)
  const cookie = await setFlashMessage(request, 'The post has been reported and we will take action against it')
  return redirect('/', {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function Report() {
  const { post } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'
  const hasError = fetcher.data?.error

  useEffect(() => {
    if (fetcher.data?.success) {
      // @ts-ignore
      navigate(-1, { replace: true })
    }
  }, [fetcher, navigate])

  return (
    <Container>
      <h1 className='mb-4 text-4xl font-medium text-gray-500'>
        Report post
      </h1>
      <fetcher.Form method="post" className={cardCN}>
        <div className="mt-2">
          <label htmlFor="description" className={labelCN}>Description of your report</label>
          <textarea required name="description" className={`${inputCN}`} />
        </div>
          <p className={`${labelCN} mt-8`}>What do you think is wrong with this post?</p>
        <div className="mt-2 mx-1">
          {severityOptions.map((opt) => (
            <label key={opt.value} className="flex items-center py-2">
              <input required type="radio" name="severity" value={opt.value} className={checkboxCN} />
              <span className="block ml-3 font-medium text-stone-900">{opt.label}</span>
            </label>
          ))}
        </div>
        <p className={`${labelCN} mt-6`}>Do you want to block the user?</p>
        <label className={`mb-4 mt-2 flex items-center gap-2`}>
          <input
            name="doBlock"
            type="checkbox"
            className={`${checkboxCN} rounded`} 
          />
          <span>Yes, block the user as well</span>
        </label>
        <input type="hidden" name="userToBlock" value={post.userId} />
        <input type="hidden" name="postId" value={post.id} />
        {hasError && (
          <p className="text-red-600 text-sm mt-4">There was an error submitting your report</p>
        )}
        <button
          type='submit'
          disabled={busy}
          className={`${buttonCN.normal} ${buttonCN.primary} ${buttonCN.iconLeft} mt-6`}
        >
          {busy ? <Spinner size='w-5 h-5' /> : <ShieldExclamationIcon className='w-5 h-5' />}
          <p className="flex-grow text-center">Report</p>
        </button>
      </fetcher.Form>
      <div className="my-4">
        <PostCard root post={post} />
      </div>
    </Container>
  )
}
