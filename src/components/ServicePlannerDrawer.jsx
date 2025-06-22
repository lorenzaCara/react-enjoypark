import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { AlertCircle, MapPin, Clock, Plus, Ticket, Star, Calendar, ChefHat, Coffee, Car } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useServices } from "@/contexts/ServicesProvider"
import { usePlanners } from "@/contexts/PlannerProvider"

export default function ServiceDetailsDrawer({
  selectedService,
  isDrawerOpen,
  onClose,
  purchasedTickets,
  planners,
  createPlanner,
  updatePlanner,
  toast,
}) {
  const { createServiceBooking } = useServices()
  const { addServiceToPlanner: addSingleServiceToPlanner } = usePlanners()

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerOption, setPlannerOption] = useState("new")
  const [selectedExistingPlanner, setSelectedExistingPlanner] = useState(null)
  const [plannerTitle, setPlannerTitle] = useState("")
  const [plannerDescription, setPlannerDescription] = useState("")
  const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [specialRequests, setSpecialRequests] = useState("")
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const toDateOnly = (dateStr) => {
        if (!dateStr) return null;
         return dateStr.split("T")[0];
      }
    
      const createDateForDisplay = (dateStr) => {
        if (!dateStr) return null;
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
      };

  useEffect(() => {
    if (selectedTicket && selectedTicket.validFor) {
      setBookingDate(toDateOnly(selectedTicket.validFor));
    } else {
      setBookingDate(""); 
    }
  }, [selectedTicket]);

  const isBookableService = () => {
    const bookableTypes = ["restaurant", "café", "rental"]
    return bookableTypes.includes(selectedService?.type?.toLowerCase())
  }

  const getServiceIcon = () => {
    switch (selectedService?.type?.toLowerCase()) {
      case "restaurant":
        return <ChefHat className="h-4 w-4" />
      case "café":
        return <Coffee className="h-4 w-4" />
      case "rental":
        return <Car className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getValidTicketsForService = (service) => {
    if (!service) return []

    return (
      purchasedTickets?.filter((ticket) => {
        if (!["ACTIVE", "USED"].includes(ticket.status) || !ticket.validFor) return false

        const hasAccess = ticket.ticketType?.services?.some((ts) => ts.serviceId === service.id)
        return hasAccess
      }) || []
    )
  }

  const handleCreateServiceBooking = async () => {
    
    if (!bookingDate || !bookingTime) {
      toast({
        title: "Error",
        description: "Please select date and time for the booking.",
        variant: "destructive",
      })
      return
    }
  
    setIsCreatingBooking(true)
    try {
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`)
      const isoString = bookingDateTime.toISOString()
  
      const bookingData = {
        serviceId: selectedService.id,
        ticketId: selectedTicket ? selectedTicket.id : null,
        userId: selectedTicket ? selectedTicket.userId : null,
        bookingTime: isoString,
        numberOfPeople: numberOfPeople,
        specialRequests: specialRequests.trim() || null,
        status: "CONFIRMED",
      }
  
      console.log("Booking data to send:", bookingData)
  
      await createServiceBooking(bookingData)
  
      toast({
        title: "Booking confirmed!",
        description: `Booking for ${selectedService.name} on ${new Date(bookingDate).toLocaleDateString("en-US")} at ${bookingTime}`,
        className: "bg-white text-gray-900 border border-gray-200 shadow-md"
      })
  
      resetBookingForm()
      onClose()
    } catch (error) {
      console.error("Error during booking creation:", error)
      toast({
        title: "Error",
        description: `Error during booking: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsCreatingBooking(false)
    }
  }

const addServiceToPlanner = async (service) => {
  if (!selectedTicket) {
    toast({
      title: "Error",
      description: "Select a valid ticket to add to the planner.",
      variant: "destructive",
    })
    return
  }

  if (selectedTicket.status === "ACTIVE") {
    toast({
      title: "Attention",
      description: "It is not possible to add services to a planner with an already active ticket (used/booked).",
      variant: "destructive",
    });
    return;
  }

  const formattedDate = toDateOnly(selectedTicket.validFor)

  setIsCreatingPlanner(true)
  try {
    if (plannerOption === "new") {
      const plannerData = {
        ticketId: selectedTicket.id,
        userId: selectedTicket.userId,
        title: plannerTitle.trim() || `Planner for ${service.name}`,
        description: plannerDescription || `Planner for the service ${service.name}`,
        date: formattedDate,
        serviceIds: [service.id],
        attractionIds: [],
        showIds: [],
      }

      await createPlanner(plannerData)
      toast({
        title: "Planner created!",
        description: `"${service.name}" has been added to a new planner for ${new Date(formattedDate).toLocaleDateString("en-US")}!`,
        className: "bg-white text-gray-900 border border-gray-200 shadow-md"
      })
    } else {
      const existingPlanner = planners.find((p) => p.id === Number(selectedExistingPlanner))
      if (!existingPlanner) {
        toast({
          title: "Error",
          description: "Selected planner not found",
          variant: "destructive",
        })
        return
      }

      const alreadyInPlanner = existingPlanner.services?.some((s) => s.id === service.id)
      if (alreadyInPlanner) {
        toast({
          title: "Attention",
          description: "This service is already present in the selected planner",
          variant: "destructive",
        })
        return
      }

      await addSingleServiceToPlanner(existingPlanner.id, service.id)

      toast({
        title: "Service added!",
        description: `"${service.name}" has been added to the planner "${existingPlanner.title}"`,
      })
    }

    resetForm()
    onClose()
  } catch (error) {
    console.error("Error while adding service to planner:", error)
    toast({
      title: "Error",
      description: `Error during operation: ${error.message}`,
      variant: "destructive",
    })
  } finally {
    setIsCreatingPlanner(false)
  }
}

  const resetForm = () => {
    setSelectedTicket(null)
    setPlannerOption("new")
    setSelectedExistingPlanner(null)
    setPlannerTitle("")
    setPlannerDescription("")
  }

  const resetBookingForm = () => {
    setBookingDate("")
    setBookingTime("")
    setNumberOfPeople(2)
    setSpecialRequests("")
  }

  const handleDrawerOpen = (open) => {
    if (open) {
      resetForm()
      resetBookingForm()
      if (selectedService) {
        setPlannerTitle(`Planner for ${selectedService.name}`)
      }
    } else {
      onClose()
      resetForm()
      resetBookingForm()
    }
  }

  if (!selectedService) return null

  const validTickets = getValidTicketsForService(selectedService)

  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6 mt-8">
          <div className="flex justify-between items-start">
              <SheetTitle className="text-2xl font-normal text-gray-900 mb-2">{selectedService.name}</SheetTitle>
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                <span className="mr-1">{getServiceIcon()}</span>
                {selectedService.type}
              </Badge>
          </div>
          <SheetDescription className="text-gray-600 mt-4">
            {selectedService.description}
          </SheetDescription>
        </SheetHeader>

        {/* Service Info */}
        <div className="bg-teal-50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {selectedService.operatingHours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Opening hours</span>
                </div>
                <span className=" text-gray-600">{selectedService.operatingHours}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Position</span>
              </div>
              <span className=" text-teal-700">{selectedService.location}</span>
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Available tickets</h3>
          {validTickets.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Select a ticket to {isBookableService() ? "Book or reserve" : "add"} this service:
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {validTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? "border-teal-700 bg-teal-50"
                        : "border-gray-200 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <Ticket className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <div className="font-normal text-gray-900">{ticket.ticketType?.name || "Ticket"}</div>
                        <div className="text-xs text-gray-500">
                          Valid for: {createDateForDisplay(ticket.validFor)?.toLocaleDateString("en-GB", {
                               weekday: 'long',
                               year: 'numeric',
                               month: 'long',
                               day: 'numeric',
                             })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center text-gray-600 mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-normal">Access not available</span>
              </div>
              <p className="text-gray-500 text-sm">
                Buy a ticket that includes this service to gain access.
              </p>
            </div>
          )}
        </div>

        {(isBookableService() || (selectedTicket && selectedTicket.status !== "ACTIVE" && validTickets.length > 0)) && (
          <div className="mb-6">
            <Tabs defaultValue={isBookableService() ? "booking" : "planner"} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: (isBookableService() && selectedTicket && selectedTicket.status !== "ACTIVE" ) ? "repeat(2, 1fr)" : "repeat(1, 1fr)" }}>
                {isBookableService() && <TabsTrigger value="booking" className="font-normal">Book</TabsTrigger>}
                {selectedTicket && selectedTicket.status !== "ACTIVE" && (
                  <TabsTrigger value="planner" className="font-normal">Add to planner</TabsTrigger>
                )}
              </TabsList>

              {/* Booking Tab */}
              {isBookableService() && (
                <TabsContent value="booking" className="space-y-4 mt-4">
                  <h3 className="text-lg text-gray-900 mt-8">Book {selectedService.name}</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-normal text-gray-700 mb-1 block">Date</label>
                        {selectedTicket ? (
                            // Se un ticket è selezionato, mostriamo solo la data ticket come testo non modificabile
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-700">
                                {new Date(bookingDate).toLocaleDateString("it-IT")}
                            </p>
                        ) : (
                            // Se nessun ticket è selezionato, mostriamo l'input della data modificabile
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                max={
                                    selectedTicket?.validFor ? new Date(selectedTicket.validFor).toISOString().split("T")[0] : ""
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                            />
                        )}
                        <input type="hidden" name="bookingDate" value={bookingDate} />
                      </div>
                      <div>
                        <label className="text-sm font-normal text-gray-700 mb-1 block">Hour</label>
                        <input
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-normal text-gray-700 mb-1 block">Number of people</label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-lg font-normal w-8 text-center">{numberOfPeople}</span>
                        <button
                          type="button"
                          onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-normal text-gray-700 mb-1 block">
                        Special requests (not required)
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
                        placeholder="Allergies, preferences, special notes..."
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateServiceBooking}
                    disabled={isCreatingBooking || !bookingDate || !bookingTime } // Disable if no ticket is selected
                    className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-full h-12"
                  >
                    {isCreatingBooking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Booking in progress...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </TabsContent>
              )}

              {/* Planner Tab Content */}
              {selectedTicket && selectedTicket.status !== "ACTIVE" && (
                <TabsContent value="planner" className="space-y-4 mt-4">
                  <h3 className="text-lg font-normal text-gray-900 mt-8">Planner's option</h3>

                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="plannerOption"
                        value="new"
                        checked={plannerOption === "new"}
                        onChange={(e) => setPlannerOption(e.target.value)}
                        className="w-4 h-4 text-teal-700 border-gray-300 focus:ring-teal-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-normal text-gray-900">Create new planner</div>
                        <div className="text-xs text-gray-500">Create a new planner for your ticket</div>
                      </div>
                    </label>

                    {planners.filter(
                      (p) => p.ticketId === selectedTicket.id && toDateOnly(p.date) === toDateOnly(selectedTicket.validFor),
                    ).length > 0 && (
                      <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="plannerOption"
                          value="existing"
                          checked={plannerOption === "existing"}
                          onChange={(e) => setPlannerOption(e.target.value)}
                          className="w-4 h-4 text-teal-700 border-gray-300 focus:ring-teal-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-normal text-gray-900">Add to existing planner</div>
                          <div className="text-xs text-gray-500">Select a previous planner</div>
                        </div>
                      </label>
                    )}
                  </div>

                  {plannerOption === "new" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-normal text-gray-700 mb-1 block">Title</label>
                        <input
                          type="text"
                          value={plannerTitle}
                          onChange={(e) => setPlannerTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                          placeholder="Es. My show..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-normal text-gray-700 mb-1 block">Description (not required)</label>
                        <textarea
                          value={plannerDescription}
                          onChange={(e) => setPlannerDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                          placeholder="Planner description..."
                        />
                      </div>
                    </div>
                  )}

                  {plannerOption === "existing" && (
                    <div className="mt-4">
                      <label className="text-sm font-normal text-gray-700 mb-2 block">Select an existing planner</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {planners
                          .filter(
                            (p) =>
                              p.ticketId === selectedTicket.id && toDateOnly(p.date) === toDateOnly(selectedTicket.validFor),
                          )
                          .map((planner) => (
                            <label
                              key={planner.id}
                              className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                  type="radio"
                                  name="selectedPlanner"
                                  value={planner.id}
                                  checked={Number(selectedExistingPlanner) === planner.id}
                                  onChange={(e) => setSelectedExistingPlanner(Number(e.target.value))}
                                  className="w-4 h-4 text-teal-700 border-gray-300 focus:ring-teal-700"
                                  />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">{planner.title}</div>
                                {planner.description && (
                                  <div className="text-xs text-gray-500">
                                    {planner.description.length > 50
                                      ? `${planner.description.substring(0, 50)}...`
                                      : planner.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => addServiceToPlanner(selectedService)}
                    disabled={
                      isCreatingPlanner || !selectedTicket || (plannerOption === "existing" && !selectedExistingPlanner)
                    }
                    className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-2xl h-12"
                  >
                    {isCreatingPlanner ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {plannerOption === "new" ? "Creating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {plannerOption === "new" ? "Create planner" : "Add to planner"}
                      </>
                    )}
                  </Button>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* Close Button */}
        <div className="flex gap-3 mt-8">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full h-12"
            >
              Chiudi
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}