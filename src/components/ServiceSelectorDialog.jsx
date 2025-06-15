import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Settings, ChevronRight } from "lucide-react"

export default function ServiceSelectorDialog({ isOpen, onClose, bookableServices, onSelectService, getServiceIcon }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3  text-gray-900">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-gray-100">
                <Settings className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-start">Select a Service</h2>
                <p className="text-sm text-gray-500 mt-1 font-light">
                  Choose from available restaurants, cafés and rental services
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div>
          {bookableServices.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto p-6">
              {bookableServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService(service)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-teal-700/20 transition-all duration-300 border border-gray-50 hover:border-teal-700/30 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    {getServiceIcon(service.type)}
                  </div>
                  <div className="flex-1">
                    <div className=" text-gray-900 mb-1">{service.name}</div>
                    <div className="text-sm text-gray-600">{service.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{service.type}</Badge>
                      {service.price && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">€{service.price}</Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">No services available</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                Currently there are no restaurants, cafés or rental services available for booking.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
