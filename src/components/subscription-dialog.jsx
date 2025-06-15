import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell, Clock, DollarSign, Verified } from "lucide-react"
import { Link } from "react-router"

export function SubscriptionDialogContent() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-light text-teal-700">Subscription Benefits</DialogTitle>
        <DialogDescription>Discover all the advantages of joining Heptapod Park</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-start">
          <div className="bg-teal-500/30 p-2 rounded-full mr-3">
            <Verified className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h3 className=" text-gray-900">Exclusive Access</h3>
            <p className="text-gray-500 text-sm">Enjoy access to all attractions and exclusive virtual experiences.</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-teal-500/30 p-2 rounded-full mr-3">
            <Clock className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h3 className=" text-gray-900">Priority Booking</h3>
            <p className="text-gray-500 text-sm">Book in advance and skip the virtual lines.</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-teal-500/30 p-2 rounded-full mr-3">
            <DollarSign className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h3 className=" text-gray-900">Exclusive Discounts</h3>
            <p className="text-gray-500 text-sm">Save on tickets, merchandise, and premium experiences.</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-teal-500/30 p-2 rounded-full mr-3">
            <Bell className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h3 className=" text-gray-900">Personalized Notifications</h3>
            <p className="text-gray-500 text-sm">Get updates on new attractions and special events.</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Link to="/register" className="w-full">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 px-12 py-6 rounded-full w-full flex items-center justify-center"
          >
            Register Now
          </Button>
        </Link>
      </div>
    </DialogContent>
  )
}
