import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, MapPin, Star } from "lucide-react"
import { useTickets } from "@/contexts/TicketsProvider"

export default function TicketSelectorDialog({ isOpen, onClose, onSelectTicket }) {
    const [selectedDate, setSelectedDate] = useState("")
    const { tickets: ticketTypes, loading: ticketsLoading, error: ticketsError } = useTickets()

    const handleTicketSelection = (ticketType) => {
        if (!selectedDate) {
            alert("Please select a date first.")
            return
        }
        const newTicket = {
            ticketType: ticketType, 
            validFor: selectedDate, 
        }

        onSelectTicket(newTicket) 
        onClose() 
    }

    if (ticketsLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg rounded-3xl border-2 border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading ticket options...</p>
                </DialogContent>
            </Dialog>
        )
    }

    if (ticketsError) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg rounded-3xl border-2 border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 text-red-500 mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.26-3.398 2.305-3.303 3.376s-2.305 3.398-3.376 3.303m20.679-3.376c.866 1.26 3.398 2.305 3.303 3.376s2.305 3.398 3.376 3.303m-20.679 0c.866 1.26 3.398 2.305 3.303 3.376s2.305 3.398 3.376 3.303m-3.376 0l3.376-3.303M12 18.75h.008v.008H12z" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-medium text-red-700 mb-3">Error Loading Tickets</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{ticketsError}</p>
                    <Button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-3"
                    >
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100">
                <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-6 -m-6 mb-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-4 text-white">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-light">Buy Tickets</h2>
                                <p className="text-sm text-teal-100 mt-1 font-light">Select your preferred ticket type and date</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="ticket-date" className="block text-sm font-medium text-gray-700 mb-3">
                            Select Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="ticket-date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500 transition-all duration-300 px-4"
                            min={new Date().toISOString().split('T')[0]} 
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Available Tickets</h3>

                        {ticketTypes.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-6 text-center">
                                <p className="text-gray-600">No ticket types available at the moment. Please check back later.</p>
                            </div>
                        ) : (
                            ticketTypes.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 border border-gray-200 hover:border-teal-200 group"
                                >
                                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                        <Ticket className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium text-gray-900">{ticket.name}</div>
                                            {ticket.badge && (
                                                <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{ticket.badge}</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">{ticket.description}</div>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            {ticket.attractionsCount !== undefined && (
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    {ticket.attractionsCount} attractions
                                                </div>
                                            )}
                                            {ticket.showsCount !== undefined && (
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Star className="w-4 h-4" />
                                                    {ticket.showsCount} shows
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-medium text-teal-700">€{ticket.price ? ticket.price.toFixed(2) : 'N/A'}</div>
                                        <Button
                                            size="sm"
                                            disabled={!selectedDate}
                                            onClick={() => handleTicketSelection(ticket)}
                                            className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl"
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="rounded-2xl px-6 py-3 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}