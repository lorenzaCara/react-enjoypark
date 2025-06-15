import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash, Trash2 } from "lucide-react"

export default function DeletePlannerDialog({ open, onOpenChange, selectedPlanner, onDelete, onCancel }) {
  const handleDelete = () => {
    if (selectedPlanner?.id) {
      onDelete(selectedPlanner.id)
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <p className="text-gray-700">
            Are you sure you want to delete the planner <strong>"{selectedPlanner?.title}"</strong>?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 p-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-full px-12 py-6 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-12 py-6 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Planner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}