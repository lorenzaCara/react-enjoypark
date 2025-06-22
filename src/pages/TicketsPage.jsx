import { useTickets } from "@/contexts/TicketsProvider"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { UserPlus, CreditCard, QrCode, Sparkles } from "lucide-react"
import { TicketDetailsDrawer } from "@/components/ticket-details-drawer"

import { useToast } from "@/hooks/use-toast"
import { TicketPurchaseFlow } from "@/components/ticket-purchase-flow"

export default function TicketsPage() {
  const { tickets, loading, error } = useTickets()
  const { toast } = useToast()
  const [isFixed, setIsFixed] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isPurchaseFlowOpen, setIsPurchaseFlowOpen] = useState(false)
  const headerRef = useRef(null)

  const handleBuyTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsPurchaseFlowOpen(true)
  }

  const handleShowDetails = (ticket) => {
    setSelectedTicket(ticket)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  const handleClosePurchaseFlow = () => {
    setIsPurchaseFlowOpen(false)
  }

  const createTicket = async (ticketData) => {
    console.log("Creating ticket:", ticketData)
    toast({
      title: "Ticket Created!",
      description: "Your ticket has been successfully created.",
      className: "bg-white text-gray-900 border border-white"
    })
    handleClosePurchaseFlow()
  }

  const imageMap = {
    KID: "/img/kid-ticket.jpg",
    "FAST ACCESS": "/img/fastaccess-ticket.jpg",
    STANDARD: "/img/standard-ticket.jpg",
    VIP: "/img/vip-ticket.jpg",
  };

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">Unable to load tickets</h3>
          <p className="mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
            >
              Try Again
            </Button>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-5 rounded-2xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">No tickets available</h3>
          <p className="text-gray-500">Check back later for new ticket options.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
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
            Available Tickets
          </h1>
          {!isFixed && (
            <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4 px-4">
              Select the perfect ticket for your Heptapod Park adventure
            </p>
          )}
        </div>
      </div>
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:py-24 md:py-24 md:pe-4 pe-4 py-12 overflow-x-auto sm:overflow-visible ps-4 lg:px-8">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="min-w-[380px] sm:min-w-0 bg-white rounded-3xl border-2 border-white overflow-hidden hover:border-teal-700/30 transition-all duration-300"
          >
            <div className="p-6">
              <img
                src={imageMap[ticket.name]} // fallback se manca
                alt={ticket.name}
                className="object-cover w-full h-full rounded-2xl mb-6"
              />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl text-gray-800 lowercase">{ticket.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">€{ticket.price}</div>
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-4">
                <Button
                  onClick={() => handleBuyTicket(ticket)}
                  className="bg-teal-700 hover:bg-teal-600 rounded-full w-full text-medium font-normal text-white"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-teal-600 w-full rounded-full text-medium font-normal"
                  onClick={() => handleShowDetails(ticket)}
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TicketDetailsDrawer
        ticket={selectedTicket}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onPurchase={handleBuyTicket}
      />

      <TicketPurchaseFlow
        ticket={selectedTicket}
        isOpen={isPurchaseFlowOpen}
        onClose={handleClosePurchaseFlow}
        createTicket={createTicket}
      />

      {/* How It Works Section */}
      <div className="bg-teal-700/10 py-20 lg:mx-8 lg:px-6 md:px-0 ps-6 lg:rounded-3xl mb-12">
        <div className="mx-auto">
          <div className="lg:text-center text-start ps-4 lg:px-0 mb-16">
            <h2 className="text-4xl md:text-5xl text-gray-900 font-light mb-6">Great journeys start here</h2>
            <p className="text-gray-600 max-w-2xl lg:mx-auto font-light">
              From registration to enjoying your day at Heptapod Park, we've made the process simple and seamless
            </p>
          </div>

          {/* Process Steps - Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible pb-4 px-4 pe-4">
            {/* Step 1: Register */}
            <div className="min-w-[300px] sm:min-w-0 bg-teal-700/15 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="h-8 w-8 text-teal-700" />
              </div>
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <span className="bg-teal-600 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                  1
                </span>
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600">
                Create your account in just a few clicks to access exclusive benefits and easy booking
              </p>
            </div>

            {/* Step 2: Purchase */}
            <div className="min-w-[300px] sm:min-w-0 bg-teal-700/15 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-teal-700" />
              </div>
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <div className="absolute top-1/2 right-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <span className="bg-teal-600 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                  2
                </span>
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Purchase Tickets</h3>
              <p className="text-gray-600">
                Choose your preferred ticket type and complete your purchase securely online
              </p>
            </div>

            {/* Step 3: QR Code */}
            <div className="min-w-[300px] sm:min-w-0 bg-teal-700/15 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-8 w-8 text-teal-700" />
              </div>
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <div className="absolute top-1/2 right-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <span className="bg-teal-600 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                  3
                </span>
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Scan QR Code</h3>
              <p className="text-gray-600">
                Receive your digital ticket with QR code via email and scan it at the entrance for quick access
              </p>
            </div>

            {/* Step 4: Enjoy */}
            <div className="min-w-[300px] sm:min-w-0 bg-teal-700/15 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-teal-700" />
              </div>
              <div className="relative mb-8">
                <div className="absolute top-1/2 right-full w-12 h-0.5 bg-teal-600 hidden lg:block"></div>
                <span className="bg-teal-600 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                  4
                </span>
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Enjoy the Park</h3>
              <p className="text-gray-600">Experience all the wonders and attractions Heptapod Park has to offer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
