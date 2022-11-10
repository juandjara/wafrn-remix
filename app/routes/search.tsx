import Container from '@/components/Container'
import PostList from '@/components/PostList'
import { getDetails, Post, searchPosts } from '@/lib/api.server'
import { getBlog } from '@/lib/api.server'
import { buttonCN } from '@/lib/style'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
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
      <header className='mt-6 mb-8'>
        <h1 className='text-4xl font-medium text-gray-500'>
          {initialParams.query ? `Searching for "${initialParams.query}"` : 'Search'}
        </h1>
        <p className='mt-4'>
          You can search for users by url and description, and posts by tags. No need to add # to your search. Have fun!
        </p>
      </header>
      <Form className='my-4'>
        <label htmlFor="q" className='text-stone-500 mb-1 block text-xs'>Search term</label>
        <div className='flex items-center gap-2'>
          <input className='border-stone-200 border rounded-md flex-grow py-1 px-2' name="q" defaultValue={initialParams.query} />
          <button
            type='submit'
            className={`${buttonCN.small} ${buttonCN.primary} ${buttonCN.iconLeft} rounded-md border border-purple-200`}
          >
            <MagnifyingGlassIcon className='w-4 h-4' />
            <p>Search</p>
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
