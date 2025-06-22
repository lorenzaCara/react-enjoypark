import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router"
import gsap from "gsap"
import {
  Calendar,
  Clock,
  Settings,
  Bookmark,
  Edit,
  Trash2,
  Plus,
  UtensilsCrossed,
  Coffee,
  Car,
  ArrowLeft,
  Users,
  MessageSquare,
} from "lucide-react"
import { useServices } from "@/contexts/ServicesProvider"
import { useUser } from "@/contexts/UserProvider"
import DeleteBookingDialog from "./DeleteBookingDialog"
import ServiceSelectorDialog from "./ServiceSelectorDialog"
import ServiceBookingDialog from "./ServiceBookingDialog"

export default function BookingManager() {
  const { user } = useUser()
  const { toast } = useToast()
  const {
    services,
    serviceBookings,
    createServiceBooking,
    updateServiceBooking,
    deleteServiceBooking,
    fetchServiceBookings,
    isLoading: servicesLoading,
  } = useServices()

  const [showServiceBooking, setShowServiceBooking] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    specialRequests: "",
    numberOfPeople: 2,
  })
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const headerRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > 50 && !isFixed) {
        setIsFixed(true)
        gsap.fromTo(
          headerRef.current,
          { y: -50, paddingTop: getPaddingPx(false), paddingBottom: getPaddingPx(false) },
          { y: 0, paddingTop: 32, paddingBottom: 32, duration: 0.5, ease: "power2.out" },
        )
      } else if (scrollY <= 50 && isFixed) {
        setIsFixed(false)
        gsap.to(headerRef.current, {
          y: 0,
          paddingTop: getPaddingPx(false),
          paddingBottom: getPaddingPx(false),
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFixed])

  function getPaddingPx(isFixed) {
    if (isFixed) {
      return 32
    } else {
      if (window.innerWidth >= 1024) {
        return 80
      } else {
        return 48
      }
    }
  }

  useEffect(() => {
    // Animate entrance
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: "back.out(1.7)" },
      )
    }
  }, [])

  // Filtra i servizi prenotabili
  const bookableServiceTypes = ["Restaurant", "Café", "Rental"]
  const bookableServices = services.filter((service) => bookableServiceTypes.includes(service.type))

  // Filtra le prenotazioni user
  const userBookings = serviceBookings.filter((booking) => {
    return String(booking.userId) === String(user?.id)
  })

  // Ordina prenotazioni per data
  const sortedBookings = [...userBookings].sort((a, b) => {
    const dateA = new Date(a.bookingTime || a.date || a.createdAt)
    const dateB = new Date(b.bookingTime || b.date || b.createdAt)
    return dateB - dateA
  })

  const handleServiceBooking = async () => {
    if (!selectedService || !bookingData.date || !bookingData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const bookingDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString()

      const bookingPayload = {
        serviceId: selectedService.id,
        bookingTime: bookingDateTime,
        numberOfPeople: bookingData.numberOfPeople ? Number.parseInt(bookingData.numberOfPeople) : null,
        specialRequests: bookingData.specialRequests || "",
        userId: user.id,
      }

      if (isEditing && selectedBooking) {
        await updateServiceBooking(selectedBooking.id, bookingPayload)
        toast({
          variant: "success",
          title: "Booking updated",
          description: "Your booking has been successfully updated!",
          className: "bg-white text-gray-900 border border-white"
        })
      } else {
        await createServiceBooking(bookingPayload)
        toast({
          variant: "success",
          title: "Booking confirmed",
          description: "Your booking has been successfully created!",
          className: "bg-white text-gray-900 border border-white"
        })
      }

      await fetchServiceBookings()
      resetBookingForm()
    } catch (error) {
      console.error("Error booking service:", error)
      toast({
        title: "Error",
        description: "An error occurred while booking",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteServiceBooking(bookingId)
      await fetchServiceBookings()
      setConfirmDelete(null)
      toast({
        variant: "success",
        title: "Booking deleted",
        description: "The booking has been successfully deleted",
        className: "bg-white text-gray-900 border border-white"
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting",
        variant: "destructive",
      })
    }
  }

  const openServiceBooking = (service) => {
    setSelectedService(service)
    setSelectedBooking(null)
    setIsEditing(false)
    setBookingData({
      date: "",
      time: "",
      specialRequests: "",
      numberOfPeople: 2,
    })
    setShowServiceBooking(true)
    setShowServiceSelector(false)
  }

  const openServiceSelector = () => {
    setShowServiceSelector(true)
    setSelectedService(null)
    setSelectedBooking(null)
  }

  const editBooking = (booking) => {
    const service = services.find((s) => s.id === booking.serviceId)
    if (!service) return

    setSelectedService(service)
    setSelectedBooking(booking)
    setIsEditing(true)

    let bookingDate = ""
    let bookingTime = ""

    if (booking.bookingTime) {
      const date = new Date(booking.bookingTime)
      bookingDate = date.toISOString().split("T")[0]
      bookingTime = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    } else if (booking.date) {
      bookingDate = new Date(booking.date).toISOString().split("T")[0]
      if (booking.time) {
        bookingTime = booking.time.includes(":") ? booking.time.substring(0, 5) : booking.time
      }
    }

    setBookingData({
      date: bookingDate,
      time: bookingTime,
      specialRequests: booking.specialRequests || booking.notes || "",
      numberOfPeople: booking.numberOfPeople || 2,
    })

    setShowServiceBooking(true)
    setShowServiceSelector(false)
  }

  const resetBookingForm = () => {
    setShowServiceBooking(false)
    setShowServiceSelector(false)
    setSelectedService(null)
    setSelectedBooking(null)
    setIsEditing(false)
    setBookingData({
      date: "",
      time: "",
      specialRequests: "",
      numberOfPeople: 2,
    })
  }

  // Utility functions
  const formatDate = (booking) => {
    if (booking.bookingTime) {
      return new Date(booking.bookingTime).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } else if (booking.date) {
      return new Date(booking.date).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
    return "Date not specified"
  }

  const formatTime = (booking) => {
    if (booking.bookingTime) {
      return new Date(booking.bookingTime).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (booking.time) {
      return booking.time.includes(":") ? booking.time.substring(0, 5) : booking.time
    }
    return null
  }

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.name : "Service not found"
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "Restaurant":
        return <UtensilsCrossed className="w-5 h-5 text-teal-600" />
      case "Café":
        return <Coffee className="w-5 h-5 text-teal-600" />
      case "Rental":
        return <Car className="w-5 h-5 text-teal-600" />
      default:
        return <Settings className="w-5 h-5 text-teal-600" />
    }
  }

  const getServiceType = (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.type : "Service"
  }

  if (servicesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
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
            isFixed ? "py-8 rounded-b-3xl" : "py-12 lg:py-20 rounded-3xl lg:mx-4"
          }`}
        >
          {/* Back button */}
          <div className="absolute left-6 top-6">
            <Link to="/profile">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-2xl border border-white/20 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`transition-all duration-700 font-light tracking-wider ${
                isFixed ? "lg:text-2xl md:text-xl text-lg" : "lg:text-5xl md:text-4xl text-3xl"
              }`}
            >
              Your bookings
            </h1>
            {!isFixed && (
              <p className="text-gray-100 text-lg mt-2 text-center max-w-2xl px-4">
                Manage your bookings for restaurants, cafés and rental services
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        {/* Enhanced Quick Stats */}
        <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto pb-2 mb-8 px-4 pe-4 lg:mx-4">
          <div className="min-w-[350px] flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">{userBookings.length}</div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total bookings</div>
            <div className="text-sm text-gray-500 mt-1">Booked services</div>
          </div>

          <div className="min-w-[350px] flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">{bookableServices.length}</div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Available services</div>
            <div className="text-sm text-gray-500 mt-1">Ready to be booked</div>
          </div>
        </div>

        {/* New Booking Button */}
        <div className="flex justify-end mb-6 mx-4 lg:mx-8">
          <Button
            onClick={openServiceSelector}
            className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-6 py-3 transition-all duration-300 "
            disabled={bookableServices.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>

        {/* Bookable services info message */}
        {bookableServices.length === 0 && services.length > 0 && (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl mx-4 lg:mx-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-light text-amber-800 mb-1">No services available</h3>
                <p className="text-amber-700">
                  Currently there are no services available for booking. You can only book restaurants, cafés and rental
                  services.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-white p-8 text-center mx-4 lg:mx-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-light text-gray-900 mb-3">No bookings</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't booked any services yet. Book restaurants, cafés or rental services to enhance your park
              experience.
            </p>
            <Button
              onClick={openServiceSelector}
              className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-8 py-3"
              disabled={bookableServices.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Service
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4 lg:mx-8">
            {sortedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border-2 border-white overflow-hidden transition-all duration-300 hover:border-teal-700/30"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                        {getServiceIcon(getServiceType(booking.serviceId))}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{getServiceName(booking.serviceId)}</h3>
                        <p className="text-sm text-gray-500">{getServiceType(booking.serviceId)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editBooking(booking)}
                        className="h-10 w-10 p-0 rounded-2xl border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDelete(booking.id)}
                        className="h-10 w-10 p-0 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <div className="font-medium text-gray-900">{formatDate(booking)}</div>
                      </div>
                    </div>

                    {formatTime(booking) && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Time</div>
                          <div className="font-medium text-gray-900">{formatTime(booking)}</div>
                        </div>
                      </div>
                    )}

                    {booking.numberOfPeople && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">People</div>
                          <div className="font-medium text-gray-900">{booking.numberOfPeople}</div>
                        </div>
                      </div>
                    )}

                    {(booking.specialRequests || booking.notes) && (
                      <div className="flex items-start gap-3 mt-2">
                        <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-teal-700" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Notes</div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                            {booking.specialRequests || booking.notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* External Dialog Components */}
        <ServiceBookingDialog
          isOpen={showServiceBooking}
          onClose={resetBookingForm}
          selectedService={selectedService}
          bookingData={bookingData}
          setBookingData={setBookingData}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={handleServiceBooking}
          getServiceIcon={getServiceIcon}
        />

        <ServiceSelectorDialog
          isOpen={showServiceSelector}
          onClose={() => setShowServiceSelector(false)}
          bookableServices={bookableServices}
          onSelectService={openServiceBooking}
          getServiceIcon={getServiceIcon}
        />

        <DeleteBookingDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete) {
              handleDeleteBooking(confirmDelete)
            }
          }}
        />
      </div>
    </div>
  )
}
