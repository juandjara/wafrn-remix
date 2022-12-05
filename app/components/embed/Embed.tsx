import YoutubeEmbed from "./YoutubeEmbed"
// import LinkPreviewCard from "./LinkPreviewCard"
import { linkCN } from "@/lib/style"

function getYoutubeID(link = '') {
  try {
    let ytID = null
    if (link.includes('youtube.com/watch')) {
      ytID = new URL(link).searchParams.get('v')
    }
    if (link.includes('https://youtu.be')) {
      ytID = new URL(link).pathname
    }
    return ytID
  } catch (err) {
    return null
  }
}

export default function Embed({ link }: { link: string }) {
  let ytID = getYoutubeID(link)
  if (ytID) {
    return <YoutubeEmbed id={ytID} />
  }

  return <a target='blank' rel='noreferrer' href={link} className={linkCN}>{link}</a>
  // return <LinkPreviewCard link={link} />
}
