import type { Post } from "@/lib/api.server"
import { Link } from "@remix-run/react"
import type { HTMLProps } from 'react'
import { Children } from 'react'
import { createElement, Fragment, useEffect, useState } from 'react'
import MediaWrapper from "./MediaWrapper"
import YoutubeEmbed from "./YoutubeEmbed"

export default function PostContent({ post }: { post: Post }) {
  return (
    <div className='ql-editor' style={{ padding: '16px 0' }}>
      {useProcessor(post.content)}
    </div>
  )
}

function useProcessor(text: string) {
  const [Content, setContent] = useState(<div dangerouslySetInnerHTML={{ __html: text }}></div>)

  useEffect(() => {
    let mounted = true
    Promise.all([
      import('unified').then(mod => mod.unified),
      import('rehype-parse').then(mod => mod.default),
      import('rehype-react').then(mod => mod.default),
    ]).then(([ unified, rehypeParse, rehypeReact ]) => {
      unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeReact, {
          Fragment,
          createElement,
          components: {
            img: (props: HTMLProps<HTMLImageElement>) => (
              <MediaWrapper
                nsfw={(props as any)['data-nsfw'] === 'true'}
                type={(props as any)['data-type'] || 'image'}
                src={(props as any)['data-src'] || props.src}
                alt={props.alt}
              />
            ),
            p: (props: HTMLProps<HTMLParagraphElement>) => {
              try {
                const urlText = Children.toArray(props.children)
                if (urlText.length === 1 && typeof urlText[0] === 'string') {
                  const ytID = getYoutubeID(urlText[0])
                  if (ytID) {
                    return <YoutubeEmbed id={ytID} />
                  }
                }

                return <p {...props} />
              } catch (err) {
                return <p {...props} />
              }
            },
            a: (props: HTMLProps<HTMLAnchorElement>) => {
              const linkCN = 'text-purple-700 hover:underline'
              if ((props as any)['data-mention']) {
                return (
                  <Link to={props.href!} className={linkCN}>
                    {props.children}
                  </Link>
                )
              }

              let ytID = getYoutubeID(props.href)
              if (ytID) {
                return <YoutubeEmbed id={ytID} />
              }

              return (
                <a {...props} className={`${props.className || ''} ${linkCN}`}>
                  {props.children}
                </a>
              )
            },
          }
        })
        .process(text)
        .then((file) => {
          if (mounted) {
            setContent(file.result)
          }
        })
    })
    return () => {
      mounted = false
    }
  }, [text])

  return Content
}

function getYoutubeID(link = '') {
  try {
    let ytID = null
    if (link.includes('youtube.com/watch')) {
      ytID = new URL(link).searchParams.get('v')
    }
    if (link.includes('https://youtu.be')) {
      ytID = new URL(link).pathname
    }
    return ytID
  } catch (err) {
    return null
  }
}
