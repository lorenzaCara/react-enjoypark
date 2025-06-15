import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash } from "lucide-react"

export default function DeleteNotificationDialog({ isOpen, onClose, onConfirm, notificationMessage }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
      <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-red-200/30">
                  <Trash className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Delete confirmation</h2>
                  <p className="text-sm mt-1 font-light text-gray-500">This action cannot be undone</p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

        <div className="space-y-6 p-6">
          <p className="text-gray-700 mb-4">
          Are you sure you want to delete this notification? This action cannot be undone and you will lose all booking
          details.
          </p>
          {notificationMessage && (
            <div className="rounded-xl bg-red-100/50 p-4">
              <p className="text-sm text-gray-600 italic">"{notificationMessage}"</p>
            </div>
          )}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="rounded-full px-12 py-6 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300">
            Annulla
          </Button>
          <Button variant='outline' onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-12 py-6 transition-all duration-300 hover:text-white">
            Elimina
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
