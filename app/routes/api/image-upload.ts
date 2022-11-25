import { ActionFunction, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_createMemoryUploadHandler()
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  )

  const files = formData.getAll('files') as File[]
  const nsfw = formData.get('nsfw') as string
  const description = formData.get('description') as string

  for (const file of files) {
  }
}
