import type { ActionArgs, LoaderFunction, MetaFunction } from "@remix-run/node"
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
import { getNotifications } from "./lib/api.server"
import { getUserRelations } from "./lib/api.server"
import type { User } from "./lib/session.server"
import { getFlashMessage, getSessionData } from "./lib/session.server"
import tailwind from "./tailwind.css"
import quillCSS from 'quill/dist/quill.snow.css'
import env from "./lib/env.server"
import NotificationCount from "./components/NotificationCount"
import { getTheme, toggleTheme } from "./lib/themeCookie.server"
import type { Notifications } from "./lib/processNotifications"
import processNotifications from "./lib/processNotifications"

export function links() {
  return [
    { rel: "stylesheet", href: quillCSS },
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
  theme: string
  relations: UserRelations
  flashMessage: string
  recaptchaKey: string
  notifications: Notifications
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, token } = await getSessionData(request)
  let relations = {
    followedUsers: [] as string[],
    blockedUsers: [] as string[]
  }
  let notifications = [] as Notifications
  if (user && token) {
    const data = await Promise.all([
      getUserRelations(token),
      getNotifications(token)
    ])

    relations = data[0]
    notifications = processNotifications(user, data[1])
  }

  const theme = await getTheme(request)
  const { flashMessage, newCookie } = await getFlashMessage(request)

  return json<RootLoaderData>(
    {
      user,
      theme,
      relations,
      flashMessage,
      notifications,
      recaptchaKey: env.recaptchaKey 
    },
    { headers: { 'Set-Cookie': newCookie } }
  )
}

export async function action({ request }: ActionArgs) {
  const cookie = await toggleTheme(request)
  return json({ ok: true }, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function App() {
  const { theme, flashMessage, notifications } = useLoaderData<RootLoaderData>()
  return (
    <html lang="en" className={theme}>
      <head>
        <Meta />
        <Links />
        <style>{`
          .grecaptcha-badge {
            visibility: hidden;
          }
        `}</style>
      </head>
      <body className="overflow-x-hidden dark:text-stone-100 text-stone-700 dark:bg-stone-800 bg-stone-100">
        <GlobalSpinner />
        <ClientOnly>{() => (
          <>
            <Toaster containerClassName="toast-container" />
            <FlashMessage message={flashMessage} />
          </>
        )}</ClientOnly>
        <NotificationCount notifications={notifications} />
        <div className="md:grid gap-8" style={{ gridTemplateColumns: 'min-content 1fr' }}>
          <Sidebar />
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
