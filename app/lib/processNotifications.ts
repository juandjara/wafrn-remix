import type { APINotifications } from './api.server'
import type { User } from './session.server'

export type Notifications = ReturnType<typeof processNotifications>

export default function processNotifications(user: User, notifications: APINotifications) {
  const mentions = notifications.mentions.map((m) => ({
    type: 'mention',
    date: new Date(m.createdAt),
    content: m.content,
    user: m.user,
    id: m.id
  }))

  const reblogs = notifications.reblogs.map((m) => ({
    type: 'reblog',
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

  let items = [...mentions, ...reblogs, ...follows].sort((a, b) => {
    const aTime = a.date.getTime()
    const bTime = b.date.getTime()
    return bTime - aTime
  })

  const ids = new Set()
  items = items.reduce((acum, next) => {
    if (!ids.has(next.id) && next.user.url !== user?.url) {
      acum.push(next)
      ids.add(next.id)
    }
    return acum
  }, [] as typeof items)

  return items
}
