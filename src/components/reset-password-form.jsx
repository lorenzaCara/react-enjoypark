import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { EyeIcon, EyeOffIcon, ArrowRightIcon, HomeIcon } from "lucide-react"
import { useUser } from "@/contexts/UserProvider"
import { Link } from "react-router"
import HeptapodAll from "@/assets/HeptapodAll"

export function ResetPasswordForm({ className, ...props }) {
  const { updatePassword } = useUser()

  // Form state
  const [email, setEmail] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    try {
      if (newPassword !== newPasswordConfirmation) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }

      const res = await updatePassword({
        email,
        recoveryCode,
        newPassword,
        newPasswordConfirmation,
      })

      if (res.success) {
        setMessage(res.message)
        setTimeout(() => (window.location.href = "/login"), 2000)
      } else {
        setError(res.message)
      }
    } catch (err) {
      console.error("Password reset error:", err)
      setError("An error occurred while resetting the password. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex min-h-screen bg-gray-100 p-2", className)} {...props}>
      {/* Form Panel */}
      <div className="w-full mx-auto p-8 md:p-12 flex flex-col justify-between bg-white rounded-3xl">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <HeptapodAll width="120px" height="120px"/>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500 text-sm">
              Enter your email address and the recovery code you received to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  id="recoveryCode"
                  type="text"
                  placeholder="Recovery code"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  required
                  className="bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-teal-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  id="newPasswordConfirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  required
                  className="bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-teal-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            {message && (
              <div className="bg-teal-500/30 border border-teals-200 textteal-700 px-4 py-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white h-12 rounded-full"
            >
              {isLoading ? "Processing..." : "Reset password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Remenber your password?{" "}
            <Link to="/login" className="text-teal-700 hover:text-teal-600 transition-colors">
              Log in
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
            <Link to='/' className="mt-12 max-w-2xl">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-teal-600 px-4 py-2 rounded-full flex items-center justify-center w-full"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </Link>
        </div>
      </div>
    </div>
  )
}
