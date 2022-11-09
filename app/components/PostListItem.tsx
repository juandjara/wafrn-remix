import type { Post } from "@/lib/api.server"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import PostContent from "./PostContent"

export default function PostListItem({ post, root = false }: { post: Post, root?: boolean }) {
  const children = (post.ancestors || [])
    .filter(p => p.content || p.tags.length)
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime()
      const bDate = new Date(b.updatedAt).getTime()
      return aDate - bDate
    })

  return (
    <li className={clsx('bg-white', root ? 'border border-gray-300 rounded-md p-4' : 'py-4')}>
      {root && children.length > 0 ? (
        <div className='flex items-center gap-2 my-2'>        
          <img
            alt='avatar'
            loading='lazy'
            className='w-8 h-8 rounded-lg'
            src={'https://media.wafrn.net'.concat(post.user.avatar)}
          />
          <div className="flex-grow truncate">
            <Link className='text-purple-700 hover:underline' to={`/u/${post.user.url}`}>
              {post.user.url}
            </Link>
            <span> rebloged</span>
          </div>
        </div>
      ) : null}
      {!!children.length && (
        <ul className='divide-y divide-gray-300 border-t border-gray-300'>
          {children.map((p) => <PostListItem key={p.id} post={p} />)}
        </ul>
      )}
      {post.content || post.tags.length ? (
        <>
          <div className={clsx('flex items-center gap-2 my-2', { 'pt-6 mt-0 border-t border-gray-300': root && post.ancestors?.length })}>
            <img
              alt='avatar'
              loading='lazy'
              className='w-8 h-8 rounded-lg'
              src={'https://media.wafrn.net'.concat(post.user.avatar)}
            />
            <div className="flex-grow truncate">
              <Link className='text-purple-700 hover:underline' to={`/u/${post.user.url}`}>
                {post.user.url}
              </Link>
            </div>
            <button className='py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md'>Follow</button>
            <button className='py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md'>Share</button>
          </div>
          <PostContent post={post} />
          {post.tags.length ? (
            <div className='mt-2 flex items-center gap-1 flex-wrap'>
              {post.tags.map(({ tagName }, i) => (
                <span 
                  key={i}
                  className='bg-purple-500 text-white py-1 px-1.5 text-xs font-bold rounded-md'
                >#{tagName}</span>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {root && (
        <div className='flex justify-end gap-3 border-t border-gray-300 pt-4 mt-4'>
          <button className='py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md'>Quick Reblog</button>
          <button className='py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md'>Reblog</button>
          <button className='py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md'>Report</button>
        </div>
      )}
    </li>
  )
}
