import { toggleFollow } from "@/lib/api.server"
import { requireUserSession } from "@/lib/session.server"
import type { ActionFunction } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const form = await request.formData()
  const params = {
    userId: form.get('userId') as string,
    isFollowing: form.get('isFollowing') === 'true'
  }
  const data = await toggleFollow(token, params)
  return data
}
