import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Calendar, Download, Share2, MapPin, Star, Tag, Clock, Info } from "lucide-react"

export default function TicketDetailDialog({
  isOpen,
  onClose,
  ticket,
  onDownload,
  onShare,
  formatDate,
  getTicketStatusColor,
}) {
  if (!ticket) return null

  const ticketType = ticket.ticketType || {}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-6 -m-6 mb-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-light">{ticketType.name || "Ticket Details"}</h2>
                <p className="text-sm text-teal-100 mt-1 font-light">Ticket #{ticket.id.substring(0, 8)}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-gray-200">
              <QrCode className="w-32 h-32 text-gray-800" />
            </div>
            <Badge className={`${getTicketStatusColor(ticket.status)} text-sm px-4 py-1`}>{ticket.status}</Badge>
          </div>

          {/* Ticket Details */}
          <div className="bg-gray-50 rounded-3xl border-2 border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Valid until</div>
                  <div className="font-medium text-gray-900">{formatDate(ticket.validFor)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Ticket type</div>
                  <div className="font-medium text-gray-900">{ticketType.name || "Standard Ticket"}</div>
                </div>
              </div>

              {ticketType.price && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Tag className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    <div className="font-medium text-gray-900">€{ticketType.price}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Purchase date</div>
                  <div className="font-medium text-gray-900">{formatDate(ticket.purchaseDate)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Included Features */}
          {(ticketType.attractions?.length > 0 || ticketType.shows?.length > 0) && (
            <div className="bg-gray-50 rounded-3xl border-2 border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Included Features</h3>

              <div className="space-y-4">
                {ticketType.attractions?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Attractions</div>
                      <div className="font-medium text-gray-900">
                        {ticketType.attractions.length} attractions included
                      </div>
                    </div>
                  </div>
                )}

                {ticketType.shows?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Shows</div>
                      <div className="font-medium text-gray-900">{ticketType.shows.length} shows included</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="bg-gray-50 rounded-3xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Terms & Conditions</h3>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>• This ticket is valid only for the date specified.</p>
              <p>• Non-refundable and non-transferable.</p>
              <p>• The park reserves the right to refuse entry in case of invalid tickets.</p>
              <p>• Please arrive 15 minutes before your scheduled time.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-2xl px-6 py-3 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => onShare(ticket)}
              className="rounded-2xl px-6 py-3 border-teal-200 text-teal-600 hover:bg-teal-50 transition-all duration-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => onDownload(ticket)}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-3 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
