import Container from '@/components/Container'
import PostList from '@/components/post/PostList'
import type { Post } from '@/lib/api.server'
import { getDashboard } from '@/lib/api.server'
import { requireUserSession } from '@/lib/session.server'
import { cardCN, linkCN } from '@/lib/style'
import useUser from '@/lib/useUser'
import useUserRelations from '@/lib/useUserRelations'
import type { LoaderFunction} from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
  params: {
    page: number
    startScroll: number
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const sp = new URL(request.url).searchParams
  const page = Number(sp.get('page')) || 0
  const startScroll = Number(sp.get('startScroll')) || Date.now()
  const params = { page, startScroll }

  const posts = await getDashboard(token, params)
  return json<LoaderData>({ posts, params })
}

export default function Dashboard() {
  const { posts, params: { startScroll } } = useLoaderData<LoaderData>()
  const user = useUser()
  const { followedUsers } = useUserRelations()
  const followingNoOne = followedUsers.filter(id => id !== user?.userId).length === 0
  
  return (
    <Container>
      {followingNoOne && (
        <div className={`mb-6 ${cardCN}`}>
          <p>
            You are following no one, so only your posts will be shown here.
            <br />
            You can go to <Link className={linkCN} to='/explore'>Explore</Link> to see more posts.
          </p>
        </div>
      )}
      <PostList
        initialPosts={posts}
        getPageURL={page => `/dashboard?index&page=${page}&startScroll=${startScroll}`}
      />
    </Container>
  )
}
