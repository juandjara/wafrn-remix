import type { User } from '@/lib/session.server'
import useUser from '@/lib/useUser'
import { Menu, Transition } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  RectangleGroupIcon,
  LockClosedIcon,
  CurrencyEuroIcon,
  CodeBracketSquareIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  HomeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { NavLink } from '@remix-run/react'
import LogoutButton from './LogoutButton'

const linkCN = [
  'flex items-center gap-3',
  'font-medium',
  'hover:bg-purple-100 rounded-lg p-2'
].join(' ')

const linkCNInverse = [
  'flex items-center gap-3',
  'font-medium',
  'bg-purple-900 hover:bg-purple-800 text-white rounded-lg p-2'
].join(' ')

const navLinkCN = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'bg-purple-50 border border-stone-200' : 'bg-stone-50',
  linkCN
].join(' ')

const navLinkCNInverse = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'ring-2 ring-purple-500' : '',
  linkCNInverse
].join(' ')

function UserMenu({ user }: { user: User }) {
  return (
    <div className='p-4 flex items-center justify-between'>
      <NavLink to={`/u/${user.url}`} className='font-medium text-purple-900'>@{user.url}</NavLink>
      <Menu as='div' className='relative'>
        {({ open }) => (
          <>  
            <Menu.Button className='p-1.5 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md'>
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </Menu.Button>
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-x-50 opacity-0"
              enterTo="scale-x-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-x-100 opacity-100"
              leaveTo="scale-x-50 opacity-0"
            >
              <Menu.Items static as="ul" className='absolute z-10 bottom-full right-full mr-2 p-1 w-40 flex flex-col space-y-2 bg-white shadow-md rounded-md border border-stone-100'>
                <Menu.Item as="li">
                  {({ active }) => <LogoutButton active={active} />}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export default function Sidebar() {
  const user = useUser()

  return (
    <aside className="min-h-screen fixed top-0 flex-shrink-0 w-72 bg-white">
      <NavLink to="/">
        <h1 className="bg-purple-900 p-4">
          <img src="/img/wafrn-logo.png" alt="WAFRN" />
        </h1>
      </NavLink>
      {user && <UserMenu user={user} />}
      <nav className='px-4 py-4'>
        <ul className="space-y-4 text-purple-900">
          {!user && (
            <li>
              <NavLink to="/login" className={navLinkCN}>
                <LockClosedIcon className="w-6 h-6 text-purple-700" />
                <span>Log in</span>
              </NavLink>
            </li>
          )}
          {user && (
            <>
              <li>
                <NavLink to="/write" className={navLinkCNInverse}>
                  <PencilSquareIcon className='w-6 h-6 text-white' />
                  <span>Write new post</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className={navLinkCN}>
                  <HomeIcon className='w-6 h-6 text-purple-700' />
                  <span>Dashboard</span>
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/explore" className={navLinkCN}>
              <RectangleGroupIcon className="w-6 h-6 text-purple-700" />
              <span>Explore {user ? '' : 'without login'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={navLinkCN}>
              <MagnifyingGlassIcon className="w-6 h-6 text-purple-700" />
              <span>Search a blog</span>
            </NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to={`/u/${user.url}`} className={navLinkCN}>
                  <UserIcon className="w-6 h-6 text-purple-700" />
                  <span>My blog</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={`/profile`} className={navLinkCN}>
                  <UserCircleIcon className="w-6 h-6 text-purple-700" />
                  <span>Edit Profile</span>
                </NavLink>
              </li>
            </>
          )}
          <li>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://patreon.com/wafrn"
              className={`${linkCN} bg-stone-50`}>
              <CurrencyEuroIcon className="w-6 h-6 text-purple-700" />
              <span>Give us some money</span>
            </a>
          </li>
          <li>
            <NavLink to="/source" className={navLinkCN}>
              <CodeBracketSquareIcon className="w-6 h-6 text-purple-700" />
              <span>Check the source code</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
