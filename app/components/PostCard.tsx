import type { Post } from "@/lib/api.server"
import { Menu } from "@headlessui/react"
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import toast from "react-hot-toast"
import PostContent from "./PostContent"
import { motion } from 'framer-motion'
import { MEDIA_URL } from "@/lib/config"

export default function PostCard({ post, root = false }: { post: Post, root?: boolean }) {
  const children = (post.ancestors || [])
    .filter(p => p.content || p.tags.length)
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime()
      const bDate = new Date(b.updatedAt).getTime()
      return aDate - bDate
    })

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx('bg-white block', root ? 'border border-gray-300 rounded-md p-4' : 'py-4')}>
      {root && children.length > 0 ? (
        <div className='flex items-center gap-2 my-2'>        
          <img
            alt='avatar'
            loading='lazy'
            className='w-8 h-8 rounded-lg'
            src={MEDIA_URL.concat(post.user.avatar)}
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
          {children.map((p) => <PostCard key={p.id} post={p} />)}
        </ul>
      )}
      {post.content || post.tags.length ? (
        <>
          <div className={clsx('flex items-center gap-2 my-2', { 'pt-6 mt-0 border-t border-gray-300': root && post.ancestors?.length })}>
            <img
              alt='avatar'
              loading='lazy'
              className='w-8 h-8 rounded-lg'
              src={MEDIA_URL.concat(post.user.avatar)}
            />
            <div className="flex-grow truncate">
              <Link className='text-purple-700 hover:underline' to={`/u/${post.user.url}`}>
                {post.user.url}
              </Link>
            </div>
            <button className='py-1 px-2 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md'>Follow</button>
            <PostActions post={post} />
          </div>
          <PostContent post={post} />
          {post.tags.length ? (
            <div className='mt-2 flex items-center gap-1 flex-wrap'>
              {post.tags.map(({ tagName }, i) => (
                <Link 
                  key={i}
                  to={`/search?q=${tagName}`}
                  className='bg-purple-500 text-white py-1 px-1.5 text-xs font-bold rounded-md'
                >#{tagName}</Link>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {root && (
        <div className='flex justify-end gap-2 border-t border-gray-300 pt-2 mt-4 text-purple-900'>
          <Link to={`/p/${post.id}`} className="text-stone-700 font-medium text-sm">
            <span>Notes: </span>
            <span className="text-lg">{post.notes}</span>
          </Link>
          <div className="flex-grow"></div>
          <button className='p-1.5 hover:bg-purple-50 rounded-md' title="Quick Reblog">
            <QuickReblogIcon className="w-5 h-5" />
          </button>
          <button className='p-1.5 hover:bg-purple-50 rounded-md' title="Reblog">
            <ReblogIcon className="w-5 h-5" />
          </button>
          <button className='p-1.5 hover:bg-purple-50 rounded-md' title="Report">
            <ReportIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.li>
  )
}

function QuickReblogIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M21.888 13.5C21.164 18.311 17.013 22 12 22 6.477 22 2 17.523 2 12S6.477 2 12 2c4.1 0 7.625 2.468 9.168 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8h4.4a.6.6 0 00.6-.6V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReblogIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.05 16h-4.4a.6.6 0 00-.6.6V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReportIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M20.043 21H3.957c-1.538 0-2.5-1.664-1.734-2.997l8.043-13.988c.77-1.337 2.699-1.337 3.468 0l8.043 13.988C22.543 19.336 21.58 21 20.043 21zM12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17.01l.01-.011" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PostActions({ post }: { post: Post }) {
  function copyLink() {
    const url = new URL(window.location.origin)
    url.pathname = `/p/${post.id}`
    navigator.clipboard.writeText(url.toString())
    toast.success('Post link copied to your clipboard', { duration: 5000 })
  }
  
  return (
    <Menu as='div' className='relative'>
      <Menu.Button className='p-1.5 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md'>
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </Menu.Button>
      <Menu.Items as="ul" className='absolute z-10 top-full right-0 flex flex-col bg-white mt-1 p-1 shadow-lg rounded-md space-y-2 w-40'>
        <Menu.Item as="li">
          {({ active }) => (
            <button 
              onClick={copyLink}
              className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
              </svg>
              <p>Share post</p> 
            </button>
          )}
        </Menu.Item>
        <Menu.Item as="li">
          {({ active }) => (
            <button className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
              <ReblogIcon className="w-5 h-5" />           
              <p>Reblog</p>
            </button>
          )}
        </Menu.Item>
        <Menu.Item as="li">
          {({ active }) => (
            <button className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
              <ReportIcon className="w-5 h-5" />
              <p>Report</p>
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  )
}
