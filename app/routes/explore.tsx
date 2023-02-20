import Container from '@/components/Container'
import PostList from '@/components/post/PostList'
import type { Post } from '@/lib/api.server'
import { getExplore } from '@/lib/api.server'
import { cardCN, headingCN, linkCN } from '@/lib/style'
import useUser from '@/lib/useUser'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'

type LoaderData = {
  posts: Post[]
  params: {
    page: number
    startScroll: number
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const sp = new URL(request.url).searchParams
  const local = sp.get('local') === '1'
  const page = Number(sp.get('page')) || 0
  const startScroll = Number(sp.get('startScroll')) || Date.now()
  const params = { local, page, startScroll }

  const posts = await getExplore(params)
  return json<LoaderData>({ posts, params })
}

export default function Explore() {
  const user = useUser()
  const { posts, params: { startScroll } } = useLoaderData<LoaderData>()
  const [sp] = useSearchParams()
  const isLocal = sp.get('local') === '1'

  return (
    <Container>
      <h1 className={headingCN}>Explore: <small className='text-xl'>{isLocal ? 'Local' : 'Federated'}</small></h1>
      {!user && (
        <div className={`${cardCN} mb-8 space-y-4`}>
          <p className='text-center mt-4 mb-6'>A message from the <Link className={linkCN} to='/u/admin'>admin</Link> </p>
          <p>
            To fully enjoy this hellsite, please consider joining us, <Link className={linkCN} to='/register'>register into wafrn!</Link>
          </p>
          <p>
            Bring your twisted ideas onto others, share recipies of cake that swap the flour for mayo or hot sauce!
          </p>
          <p>
            Consider <Link className={linkCN} to='/register'>joining wafrn!</Link>
          </p>
        </div>
      )}
      <PostList
        initialPosts={posts}
        getPageURL={page => `/explore?index&page=${page}&startScroll=${startScroll}`}
      />
    </Container>
  )
}
