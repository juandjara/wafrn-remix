import { useState } from "react"

export type MediaWrapperProps = {
  nsfw: boolean
  type: 'image' | 'video'
  src: string
  alt?: string
}

export default function MediaWrapper({ nsfw, type, src, alt }: MediaWrapperProps) {
  const [open, setOpen] = useState(!nsfw)

  // using an extra span to avoid `ql-editor > *` styles that remove pointer
  const placeholder = (
    <span>
      <button className="block" onClick={() => setOpen(true)}>
        <img
          src="/nsfw.webp"
          className="rounded-md"
          alt="this media is nsfw. click to display"
        />
      </button>
    </span>
  )

  const content = type === 'image'
    ? <img loading="lazy" src={src} alt={alt} className="rounded-md" />
    : <video controls src={src} className="rounded-md" />

  return open ? content : placeholder
}
