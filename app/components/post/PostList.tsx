import type { Post } from "@/lib/api.server"
import { useFetcher } from "@remix-run/react"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import PostCard from "./PostCard"
import Spinner from "../Spinner"

type PostListProps = {
  initialPosts: Post[]
  getPageURL: (page: number) => string
}

export default function PostList({ initialPosts, getPageURL }: PostListProps) {
  const [intersectionRef, triggerIsInView] =  useInView()
  const [posts, setPosts] = useState(initialPosts)
  const fetcher = useFetcher<{ posts: Post[]; params: { page: number } }>()

  const currentPage = fetcher.data?.params.page || 0
  const currentPageData = fetcher.data?.posts

  // if we have data (fetcher has run at least once) and the returned data is empty (last page)
  // we asume there is no more data to fetch from the api
  const isLastPage = currentPageData && currentPageData.length === 0

  // append latest fetched data to total list of posts
  useEffect(() => {
    if (currentPageData && currentPageData.length > 0) {
      setPosts((posts) => posts.concat(currentPageData))
    }
  }, [currentPageData])

  // when initial params change (due to url changing or something) reset the post list to the initialPosts
  // and if fetcher data is already loaded, reload it at page 1 (with the new params)
  useEffect(() => {
    setPosts(initialPosts)
    if (fetcher.data) {
      fetcher.load(getPageURL(1))
    }
    // eslint-disable-next-line
  }, [initialPosts])

  // when intersection trigger (loading spinner) enters the viewport, try to load the next page
  useEffect(() => {
    if (triggerIsInView) {
      loadNextPage()
    }
    // eslint-disable-next-line
  }, [triggerIsInView])

  function loadNextPage() {
    // avoid fetching when already loading or no more data available
    if (fetcher.state === 'idle' && !isLastPage) {
      fetcher.load(getPageURL(currentPage + 1))
    }
  }

  return (
    <>
      <AnimatePresence>
        <ul className='space-y-6'>
          {posts.map((p) => <PostCard root key={p.id} post={p} />)}
        </ul>
      </AnimatePresence>
      {isLastPage ? null : (
        <div ref={intersectionRef}>
          <Spinner className='my-8 mx-auto' size='h-12 w-12' />
        </div>
      )}
    </>
  )  
}
