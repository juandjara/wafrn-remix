import { LockClosedIcon } from "@heroicons/react/24/outline"
import { useFetcher } from "@remix-run/react"
import clsx from "clsx"

export default function LogoutButton({ active }: { active?: boolean }) {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'

  return (
    <fetcher.Form action="/api/logout" method="post">
      <button className={clsx('w-full flex items-center gap-2 p-1 text-purple-900 rounded-md', { 'bg-purple-100': active })}>
        <LockClosedIcon className="w-6 h-6 text-purple-700" />
        <p className='flex-grow text-left'>
          {busy ? 'Logging out...' : 'Log out'}
        </p>
      </button>
    </fetcher.Form>
  )
}
