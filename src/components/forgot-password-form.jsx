import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ArrowRightIcon, HomeIcon, MailIcon } from "lucide-react"
import { useUser } from "@/contexts/UserProvider"
import { Link } from "react-router"
import HeptapodAll from "@/assets/HeptapodAll"

export function ForgotPasswordForm({ className, ...props }) {
  const { requestPasswordRecovery } = useUser()

  // Form state
  const [email, setEmail] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    try {
      const res = await requestPasswordRecovery(email)

      if (res.success) {
        setMessage(res.message)
        // Store the email in sessionStorage to use it in the recovery page
        sessionStorage.setItem("recoveryEmail", email)
        sessionStorage.setItem("recoveryRequested", "true")

        // Redirect to recovery page after 2 seconds
        setTimeout(() => {
          window.location.href = "/recovery"
        }, 2000)
      } else {
        setError(res.message)
      }
    } catch (err) {
      console.error("Password recovery request error:", err)
      setError("An error occurred while requesting the recovery. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex min-h-screen bg-gray-100 p-2", className)} {...props}>
      {/* Form Panel */}
      <div className="w-full mx-auto p-8 md:p-12 flex flex-col justify-between bg-white rounded-3xl m-2">
        <div className="max-w-md mx-auto w-full">
          <div className="">
            <HeptapodAll width="120px" height="120px"/>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Recover your password</h1>
            <p className="text-gray-500 text-sm">
              Enter your email address and we’ll send you a recovery code to reset your password.
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
                  className="bg-white border-gray-200 focus:border-teal-500 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MailIcon className="size-5" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            {message && (
              <div className="bg-teal-500/30 border border-teal-200 text-teal-700 px-4 py-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white font-medium h-12 rounded-2xl"
            >
              {isLoading ? "Sending..." : "Send request"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 transition-colors">
              Login
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
            <Link to='/' className="mt-12 max-w-2xl">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-teal-600 px-4 py-2 rounded-2xl flex items-center justify-center w-full"
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
