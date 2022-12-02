import { linkCN } from "@/lib/style"
import { Link } from "@remix-run/react"
import type { HTMLProps} from 'react'
import { isValidElement } from 'react'
import { Children } from 'react'
import { createElement, Fragment, useEffect, useState } from 'react'
import Embed from "../embed/Embed"
import MediaWrapper from "./MediaWrapper"

export default function PostContent({ content }: { content: string }) {
  return (
    <div className='ql-editor' style={{ padding: '8px 0 24px 0' }}>
      {useProcessor(content)}
    </div>
  )
}

function isLink(text = '') {
  try {
    const u = new URL(text)
    return u.protocol.startsWith('http')
  } catch (err) {
    return false
  }
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
              // try to extract links from paragraphs and turn them into embeds
              try {
                const children = Children.toArray(props.children)
                // if this paragraph has only a single child
                if (children.length === 1) {
                  // and the single child is text and a valid link
                  if (typeof children[0] === 'string' && isLink(children[0])) {
                    return <Embed link={children[0]} />
                  }
                  // or the single child is an element with a valid link as a href prop
                  if (isValidElement(children[0]) && isLink(children[0].props.href)) {
                    return <Embed link={children[0].props.href} />
                  }
                }

                return <p {...props} />
              } catch (err) {
                return <p {...props} />
              }
            },
            a: (props: HTMLProps<HTMLAnchorElement>) => {
              // convert mention links to internal links to avoid full page reload when clicking
              if ((props as any)['data-mention']) {
                return (
                  <Link to={props.href!} className={linkCN}>
                    {props.children}
                  </Link>
                )
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
