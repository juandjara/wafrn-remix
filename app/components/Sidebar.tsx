import { buttonCN } from '@/lib/style'
import useUser from '@/lib/useUser'
import { Menu } from '@headlessui/react'
import { MagnifyingGlassIcon, RectangleGroupIcon, LockClosedIcon, CurrencyEuroIcon, CodeBracketSquareIcon, EllipsisHorizontalIcon, UserCircleIcon, EllipsisVerticalIcon, UserIcon, HomeIcon, PencilIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import clsx from 'clsx'

const linkCN = [
  'flex items-center gap-3',
  'font-medium',
  'hover:bg-purple-100 bg-stone-50 rounded-lg p-2'
].join(' ')

const linkCNInverse = [
  'flex items-center gap-3',
  'font-medium',
  'bg-purple-900 hover:bg-purple-800 text-white rounded-lg p-2'
].join(' ')

export default function Sidebar() {
  const user = useUser()
  return (
    <aside className="min-h-screen fixed top-0 flex-shrink-0 w-72 bg-white">
      <Link to="/">
        <h1 className="bg-purple-900 p-4">
          <img src="/img/wafrn-logo.png" alt="WAFRN" />
        </h1>
      </Link>
      <nav className='px-4 py-4'>
        <ul className="space-y-4 text-purple-900">
          {!user && (
            <li>
              <Link to="/login" className={linkCN}>
                <LockClosedIcon className="w-6 h-6 text-purple-700" />
                <span>Log in</span>
              </Link>
            </li>
          )}
          {user && (
            <>
              <li>
                <Link to="/write" className={linkCNInverse}>
                  <PencilSquareIcon className='w-6 h-6 text-white' />
                  <span>Write new post</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={linkCN}>
                  <HomeIcon className='w-6 h-6 text-purple-700' />
                  <span>Dashboard</span>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/explore" className={linkCN}>
              <RectangleGroupIcon className="w-6 h-6 text-purple-700" />
              <span>Explore {user ? '' : 'without login'}</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className={linkCN}>
              <MagnifyingGlassIcon className="w-6 h-6 text-purple-700" />
              <span>Search a blog</span>
            </Link>
          </li>
          {user && (
            <li>
              <Link to={`/u/${user.url}`} className={linkCN}>
                <UserIcon className="w-6 h-6 text-purple-700" />
                <span>My blog</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/money" className={linkCN}>
              <CurrencyEuroIcon className="w-6 h-6 text-purple-700" />
              <span>Give us some money</span>
            </Link>
          </li>
          <li>
            <Link to="/source" className={linkCN}>
              <CodeBracketSquareIcon className="w-6 h-6 text-purple-700" />
              <span>Check the source code</span>
            </Link>
          </li>
        </ul>
      </nav>
      {user && (
        <div className='p-4 absolute bottom-0 inset-x-0 flex items-center justify-between'>
          <Link to={`/u/${user.url}`} className='font-medium text-purple-900'>{user.url}</Link>
          <Menu as='div' className='relative'>
            <Menu.Button className='p-1.5 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md'>
              <EllipsisVerticalIcon className="h-6 w-6" />
            </Menu.Button>
            <Menu.Items as="ul" className='absolute z-10 bottom-full right-0 flex flex-col bg-white mb-2 p-1 shadow-md rounded-md space-y-2 w-40'>
              <Menu.Item as="li">
                {({ active }) => (
                  <button className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
                    <p className='flex-grow text-left'>Log out</p> 
                    <LockClosedIcon className="w-6 h-6 text-purple-700" />
                  </button>
                )}
              </Menu.Item>
              <Menu.Item as="li">
                {({ active }) => (
                  <button className={clsx('w-full flex items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
                    <p className='flex-grow text-left'>Edit profile</p> 
                    <UserCircleIcon className='w-6 h-6 text-purple-700' />
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      )}
    </aside>
  )
}
