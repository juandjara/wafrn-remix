import Container from '@/components/Container'
import PostList from '@/components/post/PostList'
import type { Post } from '@/lib/api.server'
import { getExplore } from '@/lib/api.server'
import type { LoaderFunction } from '@remix-run/node'
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
  const sp = new URL(request.url).searchParams
  const page = Number(sp.get('page')) || 0
  const startScroll = Number(sp.get('startScroll')) || Date.now()
  const params = { page, startScroll }

  const posts = await getExplore(params)
  return json<LoaderData>({ posts, params })
}

export default function Explore() {
  const { posts, params: { startScroll } } = useLoaderData<LoaderData>()

  return (
    <Container>
      <h1 className='my-4 text-4xl font-medium text-gray-500'>Explore</h1>
      <PostList
        initialPosts={posts}
        getPageURL={page => `/explore?index&page=${page}&startScroll=${startScroll}`}
      />
    </Container>
  )
}
