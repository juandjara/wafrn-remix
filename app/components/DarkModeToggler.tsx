import { buttonCN } from "@/lib/style"
import { SunIcon } from "@heroicons/react/24/outline"
import { MoonIcon } from "@heroicons/react/24/outline"
import { useFetcher, useMatches } from "@remix-run/react"

export default function DarkModeToggler() {
  const m = useMatches()
  const theme = m[0].data.theme
  const fetcher = useFetcher()
  const Icon = theme === 'dark' ? SunIcon : MoonIcon
  const title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
  const disabled = fetcher.state !== 'idle'

  return (
    <fetcher.Form action='/' method='post'>
      <button
        title={title}
        disabled={disabled}
        className={`flex items-center gap-2 p-2 rounded-md disabled:opacity-50 ${buttonCN.cancel}`}>
        <Icon className="w-6 h-6 dark:text-yellow-200 text-yellow-700" />
        <p className="text-purple-900 dark:text-purple-50">Toggle theme</p>
      </button>
    </fetcher.Form>
  ) 
}
