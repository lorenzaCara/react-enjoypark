import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Clock, Calendar, Ticket, Play } from "lucide-react"
import { useShows } from "@/contexts/ShowsProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { usePlanners } from "@/contexts/PlannerProvider"
import { useToast } from "@/hooks/use-toast"
import gsap from "gsap"
import ShowsPlannerDrawer from "@/components/ShowsPlannerDrawer"

export default function ShowsPage() {
  const { shows, isLoading, error } = useShows()
  const { purchasedTickets, loading: ticketsLoading } = useTickets()
  const { createPlanner, planners, updatePlanner } = usePlanners()
  const { toast } = useToast()

  const [isFixed, setIsFixed] = useState(false)
  const [selectedShow, setSelectedShow] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const headerRef = useRef(null)
  const cardRefs = useRef([]);

    const cardRef = (el, index) => {
      if (el) {
        cardRefs.current[index] = el;
      }
    };


  // Animazione per nuove card generali
  useEffect(() => {
    if (!isLoading && shows.length > 0) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      )
    }
  }, [isLoading, shows])
  

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
        return 128
      } else {
        return 80
      }
    }
  }

  // Funzione per estrarre solo la data in formato YYYY-MM-DD in modo sicuro
  const toDateOnly = (dateStr) => new Date(dateStr).toISOString().split("T")[0]

  // Modifica la funzione getValidTicketsForShow per restituire un array di biglietti validi
  const getValidTicketsForShow = (show) => {
    if (!show.date) return []

    const showDate = toDateOnly(show.date)

    return (
      purchasedTickets?.filter((ticket) => {
        if (ticket.status !== "ACTIVE" || !ticket.validFor) return false

        const ticketDate = toDateOnly(ticket.validFor)
        const hasAccess = ticket.ticketType.shows.some((tsShow) => tsShow.show.id === show.id)

        return hasAccess && ticketDate === showDate
      }) || []
    )
  }

  // Gestisce il click su uno show
  const handleShowClick = (show) => {
    setSelectedShow(show)
    setIsDrawerOpen(true)
  }

  // Gestisce la chiusura del drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedShow(null)
  }

  if (isLoading || ticketsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shows...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h3 className="text-lg mb-2">Unable to load the shows</h3>
          <p>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl"
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (shows.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-5 rounded-2xl max-w-md mx-auto text-center">
          <Play className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg mb-2">No shows available</h3>
          <p className="text-gray-500">Check back later for new shows.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className={`mx-auto p-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600" : "relative"
          } text-white text-center transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-20 lg:py-32 rounded-3xl lg:mx-4"
          }`}
        >
          <h1
            className={`transition-all duration-700 font-light tracking-wider ${
              isFixed ? "lg:text-2xl md:text-xl text-lg px-4" : "lg:text-8xl md:text-5xl text-4xl"
            }`}
          >
            Futuristic shows
          </h1>
          {!isFixed && (
            <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4 px-4">
              Discover all the exciting shows at Heptapod Park.
            </p>
          )}
        </div>
      </div>

      <div className="lg:px-8 px-6 mb-8 lg:mx-0 pt-12">
        <h2 className="text-3xl font-light text-gray-900 mb-2">All Shows</h2>
        <p className="text-gray-600">
          Scheduled shows
        </p>
      </div>
      {/* Shows Grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible lg:mx-8 md:mx-4 mx-0 ms-4 pb-10 scrollbar-hide">
        {shows.map((show, index) => {
          const validTickets = getValidTicketsForShow(show)
          const canAdd = validTickets.length > 0

          return (
            <div
              key={show.id}
              ref={(el) => cardRef(el, index)}
              onClick={() => handleShowClick(show)}
              className="min-w-[380px] sm:min-w-0 bg-white rounded-3xl border-2 border-white overflow-hidden transition-all cursor-pointer hover:border-teal-700/30"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl text-gray-900 mb-2">{show.title}</h2>
                    <Badge variant="outline" className="mb-3">
                      Show
                    </Badge>
                  </div>
                  {canAdd && (
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                      <Ticket className="w-3 h-3 mr-1" />
                      Accessible
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{show.description || "Spettacolo del parco"}</p>

                <div className="space-y-2">
                  {show.date && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(show.date).toLocaleDateString("it-IT")}</span>
                    </div>
                  )}
                  {show.time && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{show.time}</span>
                    </div>
                  )}
                  {show.location && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{show.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show Details Drawer */}
      <ShowsPlannerDrawer
        selectedShow={selectedShow}
        isDrawerOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        purchasedTickets={purchasedTickets}
        planners={planners}
        createPlanner={createPlanner}
        updatePlanner={updatePlanner}
        toast={toast}
      />
    </div>
  )
}
