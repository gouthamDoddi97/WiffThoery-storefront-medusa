import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const code = currency_code.toLowerCase()

  if (code === "inr") {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: minimumFractionDigits ?? 0,
      maximumFractionDigits: maximumFractionDigits ?? 0,
    }).format(amount)

    return `₹${formatted}`
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
