import { MEDIA_URL } from './config'

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
  user: PostUser
  medias: PostMedia[]
  tags: PostTag[]
  postMentionsUserRelations: PostMention[]
  ancestors?: Omit<Post, 'ancestors'>[]
  notes: number
}

const API_URL = 'https://api.wafrn.net'

export async function getPost(id: string) {
  const url = `${API_URL}/singlePost/${id}`
  const res = await fetch(url)
  const post = await res.json()

  if (post.success === false) {
    throw new Response('Error calling API at /singlePost/:id', { status: 500, statusText: 'Server Error' })
  }

  return processPost(post)
}

export async function getDetails(id: string) {
  const url = `${API_URL}/user?id=${id}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.success === false) {
    throw new Response('Error calling API at /userDetails', { status: 500, statusText: 'Server Error' })
  }

  return data
}

export async function getExplore({ page, startScroll }: { page: number; startScroll: number }) {
  const res = await fetch(`${API_URL}/explore?page=${page}&startScroll=${startScroll}`)
  const posts = await res.json()

  for (const post of posts) {
    await processPost(post)
  }

  return posts as Post[]
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
    await processHTML(post)
  }
  if (post.ancestors) {    
    for (const ancestor of post.ancestors) {
      await processHTML(ancestor)
    }
  }

  return post
}

const contentMap = new Map()

async function processHTML(post: Post) {
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
          class="text-purple-700 hover:underline"
          href="/u/${m.user.url}">@${m.user.url}</a>`
      content = content.replace(key, value)
    }

    // iterate over media files and replace each ocurrence with the media element or a static version of the media wrapper
    for (const m of post.medias) {
      const key = `[wafrnmediaid="${m.id}"]`
      const extension = m.url.split('.').slice(-1)[0]
      const isImage = extension === 'webp'
      const isSensible = m.NSFW || m.adultContent
      const value = isSensible 
        ? `<img
            loading="lazy"
            src="/img/nsfw.webp"
            data-src="${MEDIA_URL}${m.url}"
            data-type="${isImage ? 'image' : 'video'}"
            data-nsfw="true"
          />`
        : isImage
          ? `<img loading="lazy" src="${MEDIA_URL}${m.url}" alt=${m.description} />`
          : `<video controls src="${MEDIA_URL}${m.url}" />`
  
      content = content.replace(key, value)
    }
  
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
        attributes: {
          ...rehypeSanitize.defaultSchema.attributes,
          '*': ['data*', 'className', 'style', ...(rehypeSanitize.defaultSchema.attributes?.['*'] || [])],
          'img': ['loading', ...(rehypeSanitize.defaultSchema.attributes?.['img'] || [])],
        }
      })
      .use(rehypeStringify)
      .process(content)
  
    // store visited post in the cache
    contentMap.set(post.id, html.toString())
    post.content = contentMap.get(post.id)
  }
}

type LoginParams = {
  email: string
  password: string
  captchaResponse: string
}

export async function login(form: FormData) {
  const url = `${API_URL}/login`

  const res = await fetch(url, {
    body: form,
    method: 'POST',
  })

  try {
    const text = await res.text()
    console.log(text)
    const data = JSON.parse(text)

    if (data.success === false) {
      throw new Response('Error calling API at /login', { status: 500, statusText: 'Server Error' })
    }
  
    return data.token
  } catch (err) {
    throw err
  }
}
