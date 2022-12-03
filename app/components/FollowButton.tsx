import { buttonCN } from "@/lib/style"
import useUserRelations from "@/lib/useUserRelations"
import { useFetcher } from "@remix-run/react"

type FollowButtonProps = {
  userId: string
  className?: string
  size?: 'normal' | 'small' | 'big'
  hideWhenFollowing?: boolean
}

export default function FollowButton({
  userId,
  size = 'normal',
  className = '',
  hideWhenFollowing = false 
}: FollowButtonProps) {
  const fetcher = useFetcher()
  const { followedUsers } = useUserRelations()
  const isFollowing = followedUsers.includes(userId)
  const shouldHide = hideWhenFollowing && isFollowing

  if (followedUsers.length === 0 || shouldHide) {
    return null
  }

  return (
    <fetcher.Form method="post" action="/api/toggle-follow" className={className}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isFollowing" value={String(isFollowing)} />
      <button
        type="submit"
        disabled={fetcher.state !== 'idle'}
        className={`${buttonCN[size]} text-sm ${isFollowing ? buttonCN.delete : buttonCN.primary}`}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </fetcher.Form>
  )
}
