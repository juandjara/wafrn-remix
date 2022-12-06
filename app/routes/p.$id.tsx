import Container from "@/components/Container"
import PostCard from "@/components/post/PostCard"
import type { Post } from "@/lib/api.server"
import { getPost } from "@/lib/api.server"
import type { LoaderFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
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
    <Container>
      <PostCard root disableThread post={post} />
    </Container>
  )  
}
