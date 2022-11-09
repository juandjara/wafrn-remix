import { MagnifyingGlassIcon, RectangleGroupIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'

const linkCN = [
  'flex items-center gap-3',
  'text-lg font-medium',
  'hover:bg-purple-50 rounded-lg p-2'
].join(' ')

export default function Sidebar() {
  return (
    <aside className="min-h-screen fixed top-0 px-6 py-6 flex-shrink-0 w-72 bg-white">
      <Link to="/">
        <h1 className="text-purple-700 bg-purple-700 rounded-lg text-2xl font-semibold p-4 mb-6 tracking-widest">
          <img src="https://app.wafrn.net/assets/logo.png" alt="WAFRN" />
        </h1>
      </Link>
      <nav>
        <ul className="space-y-2 text-purple-700">
          <li>
            <Link to="/login" className={linkCN}>
              <LockClosedIcon className="w-5 h-5 text-purple-500" />
              <span>Login</span>
            </Link>
          </li>
          <li>
            <Link to="/register" className={linkCN}>
              <LockClosedIcon className="w-5 h-5 text-purple-500" />
              <span>Register</span>
            </Link>
          </li>
          <li>
            <Link to="/explore" className={linkCN}>
              <RectangleGroupIcon className="w-5 h-5 text-purple-500" />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className={linkCN}>
              <MagnifyingGlassIcon className="w-5 h-5 text-purple-500" />
              <span>Search</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
