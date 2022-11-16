import { Links, Meta, Scripts } from "@remix-run/react"

export default function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  function onReload() {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

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
          <button onClick={onReload} className="bg-red-100 text-red-900 rounded-lg px-4 py-2 mt-4">
            Reload
          </button>
        </div>
        <Scripts />
      </body>
    </html>
  )
}