import Container from '@/components/Container'
import PostList from '@/components/PostList'
import Spinner from '@/components/Spinner'
import type { Post, PostUser} from '@/lib/api.server'
import { searchPosts } from '@/lib/api.server'
import { buttonCN } from '@/lib/style'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
  users: PostUser[]
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

  let data = {
    posts: [] as Post[],
    users: [] as PostUser[]
  }

  if (query) {
    data = await searchPosts(params)
  }

  return json<LoaderData>({ posts: data.posts, users: data.users, params })
}

export default function Search() {
  const { users, posts, params: { query } } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  return (
    <Container>
      <header className='mt-6 mb-8'>
        <h1 className='text-4xl font-medium text-gray-500'>
          {query ? `Searching for "${query}"` : 'Search'}
        </h1>
        <p className='mt-4'>
          You can search for users by url and description, and posts by tags. No need to add # to your search. Have fun!
        </p>
      </header>
      <Form className='my-4'>
        <label htmlFor="q" className='text-stone-500 mb-1 block text-xs'>Search term</label>
        <div className='flex items-center gap-2'>
          <input className='border-stone-200 border rounded-md flex-grow py-1 px-2' name="q" defaultValue={query} />
          <button
            type='submit'
            disabled={busy}
            className={`${buttonCN.small} ${buttonCN.primary} ${buttonCN.iconLeft} rounded-md border border-purple-200`}
          >
            {busy ? <Spinner size='w-4 h-4' /> : <MagnifyingGlassIcon className='w-4 h-4' />}
            <p>Search</p>
          </button>
        </div>
      </Form>
      <p className='mt-8 mb-1'>
        Found {users.length >= 20 ? '20+' : users.length} user{users.length === 1 ? '' : 's'}
      </p>
      <ul className='space-y-4'>
        {users.map((user) => (
          <li key={user.url} className="flex items-start gap-4 bg-white px-4 py-3 rounded-md border border-stone-300">
            <img
              alt='avatar'
              loading='lazy'
              className='w-12 h-12 rounded-lg flex-shrink-0 my-1'
              src={'https://media.wafrn.net'.concat(user.avatar)}
            />
            <div className="flex-grow">
              <Link className='text-purple-700 text-lg hover:underline' to={`/u/${user.url}`}>
                {user.url}
              </Link>
              <p className='mt-1'>{user.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className='mt-8 mb-1'>
        Found {posts.length >= 20 ? '20+' : posts.length} post{posts.length === 1 ? '' : 's'}
      </p>
      <PostList
        initialPosts={posts}
        getPageURL={page => `/search?index&q=${query}&page=${page}`}
      />
    </Container>
  )
}
