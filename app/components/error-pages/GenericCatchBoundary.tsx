import { Link, Links, Meta, Scripts, useCatch } from "@remix-run/react"

export default function GenericCatchBoundary() {
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