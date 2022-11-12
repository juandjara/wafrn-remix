import Container from '@/components/Container'
import PostList from '@/components/PostList'
import { getDetails, Post } from '@/lib/api.server'
import { getBlog } from '@/lib/api.server'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
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

  const posts = await getBlog(_params)
  // const [detail, posts] = await Promise.all([
  //   getDetails(id),
  //   getBlog(_params)
  // ])

  return json<LoaderData>({ posts, params: _params })
}

export default function Blog() {
  const { posts, params: { id, startScroll } } = useLoaderData<LoaderData>()

  return (
    <Container>
      <h1 className='my-4 text-4xl font-medium text-gray-500'>{id}</h1>
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
