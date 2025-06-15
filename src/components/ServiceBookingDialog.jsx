import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Bookmark } from "lucide-react"

export default function ServiceBookingDialog({
  isOpen,
  onClose,
  selectedService,
  bookingData,
  setBookingData,
  isEditing,
  isSaving,
  onSave,
  getServiceIcon,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3  text-gray-900">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-gray-100">
                {getServiceIcon(selectedService?.type || "default")}
              </div>
              <div>
                <h2 className="text-2xl font-light">
                  {isEditing ? "Edit Booking" : "Book"} {selectedService?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-light">
                  {selectedService?.type} • {selectedService?.location}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="block text-sm text-gray-700 mb-3">Date *</label>
            <Input
              type="date"
              value={bookingData.date}
              onChange={(e) => setBookingData((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500/30 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-3">Time *</label>
            <Input
              type="time"
              value={bookingData.time}
              onChange={(e) => setBookingData((prev) => ({ ...prev, time: e.target.value }))}
              className="rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500/30 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-3">Number of people *</label>
            <Input
              type="number"
              min="1"
              value={bookingData.numberOfPeople}
              onChange={(e) =>
                setBookingData((prev) => ({
                  ...prev,
                  numberOfPeople: e.target.value,
                }))
              }
              className="rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500/30 transition-all duration-300"
              placeholder="e.g. 2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-3">Special requests (optional)</label>
            <Textarea
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData((prev) => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Add notes for your booking..."
              rows={3}
              className="rounded-2xl border-2 border-gray-200 focus:border-teal-500/30 transition-all duration-300"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full px-12 py-6 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || !bookingData.date || !bookingData.time}
              className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-12 py-6  transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Saving..." : "Booking..."}
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
