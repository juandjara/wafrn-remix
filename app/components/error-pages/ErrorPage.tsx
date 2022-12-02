import { buttonCN, cardCN } from "@/lib/style"
import { Link, Links, Meta, Scripts } from "@remix-run/react"

export default function ErrorPage({ title, details }: { title: React.ReactNode; details: React.ReactNode }) {
  function onReload() {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <html>
      <head>
        <title>Whoops 😟</title>
        <Meta />
        <Links />
      </head>
      <body className="dark:text-stone-100 text-stone-700 dark:bg-stone-800 bg-white">
        <div className="h-screen flex flex-col items-center justify-center dark:text-stone-100 text-stone-700 text-center">
          <p className="text-4xl">
            <span>Whoops!</span>
            <span className="inline-block ml-2" role='img' aria-label='Worried face'>😟</span>
          </p>
          <p className="mt-2">There was an error on our side, sorry.</p>
          <p className="mt-8 mb-1">Error details: </p>
          <div className={`${cardCN} mb-6 space-y-2 max-w-screen-sm w-full`}>
            <p className="mt-1 text-base font-semibold">{title}</p>
            <p className="text-xl ">{details}</p>
          </div>
          <div>
            <button
              onClick={onReload}
              className={`mr-2 ${buttonCN.primary} ${buttonCN.normal}`}
            >
              Try again
            </button>
            <Link to="/" className={`inline-block ${buttonCN.cancel} ${buttonCN.normal}`}>
              Go home
            </Link>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}