"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="w-full max-w-[400px] flex flex-col gap-8"
      data-testid="register-page"
    >
      <div className="flex flex-col gap-3">
        <span className="eyebrow">CREATE ACCOUNT</span>
        <h1 className="font-grotesk font-bold text-3xl text-on-surface tracking-[-0.02em]">
          YOUR JOURNEY STARTS...
        </h1>
        <p className="font-inter text-sm text-on-surface-variant">
          Join a community that takes fragrance seriously.
        </p>
      </div>

      <form className="w-full flex flex-col gap-5" action={formAction}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
        </div>
        <Input
          label="Email"
          name="email"
          required
          type="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <Input
          label="Password"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />

        <p className="font-inter text-[10px] text-on-surface-disabled leading-relaxed">
          By creating an account, you agree to Whiff Theory&apos;s{" "}
          <LocalizedClientLink href="/content/privacy-policy" className="text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/content/terms-of-use" className="text-primary hover:text-primary/80 transition-colors">
            Terms of Use
          </LocalizedClientLink>
          .
        </p>

        <ErrorMessage error={message} data-testid="register-error" />

        <SubmitButton className="w-full" data-testid="register-button">
          START YOUR JOURNEY
        </SubmitButton>
      </form>

      <span className="font-inter text-xs text-on-surface-variant text-center">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Sign in
        </button>
      </span>
    </div>
  )
}

export default Register

