import { useTickets } from "@/contexts/TicketsProvider"
import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router"
import { format, parseISO, startOfDay } from "date-fns"
import { enUS } from "date-fns/locale"
import gsap from "gsap"
import {
  Calendar,
  Clock,
  CreditCard,
  ArrowLeft,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Printer,
  Info,
  User,
  Tag,
  Ticket,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteTicketDialog } from "@/components/DeleteTicketDialog"
import { useToast } from "@/hooks/use-toast"
import PrintableTicket from "@/components/PrintableTicket"

export default function TicketPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qrCodeRef = useRef(null)
  const headerRef = useRef(null)
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [isFixed, setIsFixed] = useState(false)
  const {
    purchasedTickets,
    fetchTicketByCode,
    currentTicket,
    currentTicketError,
    loading,
    setCurrentTicket,
    setCurrentTicketError,
    deleteTicket,
  } = useTickets()

  const [loadingTicket, setLoadingTicket] = useState(false)
  const [errorTicket, setErrorTicket] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setCurrentTicket(null)
    setCurrentTicketError(null)
    setLoadingTicket(true)
    setErrorTicket(null)

    const ticket = purchasedTickets.find((t) => String(t.id) === String(ticketId))

    if (ticket) {
      setCurrentTicket(ticket)
      setLoadingTicket(false)
    } else {
      fetchTicketByCode(ticketId)
        .then(() => setLoadingTicket(false))
        .catch((err) => {
          setErrorTicket(err.message)
          setLoadingTicket(false)
        })
    }
  }, [ticketId, purchasedTickets, fetchTicketByCode, setCurrentTicket, setCurrentTicketError])

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

  // Capture QR code image when component mounts or ticket changes
  useEffect(() => {
    if (currentTicket && qrCodeRef.current) {
      captureQRCode()
    }
  }, [currentTicket])

  const captureQRCode = async () => {
    try {
      if (!qrCodeRef.current) return

      const qrElement = qrCodeRef.current

      // If the QR element is an image, use its src directly
      if (qrElement.tagName === "IMG" && qrElement.src) {
        setQrCodeImage(qrElement.src)
        return
      }

      // Otherwise, create a canvas to capture the div content
      const canvas = document.createElement("canvas")
      const width = qrElement.offsetWidth || 200
      const height = qrElement.offsetHeight || 200
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")

      // Fill the background
      ctx.fillStyle = "#F3F4F6" // bg-gray-100
      ctx.fillRect(0, 0, width, height)

      // Draw the QR icon (simulated with a pattern)
      ctx.fillStyle = "#D1D5DB" // text-gray-300
      const iconSize = 64
      const iconX = (width - iconSize) / 2
      const iconY = (height - iconSize) / 2 - 20

      // Draw a simple pattern to simulate the QR icon
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(iconX + i * 8, iconY + j * 8, 6, 6)
          }
        }
      }

      // Add the code text
      ctx.fillStyle = "#6B7280" // text-gray-500
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      const text = currentTicket.rawCode || "QR code not available"
      ctx.fillText(text, width / 2, height - 30)

      // Convert to image
      const dataUrl = canvas.toDataURL("image/png")
      setQrCodeImage(dataUrl)
    } catch (error) {
      console.error("Error capturing the QR code:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-teal-100 text-teal-700 border-teal-200"
      case "EXPIRED":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "USED":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active"
      case "EXPIRED":
        return "Expired"
      case "USED":
        return "Used"
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "CREDIT_CARD":
        return "Credit Card"
      case "PAYPAL":
        return "PayPal"
      default:
        return method || "Not specified"
    }
  }

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return null
    const lastFourDigits = cardNumber.slice(-4)
    return `**** **** **** ${lastFourDigits}`
  }

  const getTicketPrice = (ticket) => {
    return ticket?.price || ticket?.ticketType?.price || ticket?.originalPrice || 0
  }

  // Download QR Code as image
  const handleDownloadQR = async () => {
    try {
      if (!qrCodeRef.current) {
        throw new Error("QR code not available")
      }

      const qrElement = qrCodeRef.current

      // If it’s an image, download directly
      if (qrElement.tagName === "IMG" && qrElement.src) {
        const link = document.createElement("a")
        link.href = qrElement.src
        link.download = `heptapod-ticket-${currentTicket.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Use the captured image
        if (qrCodeImage) {
          const link = document.createElement("a")
          link.href = qrCodeImage
          link.download = `heptapod-ticket-${currentTicket.id}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          throw new Error("QR image not available")
        }
      }

      toast({
        variant: "success",
        title: "QR Code downloaded",
        description: "The QR code has been saved to your downloads folder.",
        className: "bg-white text-gray-900 border border-white",
      })
    } catch (error) {
      console.error("Error during download:", error)
      toast({
        variant: "destructive",
        title: "Download error",
        description: "An error occurred while downloading the QR code.",
      })
    }
  }

  // Share ticket
  const handleShareTicket = async () => {
    const shareData = {
      title: `Heptapod Park Ticket - ${currentTicket.ticketType?.name || `Ticket #${currentTicket.id}`}`,
      text: `My ticket for Heptapod Park valid until ${format(new Date(currentTicket.validFor), "MMMM d", { locale: enUS })}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast({
          variant: "success",
          title: "Ticket Shared",
          description: "The ticket has been shared successfully.",
          className: "bg-white text-gray-900 border border-white",
        })
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        toast({
          variant: "success",
          title: "Link Copied",
          description: "The ticket link has been copied to your clipboard.",
          className: "bg-white text-gray-900 border border-white",
        })
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          variant: "success",
          title: "Link Copied",
          description: "The ticket link has been copied to your clipboard.",
          className: "bg-white text-gray-900 border border-white",
        })
      } catch (clipboardError) {
        toast({
          variant: "destructive",
          title: "Sharing Error",
          description: "It was not possible to share the ticket.",
        })
      }
    }
  }

  // Print ticket directly without opening a new window
  const handlePrintTicket = () => {
    try {
      // Ensure the QR code image is captured
      if (!qrCodeImage) {
        captureQRCode()
      }

      // Start printing
      setTimeout(() => {
        window.print()
      }, 100)

      toast({
        variant: "success",
        title: "Print started",
        description: "The print window will open shortly.",
        className: "bg-white text-gray-900 border border-white",
      })
    } catch (error) {
      console.error("Error during printing:", error)
      toast({
        variant: "destructive",
        title: "Print error",
        description: "An error occurred while preparing the print.",
      })
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!currentTicket) return

    setIsDeleting(true)

    try {
      await deleteTicket(currentTicket.id)
      toast({
        variant: "success",
        title: "Ticket deleted",
        description: "The ticket has been successfully deleted.",
        className: "bg-white text-gray-900 border border-white",
      })
      setIsDeleteDialogOpen(false)
      navigate("/profile")
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
    setIsDeleteDialogOpen(false)
  }

  if (loadingTicket || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento biglietto...</p> 
        </div>
      </div>
    )
  }

  if (errorTicket || currentTicketError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">Loading Error</h3> 
          <p className="mb-4">{errorTicket || currentTicketError}</p>
          <Link to="/profile">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back to profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!currentTicket) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <Info className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg mb-2">Ticket not found</h3> 
          <p className="text-gray-500 mb-4">The requested ticket is not available or has been removed.</p> {/* Localized */}
          <Link to="/profile">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back to profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  let validityDate;
  try {
    
    const datePart = currentTicket.validFor.split('T')[0];
    
    const [year, month, day] = datePart.split('-').map(Number);
    validityDate = new Date(year, month - 1, day); 
  } catch (error) {
    console.error("Errore nella parsificazione di validFor:", currentTicket.validFor, error);
    validityDate = startOfDay(parseISO(currentTicket.validFor));
  }


  console.log("currentTicket.validFor (original):", currentTicket.validFor);
  console.log("validityDate (forced to local day):", validityDate); // Verifica questo valore nella console

  const purchaseDate = new Date(currentTicket.purchaseDate || Date.now())
  const isActive = currentTicket.status === "ACTIVE"
  const cardNumber = formatCardNumber(currentTicket.cardNumber)
  const ticketPrice = getTicketPrice(currentTicket)

  return (
    <div>
      {/* Componente nascosto per la stampa */}
      <PrintableTicket ticket={currentTicket} qrCodeImage={qrCodeImage} />

      {/* Header con effetto fisso */}
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
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`transition-all duration-700 font-light tracking-wider ${
                isFixed ? "lg:text-2xl md:text-xl text-lg" : "lg:text-5xl md:text-4xl text-3xl"
              }`}
            >
              {currentTicket.ticketType?.name || `Ticket #${currentTicket.id}`} 
            </h1>
            {!isFixed && (
              <div className="flex items-center gap-4 mt-4">
                <Badge
                  className={`${getStatusColor(currentTicket.status)} hover:${getStatusColor(currentTicket.status)}`}
                >
                  {getStatusText(currentTicket.status)}
                </Badge>
                <span className="text-2xl font-light">€{ticketPrice.toFixed(2)}</span>
              </div>
            )}
            {!isFixed && (
              <p className="text-gray-100 text-lg mt-2 px-4 text-center">
                {currentTicket.ticketType?.description || "Park entrance ticket"} 
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-12 lg:mx-4">

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-0">
          {/* QR Code Section */}
          <div className="bg-white rounded-3xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-light text-gray-900 mb-6">QR code</h3> 
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-2xl border-2 border-teal-100 mb-6 inline-block">
                {currentTicket.qrCode ? (
                  <img
                    ref={qrCodeRef}
                    src={currentTicket.qrCode || "/placeholder.svg"}
                    alt="QR Code"
                    className="w-48 h-48 rounded-xl"
                    // Removed redundant onLoad={captureQRCode}
                  />
                ) : (
                  <div
                    ref={qrCodeRef}
                    className="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center"
                  >
                    <QrCode className="h-16 w-16 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 text-center font-mono px-4">
                      {currentTicket.rawCode || "QR Code not available"} 
                    </p>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-6">Show this QR code at the entrance to access the park.</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-teal-100 border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300 hover:text-teal-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download 
                </Button>
                <Button
                  onClick={handleShareTicket}
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-cyan-100 border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-all duration-300 hover:text-cyan-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white rounded-3xl p-8">
            <h3 className="text-2xl font-light text-gray-900 mb-6">Ticket details</h3> 

            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <Badge
                  className={`${getStatusColor(currentTicket.status)} hover:${getStatusColor(currentTicket.status)}`}
                >
                  {getStatusText(currentTicket.status)}
                </Badge>
                <span className="text-xl font-light text-teal-700">#{currentTicket.id}</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Valid date</p> 
                    <p className=" text-gray-900">
                      {format(validityDate, "EEEE d MMMM", { locale: it })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Purchase date</p> 
                    <p className=" text-gray-900">
                      {format(purchaseDate, "d MMMM, HH:mm", { locale: it })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment method</p> 
                    <p className=" text-gray-900">
                      {getPaymentMethodText(currentTicket.paymentMethod)}
                      {cardNumber && <span className="ml-2 text-gray-500">({cardNumber})</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    <Tag className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price:</p> 
                    <p className=" text-teal-600 text-xl">€{ticketPrice.toFixed(2)}</p>
                  </div>
                </div>

                {currentTicket.userId && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Owner</p> 
                      <p className=" text-gray-900">ID: {currentTicket.userId}</p>
                    </div>
                  </div>
                )}
              </div>

              {currentTicket.ticketType?.features && currentTicket.ticketType.features.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Includes:</h4> 
                  <ul className="space-y-2">
                    {currentTicket.ticketType.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-teal-700 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {currentTicket.notes && (
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 mt-8 max-w-6xl mx-auto transition-all hover:border-teal-200">
            <h3 className="text-2xl font-light text-gray-900 mb-4">Notes</h3> 
            <p className="text-gray-600 leading-relaxed">{currentTicket.notes}</p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          {isActive && (
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="rounded-full px-12 py-6 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Cancel reservation
            </Button>
          )}
          <Button onClick={handlePrintTicket} className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-12 py-6">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteTicketDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Cancel Reservation" // Localized
        description="Are you sure you want to cancel this reservation? The ticket will be permanently deleted and this action cannot be undone." // Localized
        confirmText="Cancel Reservation" // Localized
        cancelText="Keep Ticket" // Localized
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}