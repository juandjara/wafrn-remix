import { useTransition } from "@remix-run/react"

export default function GlobalSpinner() {
  const transition = useTransition()
  const active = transition.state !== 'idle'
  
  const containerCN = [
    'fixed z-50 inset-x-0 -top-1 h-1 bg-purple-500/25',
    'transition-transform duration-500 ease-in-out',
    active ? 'translate-y-full' : 'translate-y-0'
  ].join(' ')

  const innerCN = [
    'w-full h-full bg-gradient-to-r from-purple-500 to-pink-500',
    active ? 'animate-nprogress' : ''
  ].join('')

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading" : undefined}
      className={containerCN}
    >
      <div className={innerCN} />
    </div>
  )
}
