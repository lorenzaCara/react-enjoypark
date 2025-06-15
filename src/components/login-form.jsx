import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { EyeIcon, EyeOffIcon, ArrowRightIcon, HomeIcon, HelpCircleIcon } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { useUser } from "@/contexts/UserProvider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { SubscriptionDialogContent } from "./subscription-dialog"
import FuturisticParkSVG from "./svg/futuristic-park-svg"
import { Link } from "react-router"
import HeptapodPark from "@/assets/HeptapodPark"
import HeptapodAll from "@/assets/HeptapodAll"


const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Campo richiesto" }),
})

export function LoginForm({ className, ...props }) {
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const email = watch("email")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { handleLogin, handleGoogleLogin } = useUser()

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const error = await handleLogin(data);
      if (error) {
        setError("email", { type: "custom", message: "" });
        setError("password", { type: "custom", message: error });
      }
      // Se non c'è errore, la redirect è già stata fatta nel provider
    } catch (err) {
      console.error("Login error:", err);
      setError("password", { type: "custom", message: "Errore durante il login. Riprova più tardi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex min-h-screen bg-gray-100", className)} {...props}>
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-white rounded-3xl m-2">
        <div className="max-w-md mx-auto w-full">
          <div className="">
            <HeptapodAll width="120px" height="120px"/>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Welcome to Heptapod Park</h1>
            <p className="text-gray-500 text-sm">Step into a world of endless play. Your adventure starts here.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="relative">
                <Input
                  {...register("email")}
                  value={email.replace(/\s/g, "")}
                  id="email"
                  type="text"
                  inputMode="email"
                  placeholder="hello@futuroparco.it"
                  className={cn(
                    "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                    errors.email && "border-red-500 focus:border-red-500",
                  )}
                />
              </div>
              <ErrorMessage
                name={"email"}
                errors={errors}
                render={({ message }) => message && <p className="text-red-500 text-xs mt-1 ml-4">{message}</p>}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={cn(
                    "bg-white border-gray-200 focus:border-teal-700 text-gray-900 placeholder:text-gray-400 h-12 px-4 rounded-2xl",
                    errors.password && "border-red-500 focus:border-red-500",
                  )}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-aqua-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </div>
              </div>
              <ErrorMessage
                name={"password"}
                errors={errors}
                render={({ message }) =>
                  message && (
                    <div className="mt-1 ml-4 text-xs text-red-500">
                      <p>{message}</p>
                      <Link to="/forgot-password" className="text-aqua-600 hover:underline block mt-1">
                        Forgot your password?
                      </Link>
                    </div>
                  )
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white h-12 rounded-full"
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white text-gray-400 text-sm px-2 absolute">o</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
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
              Sign in with Google
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-teal-700 hover:text-teal-600 transition-colors">
              Register
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
            <Link to='/' className="mt-12 max-w-2xl">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-teal-700 px-4 py-2 rounded-full flex items-center justify-center w-full"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </Link>
        </div>
      </div>


      {/* Right Panel */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden rounded-3xl bg-teal-500 m-2">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600"></div>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="p-12 h-full flex flex-col relative z-10">
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                A next-generation playground where imagination meets innovation, redefining how we play, learn, and
                connect.
              </h2>

              <div className="mt-8 relative h-96">
                <FuturisticParkSVG />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="bg-white/20 rounded-full px-6 py-2 flex items-center">
              <div className="w-3 h-3 rounded-full bg-white mr-2"></div>
              <span className="text-white text-sm">Join Us</span>
            </div>

            <div className="flex space-x-4">

              <TooltipProvider>
                <Tooltip>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                          <HelpCircleIcon className="h-5 w-5 text-white" />
                        </div>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Subscription benefits</p>
                    </TooltipContent>
                    <SubscriptionDialogContent />
                  </Dialog>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
