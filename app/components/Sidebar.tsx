import type { User } from '@/lib/session.server'
import { shadowCN } from '@/lib/style'
import useUser from '@/lib/useUser'
import { Dialog, Menu, Transition } from '@headlessui/react'
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
  PencilSquareIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Link, NavLink } from '@remix-run/react'
import { Fragment, useState } from 'react'
import DarkModeToggler from './DarkModeToggler'
import LogoutButton from './LogoutButton'

const linkCN = [
  'flex items-center gap-3',
  'font-medium',
  'bg-stone-50 dark:bg-stone-600 hover:bg-purple-100 dark:hover:bg-stone-500 rounded-lg p-2'
].join(' ')

const linkCNInverse = [
  'flex items-center gap-3',
  'font-medium',
  'bg-purple-900 hover:bg-purple-800 text-white rounded-lg p-2'
].join(' ')

const navLinkCN = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'shadow-md dark:shadow dark:shadow-purple-300 ring-1 ring-purple-400' : '',
  linkCN
].join(' ')

const navLinkCNInverse = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'ring-2 ring-purple-500' : '',
  linkCNInverse
].join(' ')

const sidebarCN = 'bg-white dark:bg-stone-700'
const iconCN = 'w-6 h-6 text-purple-500 dark:text-purple-300'

export default function Sidebar() {
  const user = useUser()
  const [open, setOpen] = useState(false)

  const sidebarContent = (
    <>
      <Link to="/">
        <img src="/img/wafrn-logo.png" alt="WAFRN" className='bg-purple-900 p-4' />
      </Link>
      <div className='m-2'>
        <DarkModeToggler />
      </div>
      {user && <UserMenu user={user} />}
      <nav className='px-4 py-4'>
        <ul className="space-y-4 text-purple-900 dark:text-purple-50">
          {!user && (
            <li>
              <NavLink onClick={() => setOpen(false)} to="/login" className={navLinkCN}>
                <LockClosedIcon className={iconCN} />
                <span>Log in</span>
              </NavLink>
            </li>
          )}
          {user && (
            <>
              <li className='border-b dark:border-stone-500 border-stone-300 pb-4 mb-4'>
                <NavLink onClick={() => setOpen(false)} to="/write" className={navLinkCNInverse}>
                  <PencilSquareIcon className='w-6 h-6 text-white' />
                  <span>Write</span>
                </NavLink>
              </li>
              <li>
                <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navLinkCN}>
                  <HomeIcon className={iconCN} />
                  <span>Home</span>
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink onClick={() => setOpen(false)} to="/explore" className={navLinkCN}>
              <RectangleGroupIcon className={iconCN} />
              <span>Explore {user ? '' : 'without login'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink onClick={() => setOpen(false)} to="/search" className={navLinkCN}>
              <MagnifyingGlassIcon className={iconCN} />
              <span>Search</span>
            </NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink onClick={() => setOpen(false)} to={`/u/${user.url}`} className={navLinkCN}>
                  <UserIcon className={iconCN} />
                  <span>My blog</span>
                </NavLink>
              </li>
              <li>
                <NavLink onClick={() => setOpen(false)} to={`/profile`} className={navLinkCN}>
                  <UserCircleIcon className={iconCN} />
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
              className={linkCN}>
              <CurrencyEuroIcon className={iconCN} />
              <span>Give us some money</span>
            </a>
          </li>
          <li>
            <a  
              target="_blank"
              rel="noreferrer"
              href="https://github.com/juandjara/wafrn-remix"
              className={linkCN}>
              <CodeBracketSquareIcon className={iconCN} />
              <span>Check the source code</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  )

  return (
    <div id='sidebar-wrapper'>
      <button onClick={() => setOpen(true)} className='p-2 bg-purple-100 dark:bg-purple-200 rounded-full z-20 fixed top-2 left-2'>
        <Bars3Icon className='w-6 h-6 text-purple-700' />
        <span className='sr-only'>Open menu</span>
      </button>
      <Drawer open={open} setOpen={setOpen}>{sidebarContent}</Drawer>
      <aside className={`hidden md:block w-80 ${sidebarCN} sticky z-40 top-0 self-start min-h-screen`}>
        {sidebarContent}
      </aside>
    </div>
  )
}

function Drawer({ open, setOpen, children }: { open: boolean, setOpen: (b: boolean) => void; children: JSX.Element }) {
  const drawerCN = 'max-w-xs w-full fixed overflow-hidden z-40 inset-0'
  const contentCN = [
    sidebarCN,
    'overflow-y-auto',
    'absolute left-0 bg-white h-full shadow-xl',
  ].join(' ')

  const toggleCN = 'p-1 rounded-md bg-white bg-opacity-10 fixed top-2 right-2'

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div id="dialog-backdrop" className="fixed z-40 inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transform ease-out duration-300"
          enterFrom="opacity-0 -translate-x-full"
          enterTo="opacity-100 translate-x-0"
          leave="transform ease-in duration-200"
          leaveFrom="opacity-100 translate-x-0"
          leaveTo="opacity-0 -translate-x-full"
        >
          <Dialog.Panel as="div" className={drawerCN}>
            <aside className={contentCN}>
              <button onClick={() => setOpen(false)} className={toggleCN}>
                <XMarkIcon className='w-5 h-5 text-white' />
                <span className='sr-only'>Close menu</span>
              </button>
              {children}
            </aside>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

function UserMenu({ user }: { user: User }) {
  return (
    <div className='p-4 pb-0 flex items-center justify-between'>
      <NavLink to={`/u/${user.url}`} className='font-medium text-purple-900 dark:text-purple-300'>@{user.url}</NavLink>
      <Menu as='div' className='relative'>
        {({ open }) => (
          <>  
            <Menu.Button className={`p-1.5 text-purple-900 bg-purple-50 dark:bg-purple-200 hover:bg-purple-100 ${shadowCN} rounded-md`}>
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </Menu.Button>
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-y-50 opacity-0"
              enterTo="scale-y-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-y-100 opacity-100"
              leaveTo="scale-y-50 opacity-0"
            >
              <Menu.Items static as="ul" className='absolute z-10 top-full -right-1 mt-2 p-1 w-40 flex flex-col space-y-2 bg-white shadow-md rounded-md border border-stone-100'>
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
