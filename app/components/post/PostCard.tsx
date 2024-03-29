import type { Post } from "@/lib/api.server"
import { ArrowPathRoundedSquareIcon, ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import PostContent from "./PostContent"
import FollowButton from "../FollowButton"
import { useState } from "react"
import { buttonCN, linkCN } from "@/lib/style"
import useUser from "@/lib/useUser"
import DeleteModal from "../DeleteModal"
import ReblogMenu from "./ReblogMenu"
import PostActions, { ReportIcon } from "./PostActions"
import formatImage from "@/lib/formatImage"

const POST_COMPACT_LIMIT = 3

export default function PostCard({ post, root = false, disableThread = false }: { post: Post, root?: boolean, disableThread?: boolean }) {
  const isEmptyReblog = !post.content && !post.tags.length
  const [expanded, setExpanded] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState<string>('')
  const children = (post.ancestors || [])
    .filter(p => p.content || p.tags.length)
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime()
      const bDate = new Date(b.updatedAt).getTime()
      return aDate - bDate
    })

  const collapseChildren = !disableThread && children.length > POST_COMPACT_LIMIT
  const numHiddenPosts = children.length - (POST_COMPACT_LIMIT - 1)
  const shownChildren = collapseChildren && !expanded
    ? children.slice(-1 * (POST_COMPACT_LIMIT - 2))
    : children.slice(1)

  return (
    <li
      className={clsx('bg-white dark:bg-stone-700 block', root ? 'border dark:border-stone-500 border-stone-300 rounded-md p-4' : '')}>
      {root && children.length > 0 ? (
        <div id="root-header" className='flex items-center gap-2 mb-2 text-sm'>
          <div className="relative">
            <img
              alt='avatar'
              loading='lazy'
              className='w-6 h-6 rounded-lg border border-stone-300 dark:border-stone-500'
              src={formatImage(post.user.avatar)}
            />
            <span className="rounded-md p-0.5 absolute -top-2 -right-2 bg-white">
              {isEmptyReblog ? (
                <ArrowPathRoundedSquareIcon className="w-3 h-3 text-green-500" />
              ) : (
                <ChatBubbleLeftIcon className="w-3 h-3 text-sky-500" />
              )}
            </span>
          </div>
          <div className="flex-grow truncate">
            <Link className={linkCN} to={`/u/${post.user.url}`}>
              {post.user.url}
            </Link>
            <span>{isEmptyReblog ? ' rebloged' : ' replied'}</span>
          </div>
        </div>
      ) : null}
      {children.length ? (
        <ul id="post-thread" className='divide-y divide-stone-300 dark:divide-stone-500 border-t border-stone-300 dark:border-stone-500'>
          <PostCard post={children[0]} />
          {collapseChildren ? (
            <li className="border-none">
              <button
                id="thread-expand-button"
                onClick={() => setExpanded(flag => !flag)}
                className={`my-6 block ml-auto text-right ${buttonCN.small} ${buttonCN.primary}`}>
                {expanded ? 'Close thread' : (
                  <span>
                    Expand thread <span className="text-xs">
                      ({numHiddenPosts} more post{numHiddenPosts === 1 ? '' : 's'})
                    </span>
                  </span>
                )}
              </button>
            </li>
          ) : null}
          {shownChildren.map((p) => <PostCard key={p.id} post={p} />)}
        </ul>
      ) : null}
      {isEmptyReblog ? null : (
        <article id="post-content-wrapper" className={root ? 'pb-4' : 'pt-2 pb-4'}>
          <div className={clsx('flex items-center gap-2 my-2', { 'mt-0': root, 'pt-4 border-t border-stone-300 dark:border-stone-500': root && post.ancestors?.length })}>
            <img
              alt='avatar'
              loading='lazy'
              className='w-8 h-8 rounded-lg'
              src={formatImage(post.user.avatar)}
            />
            <div className="flex-grow truncate">
              <Link className={linkCN} to={`/u/${post.user.url}`}>
                {post.user.url}
              </Link>
            </div>
            <FollowButton userId={post.userId} size='small' hideWhenFollowing />
            <PostActions post={post} onDelete={() => setDeleteModalOpen(post.id)} />
          </div>
          <PostContent content={post.content} />
          <div className='mt-2 flex items-center gap-2 flex-wrap'>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {post.createdAt && (
                new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
              )}
            </span>
            {post.tags.map(({ tagName }, i) => (
              <Link 
                key={i}
                to={`/search?q=${tagName}`}
                className='bg-purple-500 text-white py-1 px-1.5 text-xs font-bold rounded-md'
              >#{tagName}</Link>
            ))}
          </div>
        </article>
      )}
      {root ? <PostToolbar post={post} onDelete={() => setDeleteModalOpen(post.id)} /> : null}
      <DeleteModal postId={deleteModalOpen} open={!!deleteModalOpen} onClose={() => setDeleteModalOpen('')} />
    </li>
  )
}

function PostToolbar({ post, onDelete }: { post: Post; onDelete: () => void }) {
  const user = useUser()
  if (!user) {
    return (
      <div
        id="post-toolbar"
        className='flex justify-between gap-1 border-t border-stone-300 dark:border-stone-500 pt-4 dark:text-purple-400 text-purple-900'>
        <Link to={`/p/${post.id}`} className="text-stone-700 dark:text-stone-100 font-medium text-sm">
          <span>Notes: </span>
          <span className="text-lg">{post.notes}</span>
        </Link>
      </div>      
    )
  }

  return (
    <div id="post-toolbar" className='flex justify-end gap-1 border-t border-stone-300 dark:border-stone-500 pt-4 dark:text-purple-400 text-purple-900'>
      <Link to={`/p/${post.id}`} className="text-stone-700 dark:text-stone-100 font-medium text-sm">
        <span>Notes: </span>
        <span className="text-lg">{post.notes}</span>
      </Link>
      <div className="flex-grow"></div>
      <ReblogMenu post={post} />
      <Link 
        to={`/report/${post.id}`}
        className={`p-1.5 dark:hover:bg-stone-600 hover:bg-purple-50 hover:shadow-md rounded-md`}
        title="Report">
        <ReportIcon className="w-5 h-5" />
      </Link>
      {user?.userId === post.userId && (
        <button
          onClick={onDelete}
          className={`p-1.5 dark:hover:bg-stone-600 hover:bg-purple-50 hover:shadow-md rounded-md`}
          title="Delete Post"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
