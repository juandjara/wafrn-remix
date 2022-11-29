import { deletePost } from "@/lib/api.server"
import { requireUserSession } from "@/lib/session.server"
import type { ActionFunction } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const form = await request.formData()
  const id = form.get('postId') as string
  const data = await deletePost(token, id)
  return data
}
