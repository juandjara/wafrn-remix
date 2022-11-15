import { createCookieSessionStorage, redirect } from "@remix-run/node"
import env from "./env.server"

// export async function getFlashMessage(request: Request) {
//   const cookie = request.headers.get("cookie")
//   const session = await sessionStorage.getSession(cookie)
//   const flashMessage = session.get('flashMessage') as string
//   const newCookie = await sessionStorage.commitSession(session)

//   return { newCookie, flashMessage }
// }

// export async function setFlashMessage(request: Request, message: string) {
//   const cookie = request.headers.get("cookie")
//   const session = await sessionStorage.getSession(cookie)
//   session.flash('flashMessage', message)
//   const newCookie = await sessionStorage.commitSession(session)
//   return newCookie
// }

export const sessionHandler = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [env.secret],
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
})

export type User = {
  birthDate: string
  email: string
  exp: number
  url: string
  userId: string
}

function decodeJWT(token: string | null) {
  if (!token) {
    return null
  }

  try {
    // noinspection JSDeprecatedSymbols
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload as User
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function getSessionData(request: Request) {
  const cookie = request.headers.get("cookie")
  const session = await sessionHandler.getSession(cookie)
  const token = session.get('token') as string | null
  const payload = decodeJWT(token)
  const isExpired = payload ? Number(new Date(payload?.exp * 1000)) < Date.now() : true
  return {
    token,
    user: isExpired ? null : payload
  }
}

export async function setSessionData(request: Request, data: Record<string, any>) {
  const cookie = request.headers.get("cookie")
  const session = await sessionHandler.getSession(cookie)
  for (const entry of Object.entries(data)) {
    session.set(entry[0], entry[1])
  }

  const sessionCookie = await sessionHandler.commitSession(session)
  return sessionCookie
}

export async function destroySession(request: Request) {
  const cookie = request.headers.get("cookie")
  const session = await sessionHandler.getSession(cookie)
  const sessionCookie = await sessionHandler.destroySession(session)
  return sessionCookie
}

export async function logout(request: Request) {
  return redirect('/', {
    headers: {
      "Set-Cookie": await destroySession(request)
    }
  })
}

export async function requireUserSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const { token, user } = await getSessionData(request)
  if (!token || !user) {
    throw redirect(`/?redirectTo=${redirectTo}`)
  }
  return { token, user }
}
