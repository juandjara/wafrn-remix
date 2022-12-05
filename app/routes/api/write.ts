import type { UploadedMedia } from "@/components/editor/ImageUpload"
import type { PostEditorMention } from "@/components/editor/PostEditor"
import { createPost } from "@/lib/api.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionFunction} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  let content = formData.get('content') as string || ''
  content = content.replaceAll('﻿', '')

  let files = JSON.parse(formData.get('files') as string || '[]') as UploadedMedia[]
  for (const file of files) {
    if (content.includes(file.html)) {
      content = content.replace(file.html, `[wafrnmediaid="${file.id}"]`)
    }
  }

  const mentions = JSON.parse(formData.get('mentions') as string || '[]') as PostEditorMention[]
  for (const mention of mentions) {
    if (content.includes(mention.html)) {
      content = content.replace(mention.html, `[mentionuserid="${mention.id}"]`)
    }
  }

  const tags = formData.get('tags') as string
  const isReblog = !tags && !content

  const captchaKey = formData.get('g-recaptcha-response') as string
  const parent = formData.get('parent') as string
  const content_warning = formData.get('content_warning') as string

  try {
    await createPost(token, {
      captchaKey,
      content,
      content_warning,
      parent,
      tags
    })
    const message = `Your ${isReblog ? 'reblog' : 'post'} was successfully published!`
    const cookie = await setFlashMessage(request, message)
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': cookie
      },
    })
  } catch(err) {
    console.error(err)
    return json({ success: false, error: String(err) })
  }
}
