"use client"

import { useFormState } from "react-dom"
import { useState } from "react"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import { logCustomerIn } from "@modules/account/actions"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"

import { useRouter } from "next/navigation"
import { LoginButton } from "@telegram-auth/react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useFormState(logCustomerIn, null)
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <ErrorMessage error={message} />
        <SubmitButton className="w-full mt-6">Sign in</SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
        >
          Join us
        </button>
        .
      </span>
      <LoginButton
        botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME!}
        buttonSize="large"
        cornerRadius={3}
        onAuthCallback={(data) => {
          fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/st11ore/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((res) => {
              if (!res.ok) {
                setErrorMsg("Failed to authenticate with Telegram.")
                throw new Error("Failed to authenticate with Telegram.")
              }
              return res.json()
            })
            .then((data) => {
              const token = data.token
              document.cookie = `_medusa_jwt=${token}; max-age=2592000; SameSite=Strict; path=/`
              router.refresh()
            })
            .catch((err) => {
              setErrorMsg("Failed to fetch remote resource.")
              console.log(err)
            })
        }}
      />
      <p className="text-red-500">{errorMsg}</p>
    </div>
  )
}

export default Login
