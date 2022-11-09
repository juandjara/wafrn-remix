import Container from '@/components/Container'
import PostList from '@/components/PostList'
import { getDetails, Post, searchPosts } from '@/lib/api.server'
import { getBlog } from '@/lib/api.server'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'

type LoaderData = {
  posts: Post[]
  params: {
    query: string
    page: number
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const sp = new URL(request.url).searchParams
  const query = sp.get('q') || ''
  const page = Number(sp.get('page')) || 0
  const params = { query, page }

  let posts = [] as Post[]
  if (query) {
    posts = await searchPosts(params)
  }

  return json<LoaderData>({ posts, params })
}

export default function Blog() {
  const { posts: initialPosts, params: initialParams } = useLoaderData<LoaderData>()
  const fetcher = useFetcher()
  const [posts, setPosts] = useState(initialPosts)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    if (fetcher.data?.posts.length > 0) {
      setPosts((posts) => posts.concat(fetcher.data.posts))
    }
  }, [fetcher.data])

  function loadNextPage() {
    const currentPage = fetcher.data?.params.page || initialParams.page
    const currentPageData = fetcher.data?.posts

    // if we have data (fetcher has run at least once) and the returned data is empty (last page)
    // we asume there is no more data to fetch from the api
    const isLastPage = currentPageData && currentPageData.length === 0

    if (fetcher.state === 'idle' && !isLastPage) {
      fetcher.load(`/search?index&q=${initialParams.query}&page=${currentPage + 1}`)
    }
  }

  return (
    <Container>
      <h1 className='my-4 text-4xl font-medium text-gray-500'>
        Search {initialParams.query ? `"${initialParams.query}"` : ''}
      </h1>
      <Form className='my-4'>
        <label htmlFor="q" className='text-stone-500 mb-1 block text-xs'>Search term</label>
        <div className='flex items-center'>
          <input className='border-stone-200 border rounded-l-md flex-grow py-1 px-2' name="q" defaultValue={initialParams.query} />
          <button
            type='submit'
            className='py-1 px-2 text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-r-md'>
            Search
          </button>
        </div>
      </Form>
      <PostList
        posts={posts}
        loadNextPage={loadNextPage}
      />
    </Container>
  )
}
