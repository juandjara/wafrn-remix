import type { RootLoaderData } from "@/root"
import { useMatches } from "@remix-run/react"

export default function useCaptchaKey() {
  const m = useMatches()
  const rootData = m[0].data as RootLoaderData
  return rootData.recaptchaKey
}
