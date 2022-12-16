export default function YoutubeEmbed({ id }: { id: string }) {
  return (
    <span className="my-1 block aspect-w-16 aspect-h-9 rounded-md">
      <iframe
        width="710"
        height="400"
        className='w-full h-full object-center object-cover rounded-md'
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </span>
  )
}

