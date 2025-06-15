import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { EyeIcon, EyeOffIcon, ArrowRightIcon, HomeIcon } from "lucide-react"
import { z } from "zod"
import { useUser } from "@/contexts/UserProvider"
import { Link } from "react-router"
import HeptapodAll from "@/assets/HeptapodAll"

// Define the Zod schema
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z.string().min(8, "Password confirmation must be at least 8 characters"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  })

export function RegisterForm({ className, ...props }) {
  const { handleRegister } = useUser()

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [terms, setTerms] = useState(false)

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    // Validate terms
    if (!terms) {
      setFieldErrors((prev) => ({
        ...prev,
        terms: "You must accept the terms and conditions",
      }))
      return
    }

    // Validate using Zod schema
    const validationResult = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
    })

    if (!validationResult.success) {
      // Extract and format field errors
      const errors = {}
      validationResult.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message
      })
      setFieldErrors(errors)
      return
    }

    try {
      setIsLoading(true)

      const userData = {
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
      }

      const errorMessage = await handleRegister(userData)

      if (errorMessage) {
        setError(errorMessage)
      } else {
        // Navigate to home page or confirmation page
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An error occurred during registration. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex min-h-screen bg-gray-100 p-2", className)} {...props}>
      {/* Form Panel */}
      <div className="w-full mx-auto p-8 md:p-12 flex flex-col justify-between bg-white rounded-3xl">
        <div className="max-w-md mx-auto w-full">
          <div className="">
            <HeptapodAll width="120px" height="120px"/>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500 text-sm">
              Join us to access futuristic attractions and extraordinary virtual experiences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={cn(
                      "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                      fieldErrors.firstName && "border-red-500 focus:border-red-500",
                    )}
                  />
                </div>
                {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.firstName}</p>}
              </div>

              <div>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={cn(
                      "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                      fieldErrors.lastName && "border-red-500 focus:border-red-500",
                    )}
                  />
                </div>
                {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                    fieldErrors.email && "border-red-500 focus:border-red-500",
                  )}
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                    fieldErrors.password && "border-red-500 focus:border-red-500",
                  )}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-teal-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </div>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.password}</p>}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="passwordConfirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={cn(
                    "bg-white border-gray-200 focus:border-teal-600 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                    fieldErrors.passwordConfirmation && "border-red-500 focus:border-red-500",
                  )}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-teal-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </div>
              </div>
              {fieldErrors.passwordConfirmation && (
                <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.passwordConfirmation}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={setTerms}
                className={cn(fieldErrors.terms && "border-red-500 focus:border-red-500")}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <a href="#" className="text-teal-700 hover:text-teal-600 transition-colors">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-teal-700 hover:text-teal-600 transition-colors">
                    Privacy Policy
                  </a>
                </Label>
                {fieldErrors.terms && <p className="text-red-500 text-xs">{fieldErrors.terms}</p>}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white font-medium h-12 rounded-full"
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white text-gray-400 text-sm px-2 absolute">or</span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-12 rounded-full flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-700 hover:text-teal-600 transition-colors">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-12 max-w-md mx-auto w-full">
        <div className="flex items-center justify-center">
            <Link to='/' className="mt-12 max-w-2xl">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-teal-700 px-4 py-2 rounded-2xl flex items-center justify-center w-full"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
