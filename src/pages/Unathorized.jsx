import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import { Link } from "react-router"

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">

        {/* Content Card */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-light text-gray-900 mb-4">Unauthorized Access</h2>

            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 mb-8">
              <p className="text-gray-700 text-start leading-relaxed">
                It looks like you're trying to access a restricted area. This could happen for several reasons:
              </p>

              <ul className="text-left text-gray-600 mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>You don't have the required permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Your session may have expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>You need to log in with a different account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>The page you're looking for doesn't exist</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to={'/login'}>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 px-12 py-6 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Login
                </Button>
             </Link>

              <Link to="/">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full px-12 py-6 transition-all duration-300">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                Need help? Contact our support team if you believe this is an error.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contacts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                  >
                    Contact Support
                  </Button>
                </Link>

                <Link to="/contacts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                  >
                    Help Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            If you continue to experience issues, please try refreshing the page or clearing your browser cache.
          </p>
        </div>
      </div>
    </div>
  )
}
