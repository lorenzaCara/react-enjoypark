import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CreditCard, CheckCircle, AlertCircle, Wallet } from "lucide-react"
import { useUser } from "@/contexts/UserProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router"

export function TicketPurchaseFlow({ ticket, isOpen, onClose, onPurchase }) {
  const { toast } = useToast()
  const { addPurchasedTicket, user } = useUser()
  const { createTicket, creating, createError } = useTickets()
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    visitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ad una settimana da oggi
    paymentMethod: "CREDIT_CARD",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    savePaymentMethod: false,
  })

  const [errors, setErrors] = useState({})

  const steps = [
    { id: "quantity", title: "Quantity & Date" },
    { id: "payment", title: "Payment" },
    { id: "confirmation", title: "Confirmation" },
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setPurchaseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))


    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleDateChange = (date) => {
    setPurchaseData((prev) => ({ ...prev, visitDate: date }))
    if (errors.visitDate) {
      setErrors((prev) => ({ ...prev, visitDate: null }))
    }
  }

  const handleQuantityChange = (value) => {

    const newQuantity = Math.max(1, Math.min(10, value))
    setPurchaseData((prev) => ({ ...prev, quantity: newQuantity }))
  }

  const validateStep = () => {
    try {
      if (currentStep === 0) {
        const quantityDateSchema = z.object({
          quantity: z.number().min(1, "Please select at least 1 ticket").max(10, "Maximum 10 tickets allowed"),
          visitDate: z
            .date({
              required_error: "Please select a visit date",
              invalid_type_error: "Please select a valid date",
            })
            .refine((date) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date >= today
            }, "Visit date cannot be in the past"),
        })

        quantityDateSchema.parse({
          quantity: purchaseData.quantity,
          visitDate: purchaseData.visitDate,
        })
      } else if (currentStep === 1 && purchaseData.paymentMethod === "CREDIT_CARD") {
        const paymentSchema = z.object({
          cardNumber: z
            .string()
            .min(1, "Card number is required")
            .refine((val) => /^\d{16}$/.test(val.replace(/\s/g, "")), "Please enter a valid 16-digit card number"),
          cardName: z.string().min(1, "Cardholder name is required"),
          cardExpiry: z
            .string()
            .min(1, "Expiry date is required")
            .refine((val) => /^\d{2}\/\d{2}$/.test(val), "Please use MM/YY format"),
          cardCvv: z
            .string()
            .min(1, "CVV is required")
            .refine((val) => /^\d{3,4}$/.test(val), "CVV must be 3 or 4 digits"),
        })

        paymentSchema.parse({
          cardNumber: purchaseData.cardNumber.replace(/\s/g, ""),
          cardName: purchaseData.cardName,
          cardExpiry: purchaseData.cardExpiry,
          cardCvv: purchaseData.cardCvv,
        })
      }

      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {}
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleCompletePurchase = async () => {
    if (!validateStep()) return

    setIsProcessing(true)

    try {
      if (!user?.id) {
        throw new Error("Utente non autenticato")
      }

      const userId = user.id
      const validFor = purchaseData.visitDate.toISOString()

      console.log("Ticket inviato:", {
        ticketTypeId: ticket?.id,
        validFor,
        discountId: null,
        status: "ACTIVE",
        userId,
        paymentMethod: purchaseData.paymentMethod,
      })

      const tickets = []
      for (let i = 0; i < purchaseData.quantity; i++) {
        const newTicket = await createTicket({
          ticketTypeId: ticket.id,
          validFor,
          discountId: null,
          status: "ACTIVE",
          userId,
          paymentMethod: purchaseData.paymentMethod,
        })

        if (addPurchasedTicket) {
          addPurchasedTicket({
            ...newTicket,
            name: ticket.name,
            price: ticket.price,
            type: ticket.type,
          })
        }

        tickets.push(newTicket)
      }

      setPurchaseComplete(true)
      setCurrentStep(2) 

      toast({
        variant: "success",
        title: "Purchase Successful!",
        description: `You have purchased ${purchaseData.quantity} ${
          purchaseData.quantity > 1 ? "tickets" : "ticket"
        } for ${format(purchaseData.visitDate, "PPP", { locale: it })}.`,
        className: "bg-white text-gray-900 border border-gray-200 shadow-md"
      })

      if (onPurchase) {
        onPurchase(tickets)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "There was an error processing your purchase. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (purchaseComplete) {
      setPurchaseData({
        quantity: 1,
        visitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentMethod: "CREDIT_CARD",
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvv: "",
        savePaymentMethod: false,
      })
      setCurrentStep(0)
      setPurchaseComplete(false)
    }
    onClose()
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  if (!ticket) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-y-auto rounded-3xl border-2 border-gray-100 p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-gray-100">
                <Wallet className="w-5 h-5 text-teal-700" />
              </div>
              {ticket.name}
            </DialogTitle>
            <DialogDescription>
              {purchaseComplete
                ? "Your purchase is complete! View your tickets in your profile."
                : "Complete your purchase by following the steps below."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stepper */}
        {!purchaseComplete && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-light text-sm",
                      currentStep === index
                        ? "bg-teal-700 text-white"
                        : currentStep > index
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1 font-light",
                      currentStep === index
                        ? "text-teal-700 font-medium"
                        : currentStep > index
                          ? "text-teal-600"
                          : "text-gray-400",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full mt-2">
              <div
                className="bg-teal-700 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="px-6 pb-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="quantity" className="text-gray-900 font-normal">
                  Number of Tickets
                </Label>
                <div className="flex justify-between items-center mt-2 gap-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => handleQuantityChange(purchaseData.quantity - 1)}
                    disabled={purchaseData.quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={purchaseData.quantity}
                    onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
                    className="h-10 text-center rounded-full w-64"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => handleQuantityChange(purchaseData.quantity + 1)}
                    disabled={purchaseData.quantity >= 10}
                  >
                    +
                  </Button>
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-900 font-normal">Visit Date</Label>
                <div className="mt-2 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={purchaseData.visitDate}
                    onSelect={handleDateChange}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    className="border rounded-2xl p-3"
                  />
                </div>
                {errors.visitDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.visitDate}
                  </p>
                )}
              </div>

              <div className="bg-teal-700/15 p-4 rounded-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-normal">Total</p>
                    <p className="text-gray-500 text-sm">
                      {purchaseData.quantity} {purchaseData.quantity > 1 ? "tickets" : "ticket"} for{" "}
                      {format(purchaseData.visitDate, "PPP", { locale: it })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">
                      €{(ticket.price * purchaseData.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-gray-900 font-normal">Payment Method</Label>
                <RadioGroup
                  value={purchaseData.paymentMethod}
                  onValueChange={(value) => handleInputChange({ target: { name: "paymentMethod", value } })}
                  className="mt-2 space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-2xl p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="CREDIT_CARD" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center cursor-pointer font-normal">
                      <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                      Credit or Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-2xl p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="PAYPAL" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center cursor-pointer font-normal">
                    <img src="/img/paypal.png" className="w-[20px] h-[20px]"/>
                      PayPal
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {purchaseData.paymentMethod === "CREDIT_CARD" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-gray-900 font-normal">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={purchaseData.cardNumber}
                      onChange={(e) => {
                        const formattedValue = formatCardNumber(e.target.value)
                        handleInputChange({ target: { name: "cardNumber", value: formattedValue } })
                      }}
                      placeholder="1234 5678 9012 3456"
                      className={cn(
                        "rounded-xl",
                        errors.cardNumber && "border-red-300 focus:border-red-500 rounded-xl"
                      )}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cardName" className="text-gray-900 font-normal">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={purchaseData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={cn(
                        "rounded-xl",
                        errors.cardName && "border-red-300 focus:border-red-500 rounded-xl"
                      )}
                    />
                    {errors.cardName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.cardName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-gray-900 font-normal">
                        Expiry Date
                      </Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        value={purchaseData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className={cn ("rounded-xl",errors.cardExpiry && "border-red-300 focus:border-red-500 rounded-xl")}
                      />
                      {errors.cardExpiry && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cardCvv" className="text-gray-900 font-normal">
                        CVV
                      </Label>
                      <Input
                        id="cardCvv"
                        name="cardCvv"
                        value={purchaseData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className={cn("rounded-xl",errors.cardCvv && "border-red-300 focus:border-red-500 rounded-xl")}
                      />
                      {errors.cardCvv && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.cardCvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="savePaymentMethod"
                      name="savePaymentMethod"
                      checked={purchaseData.savePaymentMethod}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500 rounded-xl"
                    />
                    <Label htmlFor="savePaymentMethod" className="text-sm text-gray-600 cursor-pointer font-normal">
                      Save this payment method for future purchases
                    </Label>
                  </div>
                </div>
              )}

              {purchaseData.paymentMethod === "PAYPAL" && (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-700">
                    You will be redirected to PayPal to complete your purchase after clicking "Continue".
                  </p>
                </div>
              )}

              <div className="bg-teal-700/15 p-4 rounded-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-normal">Total</p>
                    <p className="text-gray-500 text-sm">
                      {purchaseData.quantity} {purchaseData.quantity > 1 ? "tickets" : "ticket"} for{" "}
                      {format(purchaseData.visitDate, "PPP", { locale: it })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">
                      €{(ticket.price * purchaseData.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && purchaseComplete && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Complete!</h3>
              <p className="text-gray-600 mb-6">
                You have successfully purchased {purchaseData.quantity}{" "}
                {purchaseData.quantity > 1 ? "tickets" : "ticket"} for{" "}
                {format(purchaseData.visitDate, "PPP", { locale: it })}.
              </p>
              <p className="text-gray-600 mb-6">
                Your tickets are now available in your profile. You can view and manage them at any time.
              </p>
              <Link to={"/profile"}>
                <Button onClick={handleClose} className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-6 font-light">
                  View my tickets
                </Button>
              </Link>
            </div>
          )}

          {createError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {createError}
              </p>
            </div>
          )}

          {!purchaseComplete && (
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full py-6 px-12"
                >
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full py-6 px-12"
                >
                  Cancel
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-teal-700 hover:bg-teal-600 text-white rounded-full py-6 px-12"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCompletePurchase}
                  disabled={isProcessing || creating}
                  className="bg-teal-700 hover:bg-teal-600 text-white rounded-full py-6 px-12"
                >
                  {isProcessing || creating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processing...
                    </>
                  ) : (
                    "Complete Purchase"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
