import { useFetcher } from "@remix-run/react"
import { cloneElement } from "react"

type DeleteFormProps = {
  postId: string
  className?: string
  children: React.ReactElement<any, 'button'>
}

export default function DeleteForm({
  postId,
  className = '',
  children
}: DeleteFormProps) {
  const fetcher = useFetcher()
  const button = cloneElement(children, {
    type: 'submit',
    disabled: fetcher.state !== 'idle'
  })
  return (
    <fetcher.Form method="post" action="/api/delete-post" className={className}>
      <input type="hidden" name="postId" value={postId} />
      {button}
    </fetcher.Form>
  )
}
