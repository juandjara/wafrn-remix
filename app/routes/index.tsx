import { Link } from "@remix-run/react"

export default function Index() {
  return (
    <div className="my-6 max-w-md mx-auto flex flex-col items-center justify-center">
      <h1 className="text-slate-500 font-medium text-2xl mb-2">
        Hello!
      </h1>
      <Link className="underline hover:no-underline" to='/explore'>Go to Explore</Link>
    </div>
  )
}
