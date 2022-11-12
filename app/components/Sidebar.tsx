import { MagnifyingGlassIcon, RectangleGroupIcon, LockClosedIcon, CurrencyEuroIcon, CodeBracketSquareIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'

const linkCN = [
  'flex items-center gap-3',
  'font-medium',
  'hover:bg-purple-100 bg-stone-50 rounded-lg p-2'
].join(' ')

export default function Sidebar() {
  return (
    <aside className="min-h-screen fixed top-0 flex-shrink-0 w-72 bg-white">
      <Link to="/">
        <h1 className="bg-purple-900 p-4">
          <img src="/img/wafrn-logo.png" alt="WAFRN" />
        </h1>
      </Link>
      <nav className='px-4 py-4'>
        <ul className="space-y-4 text-purple-900">
          <li>
            <Link to="/login" className={linkCN}>
              <LockClosedIcon className="w-6 h-6 text-purple-700" />
              <span>Login</span>
            </Link>
          </li>
          <li>
            <Link to="/explore" className={linkCN}>
              <RectangleGroupIcon className="w-6 h-6 text-purple-700" />
              <span>Explore without login</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className={linkCN}>
              <MagnifyingGlassIcon className="w-6 h-6 text-purple-700" />
              <span>Search a blog</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className={linkCN}>
              <CurrencyEuroIcon className="w-6 h-6 text-purple-700" />
              <span>Give us some money</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className={linkCN}>
              <CodeBracketSquareIcon className="w-6 h-6 text-purple-700" />
              <span>Check the source code</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
