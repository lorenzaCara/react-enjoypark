import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Clock, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import gsap from "gsap"
import { useServices } from "@/contexts/ServicesProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { usePlanners } from "@/contexts/PlannerProvider"
import ServicePlannerDrawer from "@/components/ServicePlannerDrawer"

const ServicesPage = () => {
  const { services, isLoading, error } = useServices()
  const { purchasedTickets } = useTickets()
  const { planners, createPlanner, updatePlanner } = usePlanners()
  const { toast } = useToast()

  const [isFixed, setIsFixed] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const headerRef = useRef(null)

  const activeTickets = purchasedTickets?.filter((t) => t.status === "ACTIVE" || t.status === "USED") || []

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

  // Verifica se l'utente ha un biglietto valido per il servizio
  const getValidTicketsForService = (service) => {
    const valid = activeTickets.filter((ticket) => {
      const hasService = ticket.ticketType?.services?.some((ts) => ts.serviceId === service.id)
      return hasService
    })
    return valid
  }

  const handleServiceClick = (service) => {
    setSelectedService(service)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedService(null)
  }
  

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
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

  if (services.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-5 rounded-2xl max-w-md mx-auto text-center">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg mb-2">No shows available</h3>
          <p className="text-gray-500">Check back later for new services.</p>
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
            Services
          </h1>
          {!isFixed && (
            <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4 px-4">
              Discover all the services at Heptapod Park.
            </p>
          )}
        </div>
      </div>

      <div className="lg:px-8 px-6 mb-8 lg:mx-0 pt-12">
        <h2 className="text-3xl font-light text-gray-900 mb-2">All Services</h2>
        <p className="text-gray-600">
          Active services
        </p>
      </div>

      {/* Services Grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible lg:mx-8 md:mx-4 mx-0 ms-4 pb-10 scrollbar-hide">
        {services.map((service) => {
          const validTickets = getValidTicketsForService(service)
          const hasValidTicket = validTickets.length > 0

          return (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="min-w-[380px] sm:min-w-0 bg-white rounded-3xl border-2 border-white overflow-hidden transition-all cursor-pointer hover:border-teal-700/30"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl text-gray-900 mb-2">{service.name}</h2>
                    <Badge variant="outline" className="mb-3">
                      {service.type}
                    </Badge>
                  </div>
                  {hasValidTicket && (
                    <Badge className="bg-teal-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100">
                      <Ticket className="w-3 h-3 mr-1" />
                      Accessible
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description || "Park service"}</p>

                <div className="space-y-2">
                  {service.operatingHours && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Hour: {service.operatingHours}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{service.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>


      {/* Service Details Drawer */}
      <ServicePlannerDrawer
        selectedService={selectedService}
        isDrawerOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        purchasedTickets={activeTickets}
        planners={planners}
        createPlanner={createPlanner}
        updatePlanner={updatePlanner}
        toast={toast}
      />
    </div>
  )
}

export default ServicesPage
