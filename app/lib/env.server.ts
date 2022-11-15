import invariant from 'tiny-invariant'

const secret = process.env.SESSION_SECRET
invariant(secret, 'process.env.SESSION_SECRET must be defined')

const recaptchaKey = process.env.RECAPTCHA_KEY
invariant(recaptchaKey, 'process.env.RECAPTCHA_KEY must be defined')

const env = { secret, recaptchaKey }
export default env
