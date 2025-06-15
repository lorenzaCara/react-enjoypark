import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash } from "lucide-react"

export function DeleteTicketDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  variant = "destructive", // "destructive" or "warning"
}) {
  const handleConfirm = () => {
    onConfirm()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          iconColor: "text-amber-500",
          iconBg: "bg-amber-100",
          confirmButton: "bg-amber-500 hover:bg-amber-600",
        }
      case "destructive":
      default:
        return {
          iconColor: "text-red-500",
          iconBg: "bg-red-100",
          confirmButton: "bg-red-500 hover:bg-red-600",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-gray-900 font-normal">
              <div className={`w-10 h-10 bg-white/20 rounded-2xl ${styles.iconBg} flex items-center justify-center border-2 border-red-200/30`}>
                <Trash className={`h-5 w-5 ${styles.iconColor}`} />
              </div>
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1 font-light text-gray-500 text-start">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-12 py-6 font-light"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${styles.confirmButton} text-white rounded-full px-12 py-6 font-light`}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full px-12 py-6 border-2 border-white border-t-transparent font-light"></span>
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

