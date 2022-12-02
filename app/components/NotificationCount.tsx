import type { PostUser } from "@/lib/api.server"
import { Link } from "@remix-run/react"

export type Notifications = {
  reblogs: {
    id: string
    createdAt: number
    content: string
    user: PostUser
    userId: string
  }[]
  follows: {
    avatar: string
    url: string
    follows: {
      createdAt: string
    }
  }[]
  mentions: {
    id: string
    content: string
    createdAt: string
    user: PostUser
  }[]
}

export default function NotificationCount({ notifications }: { notifications: Notifications }) {
  const { follows, mentions, reblogs } = notifications
  const count = follows.length + mentions.length + reblogs.length

  if (!count) {
    return null
  }

  return (
    <div className="fixed top-2 inset-x-2 flex justify-end">
      <Link
        to='/notifications'
        title="Notification count"
        className='block text-center h-7 w-7 leading-7 transition-shadow hover:shadow-lg bg-purple-200 text-purple-900 rounded-full'>
        <span>{count}</span>
        <span className='sr-only'>Notification count</span>
      </Link>
    </div>
  )
}
