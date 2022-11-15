import { useMatches } from "@remix-run/react"
import type { User } from "./session.server"

export default function useUser() {
  const m = useMatches()
  return m[0].data.user as User
}
