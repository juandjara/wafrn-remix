import { IMAGE_CACHE_URL, MEDIA_URL } from "@/lib/config"

const localUrlRegex = /\/\w+.webp$/

export default function formatImage(image: string) {
  if (localUrlRegex.test(image)) {
    return MEDIA_URL.concat(image)
  }
  return `${IMAGE_CACHE_URL}/?media=${encodeURIComponent(image)}`
}
