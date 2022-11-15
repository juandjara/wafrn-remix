import { getSessionData } from "@/lib/session.server"
import type { LoaderFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await getSessionData(request)
  const redirectURL = user ? '/dashboard' : '/login'
  return redirect(redirectURL)
}
