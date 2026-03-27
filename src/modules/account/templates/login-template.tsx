"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="min-h-screen bg-surface-lowest flex">
      {/* Left panel — decorative */}
      <div className="hidden small:flex flex-1 bg-surface-low items-center justify-center relative overflow-hidden">
        {/* Ambient glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 70%, rgba(79,219,204,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(255,107,107,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-4 max-w-[360px] px-8">
          <div className="w-1 h-16 bg-primary" />
          <h2 className="font-grotesk font-bold text-4xl text-on-surface tracking-[-0.02em] leading-tight">
            Your scent story starts here.
          </h2>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
            Three tiers. Honest pricing. Art you wear.
          </p>
          <div className="flex gap-4 mt-4 text-center">
            {["CROWD PLEASERS", "INTRO TO NICHE", "POLARIZING ART"].map((tier, i) => (
              <div key={tier} className="flex flex-col gap-1">
                <div
                  className="w-8 h-px"
                  style={{
                    backgroundColor: ["#4FDBCC", "#D4AF37", "#FF6B6B"][i],
                  }}
                />
                <span className="font-grotesk text-[8px] tracking-[0.15em] text-on-surface-variant">
                  {tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full small:w-[480px] flex flex-col items-center justify-center px-8 py-16">
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate

