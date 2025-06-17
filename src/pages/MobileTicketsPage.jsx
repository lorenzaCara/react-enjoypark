import { useTickets } from "@/contexts/TicketsProvider"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { ArrowLeft, Calendar, Clock, QrCode, Tag, AlertCircle } from "lucide-react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"

export default function MobileTicketsPage() {
  const { purchasedTickets, loading, error: ticketsError } = useTickets()
  const [activeTickets, setActiveTickets] = useState([])

  useEffect(() => {
    // Filter only active tickets
    const active = purchasedTickets.filter((ticket) => ticket.status === "ACTIVE")
    setActiveTickets(active)
  }, [purchasedTickets])

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

  if ( ticketsError ) {
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
    <div className="min-h-screen mx-auto max-w-4xl px-4 py-6">
      {/* Tickets Container */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-teal-700 mb-8 flex items-center ps-2">
          <QrCode className="h-5 w-5 mr-2" />
            <p className="font-light text-2xl">Active tickets ready for scanning</p>
        </h2>

        {activeTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg text-gray-800 mb-2">No active tickets</h3>
            <p className="text-gray-700 mb-4">You don't have any active tickets.</p>
            <Link to="/tickets">
              <button className="bg-teal-700 hover:bg-teal-600 text-white py-2 px-4 rounded-full">
                Buy your tickets
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTickets.map((ticket) => (
              <Link to={`/ticket/${ticket.id}`} key={ticket.id}>
                <div className="ticket-container">
                  <div className="ticket-content bg-teal-600 relative overflow-hidden rounded-3xl mb-2">
                    <div className="ticket-header bg-gradient-to-r from-teal-700 to-teal-600 p-4 text-white">
                      <div className="flex justify-between items-center">
                        <h3 className="">{ticket.ticketType?.name || `Ticket #${ticket.id}`}</h3>
                        <span className="text-lg">€{ticket.ticketType.price?.toFixed(2) || "N/D"}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap md:flex-nowrap gap-4">
                        <div className="w-full md:w-1/3 flex justify-center">
                          <div className="bg-teal-50 p-3 rounded-2xl flex items-center justify-center w-32 h-32">
                            {ticket.qrCode ? (
                              <img src={ticket.qrCode || "/placeholder.svg"} alt="QR Code" className="w-24 h-24" />
                            ) : (
                              <div className="w-24 h-24 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                                <QrCode className="h-10 w-10 text-gray-300" />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                  {ticket.rawCode ? ticket.rawCode.substring(0, 8) + "..." : "QR"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full md:w-2/3 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-teal-500" />
                            <div>
                              <p className=" text-white">Valid for:</p>
                              <p className="text-sm font-light text-teal-300">
                                {format(new Date(ticket.validFor), "EEEE d MMMM yyyy", { locale: it })}
                              </p>
                            </div>
                          </div>

                          {ticket.purchaseDate && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-teal-500" />
                              <div>
                                <p className=" text-white">Purchased on:</p>
                                <p className="text-sm font-light text-teal-300">
                                  {format(new Date(ticket.purchaseDate), "d MMMM yyyy", { locale: it })}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <Tag className="h-4 w-4 mr-2 text-teal-500" />
                            <div>
                              <p className="text-white">Type:</p>
                              <p className="text-sm font-light text-teal-300">
                                {ticket.ticketType?.description || "Standard ticket"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border-r border-dashed border-gray-300"></div>
                    <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border-l border-dashed border-gray-300"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
