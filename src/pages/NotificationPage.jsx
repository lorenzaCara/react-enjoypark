import { useNotifications } from "@/contexts/NotificationProvider"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, CheckCircle, Trash2, AlertCircle, ArrowRight, Search, X } from "lucide-react"
import DeleteNotificationDialog from "@/components/delete-notification-dialog"
import NotificationDetailDialog from "@/components/notification-detail-dialog"
import gsap from "gsap"

const NotificationPage = () => {
  const { notifications, loading, error, markAsRead, deleteNotification, markAllAsRead } = useNotifications()
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, notificationId: null, message: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isFixed, setIsFixed] = useState(false)
  const [filter, setFilter] = useState("all") // all, unread, read
  const [searchTerm, setSearchTerm] = useState("")

  const headerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Scroll effect for fixed header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > 50 && !isFixed) {
        setIsFixed(true)
        gsap.fromTo(
          headerRef.current,
          { y: -50, paddingTop: 48, paddingBottom: 48 },
          { y: 0, paddingTop: 32, paddingBottom: 32, duration: 0.5, ease: "power2.out" },
        )
      } else if (scrollY <= 50 && isFixed) {
        setIsFixed(false)
        gsap.to(headerRef.current, {
          y: 0,
          paddingTop: 48,
          paddingBottom: 48,
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFixed])

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification)

    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification.id)
    }
  }

  const closeNotificationDetail = () => {
    setSelectedNotification(null)
  }

  const openDeleteDialog = (notificationId, message) => {
    setDeleteDialog({ isOpen: true, notificationId, message })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, notificationId: null, message: "" })
  }

  const handleConfirmDelete = async () => {
    if (deleteDialog.notificationId) {
      await deleteNotification(deleteDialog.notificationId)
      if (selectedNotification?.id === deleteDialog.notificationId) {
        setSelectedNotification(null)
      }
    }
    closeDeleteDialog()
  }

  const handleDeleteFromDetail = (notificationId, message) => {
    setSelectedNotification(null)
    openDeleteDialog(notificationId, message)
  }

  const handleMarkAllAsRead = async () => {
    if (markAllAsRead) {
      await markAllAsRead()
    }
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0
  const totalCount = notifications?.length || 0

  // Filter notifications based on current filter and search term
  const filteredNotifications =
    notifications?.filter((notification) => {
      const matchesFilter =
        filter === "all" || (filter === "unread" && !notification.read) || (filter === "read" && notification.read)

      const matchesSearch = searchTerm === "" || notification.message.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesFilter && matchesSearch
    }) || []

  if (isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">Loading error</h3>
          <p className="mb-4">An error occurred while loading the data</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl">Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with fixed effect */}
      <div className={`mx-auto p-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed
              ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600"
              : "relative"
          } text-white transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-12 lg:py-16 rounded-3xl lg:mx-4"
          }`}
        >
          <div className="mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{unreadCount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1
                    className={`transition-all duration-700 font-light ${
                      isFixed ? "text-2xl" : "text-4xl lg:text-4xl"
                    }`}
                  >
                    Notifications
                  </h1>
                  {!isFixed && (
                    <p className="text-teal-100 mt-2">
                      {totalCount} total notifications • {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-12 lg:px-8">
        <div className="mx-auto">
          {/* Filters and Search */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={`rounded-2xl ${
                    filter === "all"
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30"
                  }`}
                >
                  All ({totalCount})
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                  className={`rounded-2xl ${
                    filter === "unread"
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30"
                  }`}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filter === "read" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("read")}
                  className={`rounded-2xl ${
                    filter === "read"
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30"
                  }`}
                >
                  Read ({totalCount - unreadCount})
                </Button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">
                {searchTerm ? "No matching notifications" : "No notifications"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "You haven't received any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                    !notification.read
                      ? "border-teal-700/30 hover:border-teal-700/50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0 mt-1">
                        {!notification.read ? (
                          <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`mb-2 ${!notification.read ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${
                            !notification.read
                              ? "bg-teal-100 text-teal-700 hover:bg-teal-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {!notification.read ? "New" : "Read"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteDialog(notification.id, notification.message)
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-100 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={closeNotificationDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNotificationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        notificationMessage={deleteDialog.message}
      />
    </div>
  )
}

export default NotificationPage
