import { linkCN } from "@/lib/style"
import type { LinkPreviewInfo } from "@/routes/api/link-preview"
import { LinkIcon } from "@heroicons/react/24/outline"
import { useFetcher } from "@remix-run/react"
import { useEffect } from "react"

export default function LinkPreviewCard({ link }: { link: string }) {
  const fetcher = useFetcher<LinkPreviewInfo>()
  useEffect(() => {
    fetcher.load(`/api/link-preview?url=${link}`)
  }, [])

  return fetcher.data ? (
    <div className="flex items-center rounded-md hover:shadow-md transition-shadow border border-stone-300 dark:border-stone-500 bg-white dark:bg-stone-700">
      <LinkIcon className="w-28 h-28 p-8 text-stone-600 block flex-shrink-0" />
      <div className="p-2 space-y-2">
        <p className="font-bold text-lg text-purple-900 dark:text-purple-300 line-clamp-2">
          <a target="_blank" href={fetcher.data.url} rel="noreferrer">
            {fetcher.data.title}
          </a>
        </p>
        <p className="line-clamp-2">{fetcher.data.description}</p>
        <p className="text-sm text-stone-500">{fetcher.data.publisher}</p>
      </div>
    </div>
  ) : (
    <a target='blank' rel='noreferrer' href={link} className={linkCN}>{link}</a>
  )
}