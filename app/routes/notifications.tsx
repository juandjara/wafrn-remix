import Container from "@/components/Container"
import { MEDIA_URL } from "@/lib/config"
import { buttonCN } from "@/lib/style"
import type { RootLoaderData } from "@/root"
import { ArrowPathRoundedSquareIcon, AtSymbolIcon, ChatBubbleLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { Link, useMatches } from "@remix-run/react"
import { motion } from 'framer-motion'

export default function Notifications() {
  const m = useMatches()
  const { notifications } = m[0].data as RootLoaderData

  const mentions = notifications.mentions.map((m) => ({
    type: 'mention',
    date: new Date(m.createdAt),
    content: m.content,
    user: m.user,
    id: m.id
  }))

  const reblogs = notifications.reblogs.map((m) => ({
    type: m.content ? 'reply' : 'reblog',
    date: new Date(m.createdAt),
    content: m.content,
    user: m.user,
    id: m.id
  }))

  const follows = notifications.follows.map((m) => ({
    type: 'follow',
    date: new Date(m.follows.createdAt),
    content: '',
    user: {
      url: m.url,
      avatar: m.avatar
    },
    id: m.url,
  }))

  const items = [...mentions, ...reblogs, ...follows].sort((a, b) => {
    const aTime = a.date.getTime()
    const bTime = b.date.getTime()
    return bTime - aTime
  })

  return (
    <Container>
      <h1 className='mb-4 text-4xl font-medium text-gray-500'>Notifications</h1>
      <button className={`${buttonCN.normal} ${buttonCN.primary}`}>
        Clear all notifications
      </button>
      <ul className="divide-y divide-stone-300">
        {items.map((item) => (
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
              <Link className="hover:underline" to={item.type === 'follow' ? `/u/${item.user.url}` : `/p/${item.id}`}>
                <span className="text-purple-700">@{item.user.url}</span>
                {' '}
                {item.type === 'follow' && 'is now following you!'}
                {item.type === 'reply' && 'has replied to your post'}
                {item.type === 'reblog' && 'has rebloged your post'}
                {item.type === 'mention' && 'has mentioned you in a post'}
              </Link>
              <p className="text-xs mt-1 font-medium text-stone-500">
                {item.date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </Container>
  )
}
