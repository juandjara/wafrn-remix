import type { LoaderFunction, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import { Toaster } from "react-hot-toast"
import { ClientOnly } from "remix-utils"
import GenericCatchBoundary from "./components/error-pages/GenericCatchBoundary"
import GenericErrorBoundary from "./components/error-pages/GenericErrorBoundary"
import FlashMessage from "./components/FlashMessage"
import GlobalSpinner from "./components/GlobalSpiner"
import LiveReload from "./components/LiveReload"
import Sidebar from "./components/Sidebar"
import type { UserRelations } from "./lib/api.server"
import { getUserRelations } from "./lib/api.server"
import type { User } from "./lib/session.server"
import { getFlashMessage, getSessionData } from "./lib/session.server"
import tailwind from "./tailwind.css"

export function links() {
  return [
    { rel: "stylesheet", href: 'https://cdn.quilljs.com/1.3.6/quill.core.css' },
    { rel: "stylesheet", href: tailwind },
  ]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: 'Wafrn - The social network that respects you',
  viewport: "width=device-width,initial-scale=1",
})

export function ErrorBoundary({ error }: { error: Error }) {
  return <GenericErrorBoundary error={error} />
}

export function CatchBoundary() {
  return <GenericCatchBoundary />
}

export type RootLoaderData = {
  user: User | null
  relations: UserRelations
  flashMessage: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, token } = await getSessionData(request)
  let relations = {
    followedUsers: [] as string[],
    blockedUsers: [] as string[]
  }
  if (user && token) {
    relations = await getUserRelations(token)
  }

  const { flashMessage, newCookie } = await getFlashMessage(request)

  return json<RootLoaderData>({ user, relations, flashMessage }, {
    headers: {
      'Set-Cookie': newCookie
    }
  })
}

export default function App() {
  const { flashMessage } = useLoaderData<RootLoaderData>()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-stone-100">
        <GlobalSpinner />
        <ClientOnly>{() => (
          <>
            <Toaster />
            <FlashMessage message={flashMessage} />
          </>
        )}</ClientOnly>
        <div className="md:flex md:gap-3">
          <Sidebar />
          <div className="md:pl-80 flex-grow">
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
