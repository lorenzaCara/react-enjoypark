import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import gsap from "gsap"
import {
  QrCode,
  Calendar,
  Clock,
  LogOut,
  Ticket,
  Bell,
  ChevronRight,
  MapPin,
  Star,
  Plus,
  ListTodo,
  Settings,
  User,
  Bookmark,
  Edit,
  Trash2,
  Shield,
  ArrowRight,
  Save,
  Loader2,
  HelpingHand,
} from "lucide-react"
import { Link } from "react-router" 
import { useNotifications } from "@/contexts/NotificationProvider"
import { useUser } from "@/contexts/UserProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { usePlanners } from "@/contexts/PlannerProvider"
import { useServices } from "@/contexts/ServicesProvider"
import { useShows } from "@/contexts/ShowsProvider"
import { useAttractions } from "@/contexts/AttractionsProvider"
import PlannerManager from "@/components/PlannerManager"
import BookingManager from "@/components/BookingManager"
import { toast } from "@/hooks/use-toast"
import DeletePlannerDialog from "@/components/Delete-planner-dialog"
import ManagePlannerDialog from "@/components/Manage-planner-dialog"
import { parseISO } from "date-fns" 

export default function ProfilePage() {
  const { user, profileImage, handleLogout } = useUser()
  const { purchasedTickets, loading } = useTickets()
  const { planners, updatePlanner, deletePlanner } = usePlanners()
  const { notifications } = useNotifications()
  const { serviceBookings, isLoading: servicesLoading } = useServices()
  const { shows, isLoading: showsLoading } = useShows()
  const { attractions, isLoading: attractionsLoading } = useAttractions()

  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")
  const [isFixed, setIsFixed] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPlanner, setSelectedPlanner] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attractionIds: [],
    serviceIds: [],
    showIds: [],
  })

  const headerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Scroll effect per header fisso
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

  const hasUnread = notifications.some((n) => !n.read)
  const activeTickets = purchasedTickets.filter((ticket) => ticket.status === "ACTIVE" || ticket.status === "USED")
  const today = new Date()
  today.setHours(0, 0, 0, 0) //reset ora a mezzanotte

  const activePlanners = planners.filter((p) => {
    const plannerDate = new Date(p.date)
    plannerDate.setHours(0, 0, 0, 0) //reset ora a mezzanotte
    return plannerDate >= today
  })

  const userBookings = serviceBookings.filter((booking) => booking.userId === user?.id)

  const toDateOnly = (dateStr) => {
    if (!dateStr) return null
    return parseISO(dateStr).toISOString().split("T")[0]
  }

  const getTicketForPlanner = (planner) => {
    return purchasedTickets.find((ticket) => ticket.id === planner.ticketId)
  }

  const getAvailableShows = (ticket) => {
    if (!ticket || !shows) return []

    return shows.filter((show) => {
      if (!show.date || !ticket.validFor) return false

      const ticketDate = toDateOnly(ticket.validFor)
      const showDate = toDateOnly(show.date)

      const hasAccess = ticket.ticketType?.shows?.some((ticketShow) => ticketShow.show?.id === show.id)

      return hasAccess && ticketDate === showDate
    })
  }

  const getAvailableAttractions = (ticket) => {
    if (!ticket || !attractions) return []
    return ticket.ticketType?.attractions?.map((ta) => ta.attraction).filter(Boolean) || []
  }

  const getAvailableServices = (ticket) => {
    if (!ticket) return []
    return ticket.ticketType?.services ? ticket.ticketType.services.map((ts) => ts.service).filter(Boolean) : []
  }

  const handleEditPlanner = (planner) => {
    setSelectedPlanner(planner)
    setFormData({
      title: planner.title || "",
      description: planner.description || "",
      attractionIds: planner.attractions?.map((a) => a.id || a) || planner.attractionIds || [],
      serviceIds: planner.services?.map((s) => s.id || s) || planner.serviceIds || [],
      showIds: planner.shows?.map((s) => s.id || s) || planner.showIds || [],
    })
    setShowEditDialog(true)
  }

  const handleDeletePlanner = (planner) => {
    setSelectedPlanner(planner)
    setShowDeleteDialog(true)
  }

  const handleSavePlanner = async () => {
    if (!selectedPlanner || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }
  
    setIsSaving(true)
  
    try {
      const ticket = getTicketForPlanner(selectedPlanner)
      const plannerData = {
        ticketId: selectedPlanner.ticketId,
        title: formData.title,
        description: formData.description,
        date: toDateOnly(ticket?.validFor),
        attractionIds: formData.attractionIds,
        serviceIds: formData.serviceIds,
        showIds: formData.showIds,
      }
  
      await updatePlanner(selectedPlanner.id, plannerData)
  
      toast({
        variant: "success",
        title: "Planner updated",
        description: "The planner was successfully updated.",
        className: "bg-white text-gray-900 border border-white"
      })
  
      setShowEditDialog(false)
      setSelectedPlanner(null)
    } catch (error) {
      console.error("Error updating the planner:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the planner.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const confirmDeletePlanner = async () => {
    if (!selectedPlanner) return
  
    try {
      await deletePlanner(selectedPlanner.id)
      toast({
        variant: "success",
        title: "Planner deleted",
        description: "The planner was successfully deleted.",
        className: "bg-white text-gray-900 border border-white"
      })
      setShowDeleteDialog(false)
      setSelectedPlanner(null)
    } catch (error) {
      console.error("Error deleting the planner:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the planner.",
        variant: "destructive",
      })
    }
  }  

  // per gestire il toggle degli elementi
  const handleItemToggle = (itemId, type) => {
    const field = `${type}Ids`
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(itemId) ? prev[field].filter((id) => id !== itemId) : [...prev[field], itemId],
    }))
  }

  // per chiudere i dialog
  const closeDialogs = () => {
    setShowEditDialog(false)
    setShowDeleteDialog(false)
    setSelectedPlanner(null)
    setFormData({
      title: "",
      description: "",
      attractionIds: [],
      serviceIds: [],
      showIds: [],
    })
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-3xl border-2 border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-3">Required access</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You must be logged in to access your profile and manage your tickets.
          </p>
          <Link to={'/login'}><Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-3">Access profile</Button></Link>
        </div>
      </div>
    )
  }

  if (isLoading || loading || servicesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Profile loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con effetto fisso */}
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
                  <div className="lg:w-20 lg:h-20 md:w-20 md:h-20 w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-light overflow-hidden border-4 border-white/30">
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.firstName?.[0] ?? user?.name?.[0] ?? "U")
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full"></div>
                </div>
                <div>
                  <h1
                    className={`transition-all duration-700 font-light ${
                      isFixed ? "text-xl" : "text-4xl lg:text-4xl"
                    }`}
                  >
                    Hi, {user?.firstName || "User"}!
                  </h1>
                  {!isFixed && (
                    <p className="text-teal-100 mt-2">{user?.email || "Welcome to your Heptapod profile!"}</p>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Link to="/notifications" aria-label="Vai alle notifiche">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 hover:text-white text-white rounded-2xl h-10 w-10 p-0 transition-all duration-300"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-cyan-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 lg:px-8">
        <div className="mx-auto">
          {/* Quick Stats */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-4 overflow-x-auto pb-2 mb-12 me-0 ms-4 lg:ms-0 md:ms-4">
            {/* Card 1 */}
            <div className="min-w-[350px] sm:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg text-gray-900">Available tickets</div>
                <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-teal-700" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{activeTickets.length}</div>
              <div className="text-sm text-gray-500">Ready to use</div>
            </div>

            {/* Card 2 */}
            <div className="min-w-[350px] sm:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg text-gray-900">Active planners</div>
                <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-teal-700" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{activePlanners.length}</div>
              <div className="text-sm text-gray-500">Scheduled visits</div>
            </div>

            {/* Card 3 */}
            <div className="min-w-[350px] sm:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg text-gray-900">Bookings</div>
                <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-teal-700" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{userBookings.length}</div>
              <div className="text-sm text-gray-500">Booked services</div>
            </div>
          </div>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 mx-4 lg:mx-0">
            {/* Tickets Section */}
            <Link to={"/ticket-manager"}>
              <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:border-teal-700/30 min-h-52">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-gray-900">Your tickets</h3>
                        <p className="text-sm font-light text-gray-600">Manage your purchased tickets</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center min-h-52 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
                  </div>
                ) : activeTickets.length > 0 ? (
                  <div className="p-6 ">
                    <div className="space-y-4 min-h-52">
                      {[...activeTickets]
                        .sort((a, b) => {

                          if (a.status === "USED" && b.status !== "USED") return 1
                          if (a.status !== "USED" && b.status === "USED") return -1

                          return parseISO(a.validFor).getTime() - parseISO(b.validFor).getTime();
                        })
                        .slice(0, 2)
                        .map((ticket) => {

                          let displayDate = "Data non disponibile";
                          try {
                            const utcDate = parseISO(ticket.validFor); 

                            if (isNaN(utcDate.getTime())) {
                              console.error("DEBUG Errore: parseISO ha prodotto una data non valida per:", ticket.validFor);
                              displayDate = "Data non valida";
                            } else {

                              const year = utcDate.getUTCFullYear();
                              const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Mese è 0-indexed
                              const day = utcDate.getUTCDate().toString().padStart(2, '0');
                              displayDate = `${day}/${month}/${year}`;
                              console.log("DEBUG Data formattata direttamente da componenti UTC:", displayDate);
                            }
                          } catch (e) {
                            console.error("DEBUG Errore durante il parsing o formattazione della data per ticket ID:", ticket.id, e);
                            displayDate = "Errore di parsing";
                          }

                          return (
                            <Link key={ticket.id} to={`/profile/${ticket.id}`}>
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 group mb-4">
                                <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                                  <QrCode className="w-6 h-6 text-teal-700" />
                                </div>
                                <div className="flex-1">
                                  <div className=" text-gray-900 mb-1">
                                    {ticket.ticketType?.name || "Ticket"}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Valid until {displayDate} 
                                  </div>
                                </div>
                                <Badge
                                  className={`${
                                      ticket.status === "USED"
                                        ? "bg-cyan-100 text-cyan-700 hover:bg-cyan-100"
                                        : ticket.status === "ACTIVE"
                                          ? "bg-teal-100 text-teal-700 hover:bg-teal-100"
                                          : ""
                                  }`}
                                >
                                  {ticket.status}
                                </Badge>
                              </div>
                            </Link>
                          )
                        })}

                      {activeTickets.length > 2 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm" className="rounded-2xl border-teal-700/30 text-teal-700">
                            See all ({activeTickets.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center min-h-52">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className=" text-gray-900 mb-2">No tickets available</h4>
                    <p className="text-gray-500 mb-6">Buy your tickets to start the adventure</p>
                    <Link to="/tickets">
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Buy tickets
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Link>

            {/* Planners Section */}
            <Link to={"/planner"}>
              <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:border-teal-700/30">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                        <ListTodo className="w-6 h-6 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-gray-900">Your planners</h3>
                        <p className="text-sm font-light text-gray-600">Organize your park visits</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {activePlanners.length > 0 ? (
                  <div className="p-6">
                    <div className="space-y-4 min-h-52">
                      {activePlanners.slice(0, 2).map((planner) => (
                        <div
                          key={planner.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 group"
                        >
                          <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-teal-700" />
                          </div>
                          <div className="flex-1">
                            <div className=" text-gray-900 mb-1">{planner.title}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(planner.date).toLocaleDateString("it-IT")}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(planner.attractionIds?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {planner.attractionIds.length} <MapPin className="w-3 h-3 ml-1" />
                              </Badge>
                            )}
                            {(planner.showIds?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {planner.showIds.length} <Star className="w-3 h-3 ml-1" />
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-teal-100"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEditPlanner(planner)
                              }}
                            >
                              <Edit className="w-4 h-4 text-teal-700" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeletePlanner(planner)
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {activePlanners.length > 2 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm" className="rounded-2xl border-teal-700/30 text-teal-700">
                            See all ({activePlanners.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center min-h-52">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ListTodo className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className=" text-gray-900 mb-2">No planner created</h4>
                    <p className="text-gray-500 mb-6">Create your first planner to organize your visit</p>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Create planner
                    </Button>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Services Bookings Section - Full Width */}
          <Link to={"/bookings"}>
            <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:border-teal-700/30 mb-12 mx-4 lg:mx-0">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                      <Bookmark className="w-6 h-6 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-light text-gray-900">Your bookings</h3>
                      <p className="text-sm font-light text-gray-600">Manage service bookings</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {userBookings.length > 0 ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userBookings.slice(0, 4).map((booking) => {
                      const service = booking.service || { name: "Servizio" }

                      return (
                        
                        <div
                          key={booking.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex-shrink-0 flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-teal-700" />
                          </div>
                          <div className="flex-1">
                            <div className=" text-gray-900 mb-1">{service.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.bookingTime
                                ? new Date(booking.bookingTime).toLocaleDateString("it-IT", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "Not specified date"}
                              {booking.bookingTime && (
                                <>
                                  <Clock className="w-4 h-4 ml-2" />
                                  {new Date(booking.bookingTime).toLocaleTimeString("it-IT", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Booked</Badge>
                        </div>
                      )
                    })}
                  </div>
                  {userBookings.length > 4 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm" className="rounded-2xl border-teal-700/30 text-teal-700">
                        See all ({userBookings.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className=" text-gray-900 mb-2">No bookings</h4>
                  <p className="text-gray-500 mb-6">Book park services to enhance your experience</p>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Book service
                  </Button>
                </div>
              )}
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 mb-12 mx-4 lg:mx-0">
            <h3 className="text-2xl font-light text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/tickets">
                <Button
                  variant="outline"
                  className="w-full h-20 rounded-2xl flex flex-col items-center justify-center gap-3 border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30 transition-all duration-300"
                >
                  <Ticket className="w-6 h-6" />
                  <span className="text-sm font-medium">Tickets</span>
                </Button>
              </Link>
              <Link to="/planner">
                <Button
                  variant="outline"
                  className="w-full h-20 rounded-2xl flex flex-col items-center justify-center gap-3 border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30 transition-all duration-300"
                >
                  <ListTodo className="w-6 h-6" />
                  <span className="text-sm font-medium">Planners</span>
                </Button>
              </Link>
              <Link to="/bookings">
                <Button
                  variant="outline"
                  className="w-full h-20 rounded-2xl flex flex-col items-center justify-center gap-3 border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-700/30 transition-all duration-300"
                >
                  <Bookmark className="w-6 h-6" />
                  <span className="text-sm font-medium">Bookings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden mx-4 lg:mx-0">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-light text-gray-900">Account settings</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link to="/profile-settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-14 rounded-2xl hover:bg-gray-50 transition-all duration-300 px-2"
                  size="icon"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className=" text-gray-900">Edit profile</div>
                    <div className="text-sm font-light text-gray-500">Update your personal informations</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Button>
              </Link>

              <Link to="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-14 rounded-2xl hover:bg-gray-50 transition-all duration-300 px-2"
                  size="icon"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className=" text-gray-900">Settings</div>
                    <div className="text-sm font-light text-gray-500">Personalize your experience</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Button>
              </Link>

              <Link to="/notifications">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-14 rounded-2xl hover:bg-gray-50 transition-all duration-300 px-2"
                  size="icon"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className=" text-gray-900">Notifications</div>
                    <div className="text-sm font-light text-gray-500">Manage your notifications</div>
                  </div>
                  {hasUnread && (
                    <Badge variant="destructive" className="mr-2">
                      Nuove
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 px-2"
                onClick={handleLogout}
                size="icon"
              >
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="">Logout</div>
                  <div className="text-sm font-light text-red-500">Log out of your account</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog per Modifica Planner */}
      <ManagePlannerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        selectedPlanner={selectedPlanner}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        onSave={handleSavePlanner}
        onCancel={closeDialogs}
        handleItemToggle={handleItemToggle}
        getAvailableShows={getAvailableShows}
        getAvailableAttractions={getAvailableAttractions}
        getAvailableServices={getAvailableServices}
        getTicketForPlanner={getTicketForPlanner}
      />

      {/* Dialog per Conferma Eliminazione */}
      <DeletePlannerDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          selectedPlanner={selectedPlanner}
          onDelete={handleDeletePlanner}
          onCancel={() => {
            setShowDeleteDialog(false)
            setSelectedPlanner(null)
          }}
        />
    </div>
  )
}
