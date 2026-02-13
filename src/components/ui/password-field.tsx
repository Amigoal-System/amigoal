
"use client"

import { useId, useState } from "react"
import {
  EyeIcon,
  EyeOffIcon,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PasswordField({
  id: propId,
  label = "Passwort",
  placeholder = "Passwort eingeben...",
  className,
  showChecklist = true,
  allowGenerate = true,
  value,
  onChange,
}: {
  id: string;
  label?: string
  placeholder?: string
  className?: string
  showChecklist?: boolean
  allowGenerate?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const generatedId = useId()
  const id = propId || generatedId;
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  // password checks
  const checks = [
    { label: "Mindestens 8 Zeichen", valid: value.length >= 8 },
    { label: "Ein Grossbuchstabe", valid: /[A-Z]/.test(value) },
    { label: "Eine Zahl", valid: /\d/.test(value) },
    { label: "Ein Sonderzeichen", valid: /[!@#$%^&*]/.test(value) },
  ]

  // strength calculation
  const passed = checks.filter((c) => c.valid).length
  const strength =
    passed === 0
      ? "Sehr schwach"
      : passed === 1
      ? "Schwach"
      : passed === 2
      ? "Mittel"
      : passed === 3
      ? "Stark"
      : "Sehr stark"

  const strengthColor =
    passed <= 1
      ? "bg-red-500"
      : passed === 2
      ? "bg-yellow-500"
      : passed === 3
      ? "bg-blue-500"
      : "bg-green-600"

  // generate random password
  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
    let newPassword = ""
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      newPassword += charset[randomIndex]
    }
     // Create a synthetic event to pass to the onChange handler
    const event = {
      target: { id: id, value: newPassword },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  // copy to clipboard
  const copyToClipboard = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative flex items-center">
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          className="pr-20"
          required
        />

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Passwort verbergen" : "Passwort anzeigen"}
          className="absolute inset-y-0 right-10 flex items-center pr-2 text-muted-foreground/70 hover:text-foreground focus:outline-none"
        >
          {isVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>

        {/* Copy button */}
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!value}
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground/70 hover:text-foreground focus:outline-none disabled:opacity-40"
        >
          <Copy size={16} />
        </button>
      </div>

      {/* Generate Button */}
      {allowGenerate && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={generatePassword}
        >
          <RefreshCw size={14} /> Starkes Passwort generieren
        </Button>
      )}

      {/* Strength meter */}
      {value && (
        <div className="space-y-1 pt-2">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${(passed / checks.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Stärke: {strength}
            {copied && <span className="text-green-600">✓ Kopiert!</span>}
          </p>
        </div>
      )}

      {/* Checklist */}
      {showChecklist && value && (
        <ul className="text-sm space-y-1 pt-2">
          {checks.map((check, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2",
                check.valid ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {check.valid ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {check.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
