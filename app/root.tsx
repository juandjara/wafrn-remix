import type { MetaFunction } from "@remix-run/node"
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import GlobalSpinner from "./components/GlobalSpiner"
import LiveReload from "./components/LiveReload"
import Sidebar from "./components/Sidebar"
import tailwind from "./tailwind.css"

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
  ]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: 'Remix Tailwind Starter',
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-stone-100">
        <GlobalSpinner />
        <div className="flex gap-3">
          <Sidebar />
          <div className="md:pl-80">
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <html>
      <head>
        <title>Oh noes! 💥</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="max-w-xl bg-red-50 text-red-800 rounded-xl my-8 mx-auto p-4">
          <h1 className="text-2xl font-bold text-red-600">
            Boom! 
            <span role='img' aria-label='explosion'>💥</span>
          </h1>
          <h2 className="mt-1 text-xl font-bold text-red-600">There was an unexpected error</h2>
          <p className="my-2 text-lg">{error.message}</p>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const { status, statusText, data } = useCatch()
  const title = `${status} ${statusText}`

  return (
    <html>
      <head>
        <title>{'Oops! 😟 ' + title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-screen flex flex-col items-center justify-center text-slate-700 text-center">
          <p className="text-2xl">
            <span role='img' aria-label='Worried face'>😟</span>
            {status === 404 ? 'There is nothing here' : `I'm sorry`}
          </p>
          <div className="my-6">
            <p className="text-xl font-semibold">{title}</p>
            <p className="text-base">{typeof data === 'object' ? data?.message : data}</p>
          </div>
          <Link to="/" className="bg-slate-700 text-white rounded-lg px-4 py-2">Take me home</Link>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
