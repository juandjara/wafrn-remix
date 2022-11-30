import { Post } from "@/lib/api.server"
import { RootLoaderData } from "@/root"
import { Menu } from "@headlessui/react"
import { Link, useMatches } from "@remix-run/react"
import clsx from "clsx"
import { motion } from "framer-motion"
import { useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import toast from "react-hot-toast"

export function QuickReblogIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M21.888 13.5C21.164 18.311 17.013 22 12 22 6.477 22 2 17.523 2 12S6.477 2 12 2c4.1 0 7.625 2.468 9.168 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8h4.4a.6.6 0 00.6-.6V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ReblogIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" color="currentColor">
      <path d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.05 16h-4.4a.6.6 0 00-.6.6V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ReblogMenu({ post }: { post: Post }) {
  const m = useMatches()
  const { recaptchaKey, token } = m[0].data as RootLoaderData

  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [loading, setLoading] = useState(false)

  async function submitReblog() {
    setLoading(true)
    try {
      const captcha = await recaptchaRef.current?.executeAsync()
      const formData = new FormData()
      formData.set('captchaKey', captcha!)
      formData.set('tags', '')
      formData.set('content', '')
      formData.set('parent', post.id)
  
      const res = await fetch('/write', {
        body: formData,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!res.ok) {
        toast.error('Error posting reblog - bad status code')
      }

      toast.success('Yay! You rebloged the post successfully')
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        toast.error(err.message)
      }
    }
    setLoading(false)
  }

  return (
    <Menu as='div' className='relative'>
      <Menu.Button className='p-1.5 text-purple-900 hover:bg-purple-50 rounded-md'>
        <QuickReblogIcon className="w-5 h-5" />
      </Menu.Button>
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={recaptchaKey}
      />
      <Menu.Items as={motion.ul} initial={{ opacity: 1 }} exit={{ opacity: 1 }}
        className='absolute z-10 bottom-full -right-1 mb-2 p-1 space-y-2 w-40 flex flex-col bg-white border border-stone-100 shadow-md rounded-md'>
        <Menu.Item as="li">
          {({ active }) => (
            <Link
              to={`/write?parent=${post.id}`} 
              className={clsx('w-full flex justify-end items-center gap-2 py-1 px-2 text-purple-900 rounded-md', { 'bg-purple-100': active })}
            >
              <p className="text-right">Reblog</p>
              <ReblogIcon className="w-5 h-5" />           
            </Link>
          )}
        </Menu.Item>
        <Menu.Item as="li">
          {({ active }) => (
            <button
              disabled={loading}
              onClick={submitReblog}
              className={clsx(
                'w-full flex justify-end items-center gap-2 py-1 px-2 text-purple-900 rounded-md',
                { 'bg-purple-100': active }
              )}
            >
              <p className="text-right">Quick Reblog</p>
              <QuickReblogIcon className="w-5 h-5" />           
            </button>
          )}
        </Menu.Item>
      </Menu.Items>      
    </Menu>
  )
}