import Container from "@/components/Container"
import { buttonCN, inputCN, linkCN } from "@/lib/style"
import { Form, Link } from "@remix-run/react"

export default function Login() {
  return (
    <Container>
      <div className="mt-6 bg-white rounded-md shadow-sm px-3 pb-6">
        <div className="bg-purple-900 p-4 -mx-3 rounded-t-md">
          <img src="/img/wafrn-logo.png" alt="WAFRN" className="h-16 mx-auto" />
        </div>
        <h1 className="text-center mt-8 mb-4 font-bold text-2xl">Welcome back!</h1>
        <Form className="space-y-4 my-8">
          <div>
            <label htmlFor="email" className="text-sm text-stone-500 mb-1">Email</label>
            <input required type="text" name="email" className={inputCN} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-stone-500 mb-1">Password</label>
            <input required type="text" name="password" className={inputCN} />
          </div>
          <button className={`${buttonCN.big} ${buttonCN.primary} w-full block`}>Sign in</button>
        </Form>
        <p>Don't have an account? <Link to='/register' className={`${linkCN} text-lg`}>Register now!</Link> </p>
        <p>If you have any issue please check your spam folder!</p>
        <p>Still having problems? Send us an email at info @ wafrn.net</p>
        <Link to='/explore' className="text-purple-900 text-xl block text-center mt-8">
          Click here to take a look without an account
        </Link>
      </div>
    </Container>
  )
}
