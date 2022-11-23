import type { Post, PostUser} from "@/lib/api.server"
import { searchPosts } from "@/lib/api.server"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"

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

  return json({ posts: data.posts, users: data.users, params })
}