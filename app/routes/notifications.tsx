import Container from "@/components/Container"
import { readNotifications } from "@/lib/api.server"
import { MEDIA_URL } from "@/lib/config"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, headingCN, linkCN } from "@/lib/style"
import type { RootLoaderData } from "@/root"
import { ArrowPathRoundedSquareIcon, AtSymbolIcon, ChatBubbleLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useMatches, useTransition } from "@remix-run/react"
import { motion } from 'framer-motion'

type LoaderData = { time: number }

export const loader: LoaderFunction = () => {
  return json<LoaderData>({
    time: new Date().getTime()
  })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const form = await request.formData()
  const time = form.get('time') as string
  await readNotifications(token, time)
  return json({ success: true })
}

export default function Notifications() {
  const m = useMatches()
  const { notifications } = m[0].data as RootLoaderData
  const { time } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const loading = transition.state !== 'idle'

  return (
    <Container>
      <h1 className={headingCN}>Notifications</h1>
      <Form method="post" replace>
        <input type="hidden" name="time" value={time} />
        <button type="submit" disabled={loading} className={`mb-8 ${buttonCN.normal} ${buttonCN.primary}`}>
          Mark all as read
        </button>
      </Form>
      <ul className="divide-y divide-stone-300">
        {notifications.length === 0 && (
          <p>Nothing to show here</p>
        )}
        {notifications.map((item) => (
          <motion.li 
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-start gap-4 pt-8 pb-4'>
            <div className="relative">
              <img
                alt='avatar'
                loading='lazy'
                className='w-12 h-12 rounded-lg border border-gray-300'
                src={MEDIA_URL.concat(item.user.avatar)}
              />
              <span className="rounded-lg p-1 absolute -top-3 -right-3 bg-white">
                {item.type === 'reply' && (
                  <ChatBubbleLeftIcon className="w-5 h-5 text-sky-500" />
                )}
                {item.type === 'reblog' && (
                  <ArrowPathRoundedSquareIcon className="w-5 h-5 text-green-500" />
                )}
                {item.type === 'mention' && (
                  <AtSymbolIcon className="w-5 h-5 text-purple-500" />
                )}
                {item.type === 'follow' && (
                  <UserPlusIcon className="w-5 h-5 text-purple-500" />
                )}
              </span>
            </div>
            <div className="flex-grow truncate">
              <Link to={item.type === 'follow' ? `/u/${item.user.url}` : `/p/${item.id}`}>
                <span className={linkCN}>@{item.user.url}</span>
                {' '}
                {item.type === 'follow' && <span className="hover:underline">is now following you!</span>}
                {item.type === 'reply' && <span className="hover:underline">has replied to your post</span>}
                {item.type === 'reblog' && <span className="hover:underline">has rebloged your post</span>}
                {item.type === 'mention' && <span className="hover:underline">has mentioned you in a post</span>}
              </Link>
              <p className="text-xs mt-1 font-medium text-stone-500">
                {new Date(item.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </Container>
  )
}
