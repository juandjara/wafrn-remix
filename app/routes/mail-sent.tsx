import Container from "@/components/Container"
import { cardCN } from "@/lib/style"
import { Transition } from "@headlessui/react"
import { useSearchParams } from "@remix-run/react"

export default function MailSent() {
  const [sp] = useSearchParams()
  const messages = {
    register: 'activate your account',
    changepw: 'change your password'
  }
  const action = sp.get('action') as keyof typeof messages
  const actionMessage = messages[action]

  return (
    <Container>
      <h1 className='mb-4 text-4xl font-medium text-gray-500'>Email sent!</h1>
      <div className={cardCN}>
        <div className="flex flex-col justify-center p-2 text-center">
          <Transition
            show={true}
            appear={true}
            enter="transition transform duration-500"
            enterFrom="-translate-y-16 opacity-0"
            enterTo="-translate-y-0 opacity-100">
            <div className="rounded-full w-16 h-16 bg-stone-100 text-purple-900 mx-auto flex items-center justify-center">
              <svg
                height={24}
                width={24}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
          </Transition>
          <p className="text-stone-500 mt-4 mb-2 text-xl font-medium">You have an e-mail!</p>
          <p className="text-base">
            Please check your inbox to find the link that we sent you and <strong>{actionMessage}</strong>
          </p>
        </div>
      </div>
    </Container>
  ) 
}
