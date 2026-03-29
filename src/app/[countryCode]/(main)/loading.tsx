export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-surface-variant/30 overflow-hidden">
      <div className="absolute inset-y-0 w-1/2 bg-primary animate-loading-bar" />
      // Keyframes for loading bar animation
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%); 
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
