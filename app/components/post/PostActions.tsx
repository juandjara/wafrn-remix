import type { Post } from "@/lib/api.server"
import { shadowCN } from "@/lib/style"
import useUser from "@/lib/useUser"
import { Menu } from "@headlessui/react"
import { EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { ReblogIcon } from "./ReblogMenu"

export function ReportIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M20.043 21H3.957c-1.538 0-2.5-1.664-1.734-2.997l8.043-13.988c.77-1.337 2.699-1.337 3.468 0l8.043 13.988C22.543 19.336 21.58 21 20.043 21zM12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17.01l.01-.011" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PostActions({ post, onDelete }: { post: Post; onDelete: () => void }) {
  const user = useUser()

  function copyLink() {
    const url = new URL(window.location.origin)
    url.pathname = `/p/${post.id}`
    navigator.clipboard.writeText(url.toString())
    toast.success('Post link copied to your clipboard', { duration: 5000 })
  }
  
  return (
    <Menu as='div' className='relative'>
      <Menu.Button className={`p-1.5 text-purple-900 dark:hover:text-purple-900 bg-purple-50 dark:bg-purple-200 hover:bg-purple-100 ${shadowCN} rounded-md`}>
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </Menu.Button>
      <Menu.Items
        as={motion.ul}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='absolute z-10 top-full right-0 mt-2 p-1 space-y-2 w-44 flex flex-col bg-white border border-stone-100 shadow-md rounded-md'
      >
        <Menu.Item as="li">
          {({ active }) => (
            <button 
              onClick={copyLink}
              className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
              </svg>
              <p>Copy post link</p> 
            </button>
          )}
        </Menu.Item>
        <Menu.Item as="li">
          {({ active }) => (
            <Link
              to={`/write?parent=${post.id}`} 
              className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}
            >
              <ReblogIcon className="w-5 h-5" />           
              <p>Reblog</p>
            </Link>
          )}
        </Menu.Item>
        <Menu.Item as="li">
          {({ active }) => (
            <Link to={`/report/${post.id}`} className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
              <ReportIcon className="w-5 h-5" />
              <p>Report</p>
            </Link>
          )}
        </Menu.Item>
        {user?.userId === post.userId && (
          <Menu.Item as="li">
            {({ active }) => (
              <button onClick={onDelete} className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
                <TrashIcon className="w-5 h-5" />
                <p>Delete post</p>
              </button>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  )
}