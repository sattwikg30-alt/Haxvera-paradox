"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = ({ label, id, error, type = "text", className = "", ...props }: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-white tracking-wide">
        {label}
        {props.required && <span className="text-accent-green ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full bg-background border ${
            error ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-accent-green/50"
          } rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 ${
            error ? "focus:ring-red-500" : "focus:ring-accent-green/50"
          } transition-all duration-300 ${
            isPassword ? "pr-12" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-400 mt-0.5 pl-1">{error}</p>}
    </div>
  );
};

export default FormInput;