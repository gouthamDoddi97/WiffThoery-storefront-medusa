import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12 relative" data-testid="account-page">
      {/* Mobile: video background; desktop: theme surface */}
      <video
        src="/homeHero.webm"
        autoPlay
        loop
        muted
        playsInline
        className="block small:hidden absolute inset-0 w-full h-full object-cover"
      />
      <div className="block small:hidden absolute inset-0 bg-surface-lowest/75 pointer-events-none" />

      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-transparent small:bg-surface-low flex flex-col relative z-10">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-surface-variant/30 py-12 gap-8">
          <div>
            <h3 className="font-grotesk font-bold text-xl text-on-surface mb-4">Got questions?</h3>
            <span className="font-inter text-sm text-on-surface-variant">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
