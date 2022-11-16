import Container from '@/components/Container'
import PostList from '@/components/post/PostList'
import type { Post } from '@/lib/api.server'
import { getUserRelations } from '@/lib/api.server'
import { getDashboard } from '@/lib/api.server'
import { requireUserSession, setFlashMessage } from '@/lib/session.server'
import type { LoaderFunction} from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
  params: {
    page: number
    startScroll: number
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const { token, user } = await requireUserSession(request)
  const { followedUsers } = await getUserRelations(token)
  const followingNoOne = followedUsers.filter(id => id !== user?.userId).length === 0
  
  if (followingNoOne) {
    const cookie = await setFlashMessage(request, 'You are following no one, so we took you to the explore page')
    throw redirect('/explore', {
      headers: {
        'Set-Cookie': cookie
      }
    })
  }

  const sp = new URL(request.url).searchParams
  const page = Number(sp.get('page')) || 0
  const startScroll = Number(sp.get('startScroll')) || Date.now()
  const params = { page, startScroll }

  const posts = await getDashboard(token, params)
  return json<LoaderData>({ posts, params })
}

export default function Dashboard() {
  const { posts, params: { startScroll } } = useLoaderData<LoaderData>()

  return (
    <Container className='mt-12'>
      <PostList
        initialPosts={posts}
        getPageURL={page => `/explore?index&page=${page}&startScroll=${startScroll}`}
      />
    </Container>
  )
}
