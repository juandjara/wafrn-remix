import { useCatch, useLocation } from "@remix-run/react"
import ErrorPage from "./ErrorPage"

export default function GenericCatchBoundary() {
  const loc = useLocation()
  const { status, statusText, data } = useCatch()
  const title = `HTTP ${status} ${statusText}`

  if (status === 404) {
    return <ErrorPage title={title} details={`There is nothing at ${loc.pathname}`} />
  }

  return <ErrorPage title={title} details={typeof data === 'object' ? data?.message : data} />
}