import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Mail, Copy, Check, Share2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TicketShareDialog({ isOpen, onClose, ticket }) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!ticket) return null

  const ticketType = ticket.ticketType || {}
  const ticketLink = `https://heptapod.vercel.app/tickets/${ticket.id}`

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    setTimeout(() => {
      setIsSending(false)
      toast({
        title: "Ticket shared",
        description: `Ticket has been shared with ${email}`,
        variant: "success",
      })
      onClose()
    }, 1500)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketLink)
    setCopied(true)

    toast({
      title: "Link copied",
      description: "Ticket link copied to clipboard",
      variant: "success",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gray-100">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-6 -m-6 mb-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-light">Share Ticket</h2>
                <p className="text-sm text-teal-100 mt-1 font-light">Share your ticket with friends and family</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-3xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{ticketType.name || "Ticket"}</h3>
                <p className="text-sm text-gray-600">Ticket #{ticket.id.substring(0, 8)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share via Email</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter recipient's email"
                    className="pl-10 rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message"
                    rows={3}
                    className="w-full pl-10 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={isSending || !email}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12"
              >
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share via Link</h3>

            <div className="relative">
              <Input
                type="text"
                value={ticketLink}
                readOnly
                className="pr-24 rounded-2xl h-12 border-2 border-gray-200"
              />
              <Button
                onClick={handleCopyLink}
                className="absolute right-1 top-1 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-2xl px-6 py-3 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
