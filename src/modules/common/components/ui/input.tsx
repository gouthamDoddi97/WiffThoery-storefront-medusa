import React, { useEffect, useImperativeHandle, useState } from "react"
import { cn } from "@lib/util/cn"
import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  name: string
  topLabel?: string
}

const CoastalInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, required, topLabel, className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password") {
        setInputType(showPassword ? "text" : "password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex flex-col w-full gap-1">
        {topLabel && (
          <span className="font-inter text-xs tracking-[0.15em] uppercase text-on-surface-variant">
            {topLabel}
          </span>
        )}
        <div className="relative w-full">
          <input
            type={inputType}
            name={name}
            id={name}
            placeholder=" "
            required={required}
            className={cn(
              "peer pt-5 pb-2 block w-full bg-transparent",
              "border-0 border-b border-surface-variant",
              "text-on-surface font-inter text-sm",
              "focus:border-primary focus:outline-none",
              "transition-colors duration-200",
              type === "password" ? "pr-10" : "",
              className
            )}
            {...props}
            ref={inputRef}
          />
          <label
            htmlFor={name}
            className={cn(
              "absolute left-0 top-2 font-inter text-xs tracking-[0.15em] uppercase text-on-surface-variant",
              "transition-all duration-200",
              "peer-focus:text-primary peer-focus:text-[10px]",
              "peer-not-placeholder-shown:text-[10px]"
            )}
          >
            {label}
            {required && <span className="text-secondary ml-0.5">*</span>}
          </label>
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-2 text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

CoastalInput.displayName = "CoastalInput"

export default CoastalInput
