import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full max-w-[400px] flex flex-col gap-8"
      data-testid="login-page"
    >
      <div className="flex flex-col gap-3">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1 className="font-grotesk font-bold text-3xl text-on-surface tracking-[-0.02em]">
          WELCOME BACK.
        </h1>
        <p className="font-inter text-sm text-on-surface-variant">
          Sign in to continue your olfactory journey.
        </p>
      </div>

      <form className="w-full flex flex-col gap-5" action={formAction}>
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          required
          data-testid="email-input"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-2">
          ENTER THE GALLERY
        </SubmitButton>
      </form>

      <span className="font-inter text-xs text-on-surface-variant text-center">
        New to Whiff Theory?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="text-primary hover:text-primary/80 transition-colors font-medium"
          data-testid="register-button"
        >
          Start your journey
        </button>
      </span>
    </div>
  )
}

export default Login

