import type { Post } from "@/lib/api.server"
import { AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import PostCard from "./PostCard"

type PostListProps = {
  posts: Post[]
  loadNextPage: () => void
}

export default function PostList({ posts, loadNextPage }: PostListProps) {
  const [intersectionRef, triggerIsInView] =  useInView()

  useEffect(() => {
    if (triggerIsInView) {
      loadNextPage()
    }
    // eslint-disable-next-line
  }, [triggerIsInView])

  return (
    <>
      <AnimatePresence>
        <ul className='space-y-6'>
          {posts.map((p) => <PostCard root key={p.id} post={p} />)}
        </ul>
      </AnimatePresence>
      <div ref={intersectionRef}>
        <svg className="animate-spin my-8 mx-auto h-12 w-12 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </>
  )  
}
