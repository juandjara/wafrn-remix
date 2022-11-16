import { useEffect } from "react"
import toast from "react-hot-toast"

export default function FlashMessage({ message }: { message: string }) {
  useEffect(() => {
    if (message) {
      toast.success(message, { duration: 5000 })
    }
  }, [message])
  return null
}
