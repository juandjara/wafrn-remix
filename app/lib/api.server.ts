import { MEDIA_URL, API_URL } from './config'

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
  userId: string
  user: PostUser
  medias: PostMedia[]
  tags: PostTag[]
  postMentionsUserRelations: PostMention[]
  ancestors?: Omit<Post, 'ancestors'>[]
  notes: number
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
    throw new Response('Error calling API at /userDetails', { status: 500, statusText: 'Server Error' })
  }

  return data as UserDetails
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

export async function login(form: FormData) {
  const url = `${API_URL}/login`

  const res = await fetch(url, {
    body: form,
    method: 'POST',
  })

  try {
    const text = await res.text()
    const data = JSON.parse(text)

    if (data.success === false) {
      throw new Response('Error calling API at /login', { status: 500, statusText: 'Server Error' })
    }
  
    return data.token
  } catch (err) {
    throw err
  }
}

export async function register(form: FormData) {
  const url = `${API_URL}/register`

  const res = await fetch(url, {
    body: form,
    method: 'POST',
  })

  if (!res.ok) {
    throw new Response('Error calling API at /register - bad status code', { status: res.status, statusText: res.statusText })
  }

  try {
    const text = await res.text()
    const data = JSON.parse(text)

    if (data.success === false) {
      throw new Response('Error calling API at /register - bad success response', { status: 500, statusText: 'Server Error' })
    }
  
    return data
  } catch (err) {
    throw err
  }
}

export async function toggleFollow(token: string, { userId, isFollowing }: { userId: string; isFollowing: boolean }) {
  const operation = isFollowing ? 'unfollow' : 'follow'
  const url = `${API_URL}/${operation}`
  const form = new FormData()
  form.set('userId', userId)

  const res = await fetch(url, {
    body: form,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  try {
    const text = await res.text()
    const data = JSON.parse(text)

    if (data.success === false) {
      throw new Response(`Error calling API at /${operation}`, { status: 500, statusText: 'Server Error' })
    }
  
    return data
  } catch (err) {
    throw err
  }
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

  try {
    const data = await res.json()

    if (data.success === false) {
      throw new Response(`Error calling API at /editProfile`, { status: 500, statusText: 'Server Error' })
    }
  
    return data
  } catch (err) {
    throw err
  }
}

export async function activate({ email, code }: { email: string; code: string }) {
  const url = `${API_URL}/activateUser`
  const form = new FormData()
  form.set('email', email)
  form.set('code', code)

  const res = await fetch(url, {
    body: form,
    method: 'POST'
  })

  try {
    const data = await res.json()

    if (data.success === false) {
      throw new Response(`Error calling API at /activateUser`, { status: 500, statusText: 'Server Error' })
    }
  
    return data
  } catch (err) {
    throw err
  }
}

export async function requestPasswordChange(form: FormData) {
  const url = `${API_URL}/forgotPassword`

  const res = await fetch(url, {
    body: form,
    method: 'POST',
  })

  if (!res.ok) {
    throw new Response('Error calling API at /forgotPassword - bad status code', { status: res.status, statusText: res.statusText })
  }

  try {
    const text = await res.text()
    const data = JSON.parse(text)

    if (data.success === false) {
      throw new Response('Error calling API at /forgotPassword - bad success response', { status: 500, statusText: 'Server Error' })
    }
  
    return data
  } catch (err) {
    throw err
  }
}

