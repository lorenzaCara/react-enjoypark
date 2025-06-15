import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Trash2, Bell, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

export default function NotificationDetailDialog({ notification, isOpen, onClose, onDelete }) {
  if (!notification) return null

  const formattedDate = new Date(notification.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3  text-gray-900">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-gray-100">
                <Bell className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <h2 className="text-2xl font-light">Notification Details</h2>
                <p className="text-sm text-gray-500 mt-1 font-light">
                  {notification.read ? "Read notification" : "Unread notification"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and timestamp */}
          <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              {notification.read ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-teal-500 rounded-full animate-pulse"></div>
                </div>
              )}
              <Badge
                className={`${
                  notification.read
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-100"
                    : "bg-teal-100 text-teal-700 hover:bg-teal-100"
                }`}
              >
                {notification.read ? "Read" : "Unread"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
          </div>

          {/* Message content */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm mb-2">Message</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{notification.message}</p>
          </div>

          {/* Additional details if available */}
          {(notification.title || notification.description) && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200">
              <h3 className="text-teal-700 text-sm mb-4">Additional Information</h3>

              {notification.title && (
                <div className="mb-4">
                  <h4 className="text-gray-700 mb-1">Title</h4>
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-xl border border-gray-100">{notification.title}</p>
                </div>
              )}

              {notification.description && (
                <div>
                  <h4 className="text-gray-700 font-medium mb-1">Description</h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {notification.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Time information */}
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="h-4 w-4" />
            Received{" "}
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: it,
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button onClick={onClose} className="px-12 bg-teal-700 hover:bg-teal-600 text-white rounded-full py-6">
              Close
            </Button>
            <Button
              onClick={() => onDelete(notification.id, notification.message)}
              variant="outline"
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-12 py-6"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
