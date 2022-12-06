import type { Notifications } from "@/lib/processNotifications"
import { Link } from "@remix-run/react"

export default function NotificationCount({ notifications }: { notifications: Notifications }) {
  const count = notifications.length

  if (!count) {
    return null
  }

  return (
    <div className="fixed z-20 top-2 inset-x-2 flex justify-end">
      <Link
        to='/notifications'
        title="Notification count"
        className='block text-center px-2 h-7 leading-7 transition-shadow hover:shadow-lg bg-purple-200 text-purple-900 rounded-full'>
        <span>{count}</span>
        <span className='sr-only'>Notification count</span>
      </Link>
    </div>
  )
}
