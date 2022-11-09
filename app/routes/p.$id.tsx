import Container from "@/components/Container"
import PostCard from "@/components/PostCard"
import type { Post } from "@/lib/api.server"
import { getPost } from "@/lib/api.server"
import { LoaderFunction, redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

type LoaderData = {
  post: Post
}

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id
  if (!id) {
    throw redirect('/')
  }

  const post = await getPost(id)

  return json<LoaderData>({ post })
}

export default function PostDetail() {
  const { post } = useLoaderData<LoaderData>()
  return (
    <Container className="mt-8">
      <PostCard root post={post} />
    </Container>
  )  
}
