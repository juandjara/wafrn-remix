import Container from '@/components/Container'
import PostList from '@/components/post/PostList'
import type { Post, UserDetails } from '@/lib/api.server'
import { getDetails } from '@/lib/api.server'
import { getBlog } from '@/lib/api.server'
import { MEDIA_URL } from '@/lib/config'
import { buttonCN } from '@/lib/style'
import useUserRelations from '@/lib/useUserRelations'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
  detail: UserDetails
  params: {
    id: string
    page: number
    startScroll: number
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const sp = new URL(request.url).searchParams
  const id = params.id

  if (!id) {
    throw new Response('Not Found', { status: 404, statusText: 'Not Found' })
  }

  const page = Number(sp.get('page')) || 0
  const startScroll = Number(sp.get('startScroll')) || Date.now()
  const _params = { id, page, startScroll }

  const [detail, posts] = await Promise.all([
    getDetails(id),
    getBlog(_params)
  ])

  return json<LoaderData>({ detail, posts, params: _params })
}

export default function Blog() {
  const { detail, posts, params: { id, startScroll } } = useLoaderData<LoaderData>()
  const { followedUsers } = useUserRelations()
  const isFollowing = followedUsers.includes(detail.id)

  return (
    <Container>
      <div className='bg-white border border-stone-300 rounded-md p-4 my-8 flex flex-col items-center'>
        <img alt="" src={MEDIA_URL.concat(detail.avatar)} className="w-40 rounded-md border-stone-300" />
        <p className='mt-2 text-xl text-purple-900 font-medium'>{detail.url}</p>
        <p className='my-8'>{detail.description}</p>
        <button className={`${buttonCN.normal} ${isFollowing ? buttonCN.delete : buttonCN.primary} block w-full`}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>
      {posts.length === 0 && (
        <p>
          This blog is empty
        </p>
      )}
      <PostList
        initialPosts={posts}
        getPageURL={page => `/u/${id}?index&page=${page}&startScroll=${startScroll}`}
      />
    </Container>
  )
}
