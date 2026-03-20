const OrderAlertBanner = () => {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-300 px-4 py-3 text-center text-sm text-amber-900">
      <span className="font-medium">We are not accepting orders through the website at the moment.</span>{" "}
      Please reach out via{" "}
      <a
        href="https://www.instagram.com/whifftheory?igsh=MW55bGN3NzNwdjhrdA=="
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold hover:text-amber-700"
      >
        Instagram
      </a>{" "}
      or{" "}
      <a
        href="https://wa.me/917981075481"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold hover:text-amber-700"
      >
        WhatsApp
      </a>{" "}
      to place an order.
    </div>
  )
}

export default OrderAlertBanner
