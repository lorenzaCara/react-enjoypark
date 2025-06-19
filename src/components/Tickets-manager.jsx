import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { useShows } from "@/contexts/ShowsProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { useUser } from "@/contexts/UserProvider"
import { useToast } from "@/hooks/use-toast"
import gsap from "gsap"
import { ArrowLeft, Calendar, Clock, Info, MapPin, Plus, QrCode, Star, Ticket, Trash } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import TicketDetailDialog from "./TicketDetailDialog"
import { DeleteTicketDialog } from "./DeleteTicketDialog"
import { parseISO } from "date-fns" // Import parseISO

export default function TicketsManager() {
  const { user } = useUser()
  const { toast } = useToast()
  // We'll rename currentTicket to ticketToDelete to avoid confusion with the single ticket currently in view
  const { purchasedTickets, loading: ticketsLoading, deleteTicket } = useTickets()
  const { attractions } = useAttractions()
  const { shows } = useShows()

  const [isFixed, setIsFixed] = useState(false)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null) // This is for the TicketDetailDialog
  const [activeFilter, setActiveFilter] = useState("all") // all, ACTIVE, USED, EXPIRED
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null) // New state to hold the ticket object for deletion
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  // Aggiungi questi stati per la paginazione
  const TICKETS_PER_PAGE = 6
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(TICKETS_PER_PAGE)
  const [loadingMoreTickets, setLoadingMoreTickets] = useState(false)
  const newTicketsRef = useRef([])

  const headerRef = useRef(null)
  const statsRef = useRef(null)

  // Scroll effect for fixed header
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

  // Aggiungi questo useEffect per animare i nuovi ticket caricati
  useEffect(() => {
    if (newTicketsRef.current.length > 0 && !loadingMoreTickets) {
      gsap.fromTo(
        newTicketsRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.1,
          ease: "power2.out",
        },
      )

      newTicketsRef.current = []
    }
  }, [visibleTicketsCount, loadingMoreTickets])

  // Filter tickets by status
  const activeTickets = purchasedTickets.filter((ticket) => ticket.status === "ACTIVE")
  const usedTickets = purchasedTickets.filter((ticket) => ticket.status === "USED")
  const expiredTickets = purchasedTickets.filter((ticket) => ticket.status === "EXPIRED")

  // Get filtered tickets based on active filter
  const getFilteredTickets = () => {
    switch (activeFilter) {
      case "ACTIVE":
        return activeTickets
      case "USED":
        return usedTickets
      case "EXPIRED":
        return expiredTickets
      default:
        return purchasedTickets
    }
  }

  // Sort tickets by date (most recent first)
  const sortedTickets = [...getFilteredTickets()].sort((a, b) => {
    // Use parseISO and compare UTC times for consistent sorting
    const dateA = parseISO(a.validFor || a.purchaseDate).getTime();
    const dateB = parseISO(b.validFor || b.purchaseDate).getTime();
    return dateB - dateA
  })

  // Aggiungi questa funzione per caricare più ticket
  const loadMoreTickets = () => {
    setLoadingMoreTickets(true)

    setTimeout(() => {
      setVisibleTicketsCount((prev) => Math.min(prev + TICKETS_PER_PAGE, sortedTickets.length))
      setLoadingMoreTickets(false)
    }, 500)
  }

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    // Reset visible count quando cambia il filtro
    setVisibleTicketsCount(TICKETS_PER_PAGE)
  }

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified"

    try {
      const utcDate = parseISO(dateString); // Returns a Date object representing the UTC time
      if (isNaN(utcDate.getTime())) {
        return "Invalid Date";
      }
      // Extract UTC components to avoid local timezone issues
      const year = utcDate.getUTCFullYear();
      const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = utcDate.getUTCDate().toString().padStart(2, '0');
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Error formatting date";
    }
  }

  const getTicketTypeDetails = (ticket) => {
    if (!ticket || !ticket.ticketType) return { name: "Unknown ticket", price: null }
    return {
      name: ticket.ticketType.name || "Ticket",
      price: ticket.ticketType.price || null,
      attractions: ticket.ticketType.attractions?.length || 0,
      shows: ticket.ticketType.shows?.length || 0,
    }
  }

  const getTicketStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-teal-100 text-teal-700 hover:bg-teal-100"
      case "USED":
        return "bg-cyan-100 text-cyan-700 hover:bg-cyan-100"
      case "EXPIRED":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
  }

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "ACTIVE":
        return "Active Tickets"
      case "USED":
        return "Used Tickets"
      case "EXPIRED":
        return "Expired Tickets"
      default:
        return "All Tickets"
    }
  }

  // --- DELETE LOGIC CHANGES START HERE ---
  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket) // Set the specific ticket to be deleted
    setIsDeleteDialogOpen(true) // Open the dialog
  }

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) {
      console.warn("No ticket selected for deletion.")
      return
    }

    setIsDeleting(true)

    try {
      await deleteTicket(ticketToDelete.id) // Use ticketToDelete.id for deletion
      toast({
        variant: "success",
        title: "Ticket deleted",
        description: "The ticket was successfully deleted.",
        className: "bg-white text-gray-900 border border-white"
      })
      setIsDeleteDialogOpen(false) // Close the dialog
      setTicketToDelete(null) // Clear the ticketToDelete state
      // No need to navigate, the UI will re-render with updated purchasedTickets
    } catch (err) {
      console.error("Error while deleting the ticket:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the ticket.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false) // Close the dialog
    setTicketToDelete(null) // Clear the ticketToDelete state
  }
  // --- DELETE LOGIC CHANGES END HERE ---

  if (ticketsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
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
              ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900"
              : "relative"
          } text-white transition-all duration-700 bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900 ${
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
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`transition-all duration-700 font-light tracking-wider ${
                isFixed ? "lg:text-2xl md:text-xl text-lg px-4" : "lg:text-5xl md:text-4xl text-3xl"
              }`}
            >
              Your tickets
            </h1>
            {!isFixed && (
              <p className="text-gray-100 text-lg mt-2 text-center max-w-2xl">
                Manage your purchased tickets and access the park
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:px-4 md:px-4 py-12 ">
        {/* Enhanced Quick Stats - Clickable Cards */}
        <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto pb-2 mb-8 mx-auto ms-4 lg:mx-4 md:ms-0">
          {/* Active Tickets Card */}
          <div
            onClick={() => handleFilterChange("ACTIVE")}
            className={`min-w-[350px] lg:min-w-0 md:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-white p-6 text-left transition-all duration-300 cursor-pointer ${
              activeFilter === "ACTIVE" ? "border-teal-700/30 bg-teal-50" : "border-gray-100 "
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">{activeTickets.length}</div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-600">Active tickets</div>
            <div className="text-sm text-gray-500 mt-1">Ready to use</div>
          </div>

          {/* Used Tickets Card */}
          <div
            onClick={() => handleFilterChange("USED")}
            className={`min-w-[350px] lg:min-w-0 md:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-white p-6 text-left transition-all duration-300 cursor-pointer ${
              activeFilter === "USED" ? "border-teal-700/30 bg-teal-50" : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">{usedTickets.length}</div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-600">Used tickets</div>
            <div className="text-sm text-gray-500 mt-1">Past visits</div>
          </div>

          {/* Expired Tickets Card */}
          <div
            onClick={() => handleFilterChange("EXPIRED")}
            className={`min-w-[350px] lg:min-w-0 md:min-w-0 flex-shrink-0 bg-white rounded-3xl border-2 border-white p-6 text-left transition-all duration-300 cursor-pointer ${
              activeFilter === "EXPIRED" ? "border-teal-700/30 bg-teal-50" : "border-gray-100 "
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">{expiredTickets.length}</div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Ticket className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-600">Expired tickets</div>
            <div className="text-sm text-gray-500 mt-1">No longer valid</div>
          </div>
        </div>

        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6 mx-4 lg:mx-4 md:mx-0"> 
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-light text-gray-900">{getFilterTitle()}</h2>
            </div>

            <div className="flex justify-end gap-2">
                {activeFilter !== "all" && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("all")}
                    className="rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 my-auto"
                >
                    Show All
                </Button>
                )}
                <Link to={"/tickets"}>
                    <Button className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-6 py-3 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy Tickets
                    </Button>
                </Link>
            </div>
        </div>

        {/* Tickets List */}
        {sortedTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center lg:mx-4 md:mx-0 mx-4 shadow:none">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-light text-gray-900 mb-3">
              {activeFilter === "all" ? "No tickets available" : `No ${activeFilter.toLowerCase()} tickets`}
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFilter === "all"
                ? "You haven't purchased any tickets yet. Buy tickets to access the park and enjoy all attractions."
                : `You don't have any ${activeFilter.toLowerCase()} tickets at the moment.`}
            </p>
            {activeFilter === "all" && (
              <Link to={"/tickets"}>
                <Button className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-8 py-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy Tickets
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:mx-0">
            {sortedTickets.slice(0, visibleTicketsCount).map((ticket, index) => {
              const ticketDetails = getTicketTypeDetails(ticket)
              const isNewTicket = index >= visibleTicketsCount - TICKETS_PER_PAGE && index < visibleTicketsCount

              return (
                <div
                  key={ticket.id}
                  ref={(el) => {
                    if (isNewTicket && el) {
                      newTicketsRef.current.push(el)
                    }
                  }}
                  className="bg-white rounded-3xl border-2 border-white overflow-hidden transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-teal-700" />
                        </div>
                        <div>
                          <h3 className="text-lg text-gray-900">{ticketDetails.name}</h3>
                          <p className="text-sm text-gray-500">
                            {ticketDetails.price ? `€${ticketDetails.price}` : "Purchased ticket"}
                          </p>
                        </div>
                      </div>
                      <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Valid until</div>
                          <div className=" text-gray-900">{formatDate(ticket.validFor || ticket.purchaseDate)}</div>
                        </div>
                      </div>

                      {ticketDetails.attractions > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-teal-700" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Attractions</div>
                            <div className=" text-gray-900">{ticketDetails.attractions} included</div>
                          </div>
                        </div>
                      )}

                      {ticketDetails.shows > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                            <Star className="w-5 h-5 text-teal-700" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Shows</div>
                            <div className=" text-gray-900">{ticketDetails.shows} included</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                        {ticket.status !== "EXPIRED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 rounded-full px-8 py-4 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteClick(ticket)
                            }}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                        <Link to={`/profile/${ticket.id}`}>
                          <Button size="sm" className="h-10 rounded-full px-8 py-4 bg-teal-700 hover:bg-teal-600 text-white">
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Load More Button */}
            {visibleTicketsCount < sortedTickets.length && (
              <div className="col-span-1 md:col-span-2 flex justify-center py-6">
                <Button
                  onClick={loadMoreTickets}
                  disabled={loadingMoreTickets}
                  className="bg-teal-700 hover:bg-teal-600 text-white px-12 py-6 rounded-full"
                >
                  {loadingMoreTickets ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Load more tickets
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Messaggio quando tutti i ticket sono caricati */}
            {visibleTicketsCount >= sortedTickets.length && visibleTicketsCount > TICKETS_PER_PAGE && (
              <div className="col-span-1 md:col-span-2 text-center py-4">
                <p className="text-gray-500">All tickets have been loaded</p>
              </div>
            )}
          </div>
        )}

        {/* External Dialog Components */}
        <TicketDetailDialog
          isOpen={showTicketDetail}
          onClose={() => setShowTicketDetail(false)}
          ticket={selectedTicket}
          formatDate={formatDate} // Pass formatDate to the dialog if it needs to format dates
          getTicketStatusColor={getTicketStatusColor}
        />

        <DeleteTicketDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Cancel Reservation"
          description="Are you sure you want to cancel this reservation? The ticket will be permanently deleted and this action cannot be undone."
          confirmText="Cancel Reservation"
          cancelText="Keep Ticket"
          isLoading={isDeleting}
          variant="destructive"
        />

      </div>
    </div>
  )
}