import ErrorPage from "./ErrorPage"

export default function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <ErrorPage
      title={<p>
        <span role='img' aria-label='explosion'>💥</span>
        {' '}Non-HTTP Error{' '}
        <span role='img' aria-label='explosion'>💥</span>
      </p>}
      details={error.message}
    />
  )
}