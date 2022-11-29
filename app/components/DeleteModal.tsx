import { buttonCN, cardCN } from "@/lib/style"
import { Dialog } from "@headlessui/react"
import { useFetcher } from "@remix-run/react"
import { useEffect } from "react"

type DeleteModalProps = {
  postId: string
  open: boolean
  onClose: () => void
}

export default function DeleteModal({ postId, open, onClose }: DeleteModalProps) {
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'

  useEffect(() => {
    if (fetcher.data) {
      onClose()
    }
    // do not run on 'onClose' change
    // eslint-disable-next-line
  }, [fetcher.data])

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div id="dialog-backdrop" className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={fetcher.Form}
          method="post"
          action="/api/delete-post"
          className={`mx-auto w-full max-w-md shadow-lg ${cardCN}`}
        >
          <input type="hidden" name="postId" value={postId} />
          <p>Do you want to delete this post?</p>
          <div className="mt-8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonCN.normal} ${buttonCN.cancel}`}
            >
              Cancel
            </button>
            <button
              disabled={busy}
              type="submit"
              className={`${buttonCN.normal} ${buttonCN.delete}`}
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
