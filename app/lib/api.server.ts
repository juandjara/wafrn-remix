import { API_URL } from './config'
import formatImage from './formatImage'
import { linkCN } from './style'
import imageExtensions from 'image-extensions'

export type PostTag = {
  tagName: string
  tagPostRelations: Array<{
    createdAt: string
    updatedAt: string
    postId: string
    tagId: string
  }>
}

export type PostUser = {
  id: string
  avatar: string
  url: string
  description: string
}

export type PostMention = {
  userId: string
  user: PostUser
}

export type PostMedia = {
  id: string
  NSFW: boolean
  adultContent: boolean
  description: string
  url: string
  postMediaRelations: Array<{
    createdAt: string
    updatedAt: string
    postId: string
    mediaId: string
  }>
}

export type Post = {
  id: string
  NSFW: boolean
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  user: PostUser
  medias: PostMedia[]
  tags: PostTag[]
  postMentionsUserRelations: PostMention[]
  ancestors?: Omit<Post, 'ancestors'>[]
  notes: number
}

type postJSONParams = {
  url: string
  body: Record<string, unknown>
  token?: string
}

async function handleApiResponse(res: Response) {
  const url = res.url.replace(API_URL, '')
  if (!res.ok) {
    let text = await res.text()
    throw new Error(`Bad status code ${res.status} from API at ${url} - ${text}`)
  }

  let text
  let json
  try {
    text = await res.text()
    json = JSON.parse(text)
  } catch (e) {
    throw new Error(`Failed parsing JSON response from text "${text}"`)
  }

  if (json.success === false) {
    throw new Error(`Bad response from API at ${url} - ${json.errorMessage || 'no success'}`)
  }

  return json
}

async function postJSON({ url, body, token }: postJSONParams) {
  const fullurl = API_URL.concat(url)
  const res = await fetch(fullurl, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  })

  return handleApiResponse(res)
}

export async function getPost(id: string) {
  const url = `${API_URL}/singlePost/${id}`
  const res = await fetch(url)
  const post = await res.json()

  if (post.success === false) {
    throw new Response('Error calling API at /singlePost/:id', { status: 500, statusText: 'Server Error' })
  }

  return processPost(post)
}

export type UserDetails = {
  id: string
  avatar: string
  description: string
  url: string
  NSFW: boolean
}

export async function getDetails(userUrl: string) {
  const url = `${API_URL}/user?id=${userUrl}`
  const res = await fetch(url)
  const text = await res.text()
  if (!text) {
    throw new Response(`User "${userUrl}" not found`, { status: 404, statusText: 'Not Found' })
  }

  const data = JSON.parse(text)

  if (data.success === false) {
    throw new Response(`User "${userUrl}" not found`, { status: 404, statusText: 'Not Found' })
  }

  const details = data as UserDetails
  details.description = await sanitizeHTML(details.description)

  return details
}

export async function getExplore({ page, startScroll }: { page: number; startScroll: number }) {
  const res = await fetch(`${API_URL}/explore?page=${page}&startScroll=${startScroll}`)
  const posts = await res.json()

  for (const post of posts) {
    await processPost(post)
  }

  return posts as Post[]
}

export async function getDashboard(token: string, { page, startScroll }: { page: number; startScroll: number }) {
  const url = `${API_URL}/dashboard?page=${page}&startScroll=${startScroll}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const posts = await res.json()

  for (const post of posts) {
    await processPost(post)
  }

  return posts as Post[]
}

export type UserRelations = {
  followedUsers: string[] // array of user ids
  blockedUsers: string[] // array of user ids
}

export async function getUserRelations(token: string) {
  const url = `${API_URL}/getFollowedUsers`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await res.json()

  if (data.success === false) {
    throw new Response('Error calling API at /getFollowedUsers', { status: 500, statusText: 'Server Error' })
  }

  return data as UserRelations
}

export async function getBlog({ id, page, startScroll }: { id: string; page: number; startScroll: number }) {
  const url = `${API_URL}/blog?id=${id}&page=${page}&startScroll=${startScroll}`
  const res = await fetch(url)
  const posts = await res.json()

  if (posts.success === false) {
    throw new Response('Error calling API at /blog', { status: 500, statusText: 'Server Error' })
  }

  for (const post of posts) {
    await processPost(post)
  }

  return posts as Post[]
}

export async function searchPosts({ query, page }: { query: string; page: number }) {
  const url = `${API_URL}/search/?term=${query}&page=${page}`
  const res = await fetch(url)

  const results = await res.json()

  if (results.success === false) {
    throw new Response('Error calling API at /search/:term', { status: 500, statusText: 'Server Error' })
  }

  for (const post of results.posts) {
    await processPost(post)
  }

  return {
    posts: results.posts as Post[],
    users: results.users as PostUser[]
  }
}

async function processPost(post: Post) {
  if (post.content) {
    await processPostContent(post)
  }
  if (post.ancestors) {    
    for (const ancestor of post.ancestors) {
      await processPostContent(ancestor)
    }
  }

  return post
}

const contentMap = new Map()

async function processPostContent(post: Post) {
  let content = post.content

  // if this post has been previously visited, return processed html from the cache
  if (contentMap.has(post.id)) {
    post.content = contentMap.get(post.id)
  } else {
    // iterate over mention data and replace each ocurrence with a link
    for (const m of post.postMentionsUserRelations) {
      const key = `[mentionuserid="${m.userId}"]`
      const value = `<a 
          data-mention="${m.user.url}"
          class="${linkCN}"
          href="/u/${m.user.url}">@${m.user.url.replace(/^@/, '')}</a>`
      content = content.replace(key, value)
    }

    // TODO: this is not working now, because html is not replaced ok and [wafrnmediaid] is not written into content
    // iterate over media files and replace each ocurrence with the media element or a static version of the media wrapper
    for (const m of post.medias) {
      const key = `[wafrnmediaid="${m.id}"]`
      const extension = m.url.split('.').slice(-1)[0]
      const isImage = imageExtensions.includes(extension)
      const isSensible = m.NSFW || m.adultContent
      const value = isSensible 
        ? `<img
            loading="lazy"
            src="/img/nsfw.webp"
            data-src="${formatImage(m.url)}"
            data-type="${isImage ? 'image' : 'video'}"
            data-nsfw="true"
          />`
        : isImage
          ? `<img loading="lazy" src="${formatImage(m.url)}" alt=${m.description} />`
          : `<video controls src="${formatImage(m.url)}" />`
  
      content = content.replace(key, value)
    }

    const html = await sanitizeHTML(content)
  
    // store visited post in the cache
    contentMap.set(post.id, html)
    post.content = contentMap.get(post.id)
  }
}

export async function sanitizeHTML(content: string) {
  // load the html parsing libraries
  const [ unified, rehypeParse, rehypeSanitize, rehypeStringify ] = await Promise.all([
    import('unified').then(mod => mod.unified),
    import('rehype-parse').then(mod => mod.default),
    import('rehype-sanitize'),
    import('rehype-stringify').then(mod => mod.default)
  ])

  // apply the html sanitizer
  const html = await unified()
    .use(rehypeParse, {fragment: true})
    .use(rehypeSanitize.default, {
      ...rehypeSanitize.defaultSchema,
      tagNames: [...(rehypeSanitize.defaultSchema.tagNames || []), 'marquee', 'video', 'u'],
      attributes: {
        ...rehypeSanitize.defaultSchema.attributes,
        '*': ['data*', 'className', 'style', ...(rehypeSanitize.defaultSchema.attributes?.['*'] || [])],
        'img': ['loading', ...(rehypeSanitize.defaultSchema.attributes?.['img'] || [])],
        'video': ['src', 'controls', ...(rehypeSanitize.defaultSchema.attributes?.['video'] || [])],
      }
    })
    .use(rehypeStringify)
    .process(content)

  return html.toString()
}

export async function login({ email, password, captcha }: { email: string; password: string; captcha: string }) {
  return postJSON({
    url: '/login',
    body: {
      email,
      password,
      captchaResponse: captcha
    }
  })
}

export async function register(form: FormData) {
  const url = `${API_URL}/register`

  const res = await fetch(url, {
    body: form,
    method: 'POST',
  })

  return handleApiResponse(res)
}

export async function toggleFollow(token: string, { userId, isFollowing }: { userId: string; isFollowing: boolean }) {
  return postJSON({
    token,
    url: `/${isFollowing ? 'unfollow' : 'follow'}`,
    body: { userId }
  })
}

export async function editProfile(token: string, form: FormData) {
  const url = `${API_URL}/editProfile`
  const res = await fetch(url, {
    body: form,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return handleApiResponse(res)
}

export async function activate({ email, code }: { email: string; code: string }) {
  return postJSON({
    url: '/activateUser',
    body: { email, code }
  })
}

export async function requestPasswordChange({ email, captchaResponse }: { email: string; captchaResponse: string }) {
  return postJSON({
    url: '/forgotPassword',
    body: { email, captchaResponse }
  })
}

export async function changePassword({ email, password, code }: { email: string; password: string; code: string }) {
  return postJSON({
    url: '/resetPassword',
    body: { email, password, code }
  })
}

type CreatePostBody = {
  captchaKey: string
  parent: string
  content: string
  tags: string
  content_warning: string
}

export async function createPost(token: string, body: CreatePostBody) {
  return postJSON({
    url: '/createPost',
    token,
    body
  })
}

export async function blockUser(token: string, userId: string) {
  return postJSON({
    token,
    url: '/block',
    body: { userId }
  })
}

export async function deletePost(token: string, postId: string) {
  const url = `${API_URL}/deletePost?id=${postId}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return handleApiResponse(res)
}

type ReportBody = {
  description: string
  severity: string
  postId: string
}

export async function reportPost(token: string, body: ReportBody) {
  return postJSON({
    token,
    url: '/reportPost',
    body
  })
}

export type APINotifications = {
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

export async function getNotifications(token: string) {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await handleApiResponse(res)
  return data as APINotifications
}

export async function readNotifications(token: string, time: string) {
  return postJSON({
    token,
    url: '/readNotifications',
    body: { time }
  })
}
