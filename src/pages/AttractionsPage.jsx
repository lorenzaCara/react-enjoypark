import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Clock, Ticket, Plus, Baby } from "lucide-react"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { usePlanners } from "@/contexts/PlannerProvider"
import { useToast } from "@/hooks/use-toast"
import AttractionPlannerDrawer from "@/components/AttractionPlannerDrawer"
import gsap from "gsap"

export default function AttractionsPage() {
  const { attractions, isLoading: attractionsLoading, error: attractionsError } = useAttractions()
  const { purchasedTickets, tickets: ticketTypes, loading: ticketsLoading, error: ticketsError } = useTickets()
  const { createPlanner, planners, updatePlanner } = usePlanners()
  const { toast } = useToast()

  const [isFixed, setIsFixed] = useState(false)
  const [selectedAttraction, setSelectedAttraction] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const headerRef = useRef(null)
  const newGeneralCardsRef = useRef([])
  const newKidCardsRef = useRef([])

  // Paginazione - solo per desktop
  const ITEMS_PER_PAGE = 8
  const [visibleGeneralCount, setVisibleGeneralCount] = useState(ITEMS_PER_PAGE)
  const [visibleKidCount, setVisibleKidCount] = useState(ITEMS_PER_PAGE)
  const [isDesktop, setIsDesktop] = useState(false)
  const [loadingMoreGeneral, setLoadingMoreGeneral] = useState(false)
  const [loadingMoreKid, setLoadingMoreKid] = useState(false)

  // Rileva se è desktop
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkIfDesktop()
    window.addEventListener("resize", checkIfDesktop)

    return () => window.removeEventListener("resize", checkIfDesktop)
  }, [])

  // Animazione per nuove card generali
  useEffect(() => {
    if (newGeneralCardsRef.current.length > 0 && !loadingMoreGeneral) {
      gsap.fromTo(
        newGeneralCardsRef.current,
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

      newGeneralCardsRef.current = []
    }
  }, [visibleGeneralCount, loadingMoreGeneral])

  // Animazione per nuove card kid
  useEffect(() => {
    if (newKidCardsRef.current.length > 0 && !loadingMoreKid) {
      gsap.fromTo(
        newKidCardsRef.current,
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

      newKidCardsRef.current = []
    }
  }, [visibleKidCount, loadingMoreKid])

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

  // Funzione per verificare se un'attrazione è legata al ticket KID
  const isKidAttraction = (attraction) => {
    if (!ticketTypes || !Array.isArray(ticketTypes)) return false

    // Trova il ticket type KID
    const kidTicketType = ticketTypes.find((ticketType) => ticketType.name.toUpperCase().includes("KID"))

    if (!kidTicketType) return false

    // Verifica se l'attrazione è inclusa nel ticket type KID
    return (
      kidTicketType.attractions?.some(
        (ticketAttraction) =>
          ticketAttraction.attraction?.id === attraction.id || ticketAttraction.attractionId === attraction.id,
      ) || false
    )
  }

  // Separa le attrazioni in due gruppi
  const generalAttractions = attractions.filter((attraction) => !isKidAttraction(attraction))
  const kidAttractions = attractions.filter((attraction) => isKidAttraction(attraction))

  // Debug logging
  useEffect(() => {
    if (ticketTypes && attractions.length > 0) {
      console.log("Ticket Types:", ticketTypes)
      console.log(
        "Kid Ticket Type:",
        ticketTypes.find((t) => t.name.toUpperCase().includes("KID")),
      )
      console.log("General Attractions:", generalAttractions.length)
      console.log("Kid Attractions:", kidAttractions.length)
    }
  }, [ticketTypes, attractions, generalAttractions, kidAttractions])

  // Carica più attrazioni generali
  const loadMoreGeneralAttractions = () => {
    setLoadingMoreGeneral(true)

    setTimeout(() => {
      setVisibleGeneralCount((prev) => Math.min(prev + ITEMS_PER_PAGE, generalAttractions.length))
      setLoadingMoreGeneral(false)
    }, 100)
  }

  // Carica più attrazioni kid
  const loadMoreKidAttractions = () => {
    setLoadingMoreKid(true)

    setTimeout(() => {
      setVisibleKidCount((prev) => Math.min(prev + ITEMS_PER_PAGE, kidAttractions.length))
      setLoadingMoreKid(false)
    }, 500)
  }

  // Filtra solo i biglietti attivi
  const activeTickets = purchasedTickets?.filter((t) => t.status === "USED") || []

  // Verifica se l'utente ha un biglietto valido per l'attrazione
  const getValidTicketsForAttraction = (attraction) => {
    return activeTickets.filter((ticket) =>
      ticket.ticketType?.attractions?.some(
        (ta) => ta.attraction?.id === attraction.id || ta.attractionId === attraction.id,
      ),
    )
  }

  // Gestisce il click su un'attrazione
  const handleAttractionClick = (attraction) => {
    setSelectedAttraction(attraction)
    setIsDrawerOpen(true)
  }

  // Gestisce la chiusura del drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedAttraction(null)
  }

  // Componente per renderizzare una card attrazione
  const AttractionCard = ({ attraction, index, isKid = false }) => {
    const validTickets = getValidTicketsForAttraction(attraction)
    const hasValidTicket = validTickets.length > 0

    const visibleCount = isKid ? visibleKidCount : visibleGeneralCount
    const isNewCard = index >= visibleCount - ITEMS_PER_PAGE && index < visibleCount

    const cardRef = (el) => {
      if (isNewCard && el) {
        if (isKid) {
          newKidCardsRef.current.push(el)
        } else {
          newGeneralCardsRef.current.push(el)
        }
      }
    }

    // Loading state
      if (attractionsLoading || ticketsLoading ) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        )
      }
    
      if (attractionsError || ticketsError ) {
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
      <div
        key={attraction.id}
        ref={cardRef}
        onClick={() => handleAttractionClick(attraction)}
        className="min-w-[380px] sm:min-w-0 bg-white rounded-3xl border-2 border-white overflow-hidden transition-all cursor-pointer hover:border-teal-700/30 lg:mx-4"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl text-gray-900 mb-2">{attraction.name}</h2>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline">{attraction.category}</Badge>
                {isKid && (
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100">
                    <Baby className="w-3 h-3 mr-1" />
                    KID
                  </Badge>
                )}
              </div>
            </div>
            {hasValidTicket && (
              <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100">
                <Ticket className="w-3 h-3 mr-1" />
                  Accessible
              </Badge>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{attraction.description}</p>

          <div className="space-y-2">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>Waiting time: {attraction.waitTime} minutes</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{attraction.location}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || ticketsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attractions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h3 className="text-lg mb-2">Unable to load attractions</h3>
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

  if (attractions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-5 rounded-2xl max-w-md mx-auto text-center">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg mb-2">No attractions available</h3>
          <p className="text-gray-500">Check back later for new attractions.</p>
        </div>
      </div>
    )
  }

  // Determina quali attrazioni mostrare per ogni sezione
  const displayedGeneralAttractions = isDesktop ? generalAttractions.slice(0, visibleGeneralCount) : generalAttractions
  const displayedKidAttractions = isDesktop ? kidAttractions.slice(0, visibleKidCount) : kidAttractions

  return (
    <div>
      {/* Header */}
      <div className={`mx-auto p-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 " : "relative"
          } text-white text-center transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-20 lg:py-32 rounded-3xl lg:mx-4"
          }`}
        >
          <h1
            className={`transition-all duration-700 font-light tracking-wider ${
              isFixed ? "lg:text-2xl md:text-xl text-lg px-4" : "lg:text-8xl md:text-5xl text-4xl"
            }`}
          >
            Futuristic attractions
          </h1>
          {!isFixed && (
            <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4 px-4">
              Discover all the wonderful attractions of Heptapod Park
            </p>
          )}
        </div>
      </div>

      {/* Attrazioni Generali */}
      {generalAttractions.length > 0 && (
        <section className="py-12 ">
          <div className="lg:px-8 px-6 mb-8 lg:mx-0">
            <h2 className="text-3xl font-light text-gray-900 mb-2">All Attractions</h2>
            <p className="text-gray-600">
              Discover our amazing futuristic attractions ({generalAttractions.length} available)
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible ps-4 lg:px-4 md:px-4 scrollbar-hide">
            {displayedGeneralAttractions.map((attraction, index) => (
              <AttractionCard key={attraction.id} attraction={attraction} index={index} isKid={false} />
            ))}
          </div>

          {/* Load More Button per attrazioni generali - solo per desktop */}
          {isDesktop && visibleGeneralCount < generalAttractions.length && (
            <div className="hidden lg:flex justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-3">
                  Mostrando {visibleGeneralCount} di {generalAttractions.length} attrazioni
                </p>
                <Button
                  onClick={loadMoreGeneralAttractions}
                  disabled={loadingMoreGeneral}
                  className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-8 py-6"
                >
                  {loadingMoreGeneral ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Load more
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Messaggio quando tutte le attrazioni generali sono caricate */}
          {isDesktop && visibleGeneralCount >= generalAttractions.length && visibleGeneralCount > ITEMS_PER_PAGE && (
            <div className="hidden lg:block text-center py-6 mt-6 ">
              <p className="text-gray-500">All our {generalAttractions.length} attractions have been loaded </p>
            </div>
          )}
        </section>
      )}

      {/* Attrazioni KID */}
      {kidAttractions.length > 0 && (
        <section className="py-12 mb-8 bg-teal-700/15 lg:rounded-3xl lg:mx-8">
          <div className="px-4 mb-8">
            <div className="flex items-center gap-3 mb-2 px-2">
              <h2 className="text-3xl font-light text-gray-900">Kids Zone</h2>
            </div>
            <p className="text-gray-600 px-2">
              Special attractions designed for our youngest visitors ({kidAttractions.length} available)
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible ps-4 lg:px-4 md:px-4 scrollbar-hide">
            {displayedKidAttractions.map((attraction, index) => (
              <AttractionCard key={attraction.id} attraction={attraction} index={index} isKid={true} />
            ))}
          </div>

          {/* Load More Button per attrazioni kid - solo per desktop */}
          {isDesktop && visibleKidCount < kidAttractions.length && (
            <div className="hidden lg:flex justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-3">
                  Showing {visibleKidCount} of {kidAttractions.length} attractions for kids
                </p>
                <Button
                  onClick={loadMoreKidAttractions}
                  disabled={loadingMoreKid}
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-8 py-6"
                >
                  {loadingMoreKid ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Baby className="w-5 h-5 mr-2" />
                      Load more
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Messaggio quando tutte le attrazioni kid sono caricate */}
          {isDesktop && visibleKidCount >= kidAttractions.length && visibleKidCount > ITEMS_PER_PAGE && (
            <div className="hidden lg:block text-center py-6">
              <p className="text-gray-500">
                All {kidAttractions.length} attractions for kids have been loaded
              </p>
            </div>
          )}
        </section>
      )}

      {/* Attraction Planner Drawer */}
      <AttractionPlannerDrawer
        selectedAttraction={selectedAttraction}
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
