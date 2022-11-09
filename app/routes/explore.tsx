import PostList from '@/components/PostList'
import type { Post } from '@/lib/api.server'
import { getExplore } from '@/lib/api.server'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'

export function links() {
  return [
    { rel: "stylesheet", href: 'https://cdn.quilljs.com/1.3.6/quill.snow.css' }
  ]
}

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
  const { posts: initialPosts, params: initialParams } = useLoaderData<LoaderData>()
  const fetcher = useFetcher()
  const [posts, setPosts] = useState(initialPosts)

  function loadNextPage() {
    const currentPage = fetcher.data?.params.page || initialParams.page
    const currentPageData = fetcher.data?.posts

    // if we have data (fetcher has run at least once) and the returned data is empty (last page)
    // we asume there is no more data to fetch from the api
    const isLastPage = currentPageData && currentPageData.length === 0

    if (fetcher.state === 'idle' && !isLastPage) {
      fetcher.load(`/explore?index&page=${currentPage + 1}&startScroll=${initialParams.startScroll}`)
    }
  }

  useEffect(() => {
    if (fetcher.data?.posts.length > 0) {
      setPosts((posts) => posts.concat(fetcher.data.posts))
    }
  }, [fetcher.data])

  return (
    <div className='p-3 mb-6 max-w-screen-md'>
      <h1 className='my-4 text-4xl font-medium text-gray-500'>Explore</h1>
      <PostList
        posts={posts}
        loadNextPage={loadNextPage}
      />
    </div>
  )
}
