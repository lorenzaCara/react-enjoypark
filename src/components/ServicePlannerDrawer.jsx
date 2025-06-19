import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { AlertCircle, MapPin, Clock, Plus, Ticket, Star, Calendar, ChefHat, Coffee, Car } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useServices } from "@/contexts/ServicesProvider"
// Assumi che tu abbia un modo per ottenere l'ID dell'utente corrente, ad esempio da un contesto di autenticazione
// import { useAuth } from "@/contexts/AuthProvider"; // Esempio

export default function ServiceDetailsDrawer({
  selectedService,
  isDrawerOpen,
  onClose,
  purchasedTickets,
  planners,
  createPlanner,
  updatePlanner,
  toast,
  userId, // Aggiungi userId come prop o ottienilo da un contesto
}) {
  const { createServiceBooking } = useServices()
  // const { user } = useAuth(); // Se usi un contesto di autenticazione

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerOption, setPlannerOption] = useState("new")
  const [selectedExistingPlanner, setSelectedExistingPlanner] = useState(null)
  const [plannerTitle, setPlannerTitle] = useState("")
  const [plannerDescription, setPlannerDescription] = useState("")
  const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)
  const [plannerDate, setPlannerDate] = useState(toDateOnly(new Date())); // Nuova state per la data del planner senza ticket

  // Booking states
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [specialRequests, setSpecialRequests] = useState("")
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  // Function to safely extract only the date in YYYY-MM-DD format
  const toDateOnly = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Adjust for timezone offset to get the correct date string
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
    return adjustedDate.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (selectedTicket && selectedTicket.validFor) {
      setBookingDate(toDateOnly(selectedTicket.validFor));
      setPlannerDate(toDateOnly(selectedTicket.validFor)); // Sincronizza anche la data del planner se un ticket è selezionato
    } else {
      setBookingDate(""); // Clear the date if no ticket is selected or validFor is missing
      // Se nessun ticket è selezionato, la data del planner rimane la corrente o quella selezionata manualmente
    }
  }, [selectedTicket]);

  // Checks if the service is bookable
  const isBookableService = () => {
    const bookableTypes = ["restaurant", "café", "rental"]
    return bookableTypes.includes(selectedService?.type?.toLowerCase())
  }

  // Gets the appropriate icon for the service type
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

  // Function to get valid tickets for the service
  const getValidTicketsForService = (service) => {
    if (!service) return []

    return (
      purchasedTickets?.filter((ticket) => {
        // Only include tickets that have access to this service
        const hasAccess = ticket.ticketType?.services?.some((ts) => ts.serviceId === service.id)
        // Also, ensure the ticket has a validFor date
        return hasAccess && ticket.validFor;
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
      // Combine date and time into a DateTime format
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`)
      const isoString = bookingDateTime.toISOString() // automatically adds Z

      const bookingData = {
        serviceId: selectedService.id,
        // Send ticketId only if selectedTicket is present, otherwise null
        ticketId: selectedTicket ? selectedTicket.id : null,
        userId: selectedTicket ? selectedTicket.userId : userId, // Usa l'ID utente dalla prop o contesto
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

  // Function to add the service to the planner
  const addServiceToPlanner = async (service) => {
    // La logica del ticket "ACTIVE" si applica solo se un ticket è selezionato
    if (selectedTicket && selectedTicket.status === "ACTIVE") {
      toast({
        title: "Attention",
        description: "It is not possible to add services to a planner with an already active ticket (used/booked).",
        variant: "destructive",
      });
      return;
    }

    // Se non c'è un selectedTicket, usiamo plannerDate
    const dateForPlanner = selectedTicket ? toDateOnly(selectedTicket.validFor) : plannerDate;

    if (!dateForPlanner) {
        toast({
            title: "Error",
            description: "Please select a date for the planner.",
            variant: "destructive",
        });
        return;
    }

    setIsCreatingPlanner(true)
    try {
      if (plannerOption === "new") {
        const plannerData = {
          ticketId: selectedTicket ? selectedTicket.id : null, // Imposta a null se nessun ticket selezionato
          userId: selectedTicket ? selectedTicket.userId : userId, // Usa l'ID utente dalla prop o contesto
          title: plannerTitle.trim() || `Planner for ${service.name}`,
          description: plannerDescription || `Planner for the service ${service.name}`,
          date: dateForPlanner, // Usa la data determinata
          serviceIds: [service.id],
          attractionIds: [],
          showIds: [],
        }

        await createPlanner(plannerData)
        toast({
          title: "Planner created!",
          description: `"${service.name}" has been added to a new planner for ${new Date(dateForPlanner).toLocaleDateString("en-US")}!`,
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

        // Assicurati che la data del planner esistente sia compatibile (se c'è un ticket selezionato)
        if (selectedTicket && toDateOnly(existingPlanner.date) !== toDateOnly(selectedTicket.validFor)) {
            toast({
                title: "Error",
                description: "The selected planner is for a different date than your ticket.",
                variant: "destructive",
            });
            return;
        }


        if (existingPlanner.serviceIds?.includes(service.id)) {
          toast({
            title: "Attention",
            description: "This service is already present in the selected planner",
            variant: "destructive",
          })
          return
        }

        const updatedServiceIds = [...(existingPlanner.serviceIds || []), service.id]
        const updatedPlannerData = {
          ...existingPlanner,
          serviceIds: updatedServiceIds,
        }

        await updatePlanner(existingPlanner.id, updatedPlannerData)

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
        description: `Error during operation: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsCreatingPlanner(false)
    }
  }

  // Function to reset the planner form
  const resetForm = () => {
    setSelectedTicket(null)
    setPlannerOption("new")
    setSelectedExistingPlanner(null)
    setPlannerTitle("")
    setPlannerDescription("")
    setPlannerDate(toDateOnly(new Date())); // Resetta la data del planner alla corrente
  }

  // Function to reset the booking form
  const resetBookingForm = () => {
    setBookingDate("")
    setBookingTime("")
    setNumberOfPeople(2)
    setSpecialRequests("")
  }

  // Handles drawer opening
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
  // Determina se il tab "Add to Planner" deve essere abilitato.
  // È abilitato se c'è un ticket NON "ACTIVE" o se non c'è nessun ticket selezionato (per aggiunta singola)
  const canAddToPlannerTab = (selectedTicket && selectedTicket.status !== "ACTIVE") || (!selectedTicket);
  const showTabs = isBookableService() || canAddToPlannerTab;


  // Filter planners for "existing" option:
  // - If a ticket is selected, show planners associated with that ticket and date
  // - If no ticket is selected, show all planners for the current user (assuming userId is available)
  const filteredPlanners = planners.filter((p) => {
    if (selectedTicket) {
      return p.ticketId === selectedTicket.id && toDateOnly(p.date) === toDateOnly(selectedTicket.validFor);
    } else {
      // Per planner senza ticket, filtra per la data selezionata (plannerDate) e l'utente corrente
      return toDateOnly(p.date) === plannerDate && p.ticketId === null && p.userId === userId;
    }
  });


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

        {/* Ticket Selection (Optional for planner functionality) */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Available tickets</h3>
          {validTickets.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Select a ticket to {isBookableService() ? "Book or reserve" : "add"} this service, or proceed without one to add it to your planner for general interest:
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
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
                          Valid for: {new Date(toDateOnly(ticket.validFor)).toLocaleDateString("it-IT")}
                        </div>
                        {ticket.status === "ACTIVE" && (
                            <div className="text-xs text-red-500 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Already used/booked
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
               {/* Button to clear ticket selection */}
              {selectedTicket && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="w-full text-sm text-gray-600 hover:text-teal-700 hover:bg-gray-50 mt-2"
                >
                  Clear Ticket Selection
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center text-gray-600 mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-normal">No valid tickets available</span>
              </div>
              <p className="text-gray-500 text-sm">
                You can still add this service to your planner as a general interest item.
              </p>
            </div>
          )}
        </div>

        {/* Tabs per Booking e Planner */}
        {showTabs && (
          <div className="mb-6">
            <Tabs defaultValue={isBookableService() && validTickets.length > 0 ? "booking" : "planner"} className="w-full">
              <TabsList
                 className="grid w-full"
                 // Dynamic grid columns based on tab visibility
                 style={{
                   gridTemplateColumns: `repeat(${[isBookableService() && validTickets.length > 0, canAddToPlannerTab].filter(Boolean).length}, 1fr)`
                 }}
              >
                {isBookableService() && validTickets.length > 0 && <TabsTrigger value="booking" className="font-normal">Book</TabsTrigger>}
                {canAddToPlannerTab && (
                  <TabsTrigger value="planner" className="font-normal">Add to planner</TabsTrigger>
                )}
              </TabsList>

              {/* Booking Tab Content */}
              {isBookableService() && validTickets.length > 0 && ( // Ensure booking tab is only shown if bookable AND there are valid tickets
                <TabsContent value="booking" className="space-y-4 mt-4">
                  <h3 className="text-lg text-gray-900 mt-8">Book {selectedService.name}</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-normal text-gray-700 mb-1 block">Date</label>
                        {selectedTicket ? (
                            // If a ticket is selected, display its validFor date as read-only
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-700">
                                {new Date(bookingDate).toLocaleDateString("it-IT")}
                            </p>
                        ) : (
                            // If no ticket is selected, allow date input
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                min={toDateOnly(new Date())} // Min date is today
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                            />
                        )}
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
                    disabled={isCreatingBooking || !bookingDate || !bookingTime || !selectedTicket} // Booking requires a ticket
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
              {canAddToPlannerTab && (
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
                        <div className="text-xs text-gray-500">Create a new planner for your interests</div>
                      </div>
                    </label>

                    {filteredPlanners.length > 0 && (
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
                        {!selectedTicket && ( // Mostra l'input data solo se NON c'è un ticket selezionato
                            <div>
                                <label className="text-sm font-normal text-gray-700 mb-1 block">Planner Date</label>
                                <input
                                    type="date"
                                    value={plannerDate}
                                    onChange={(e) => setPlannerDate(e.target.value)}
                                    min={toDateOnly(new Date())}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                                />
                            </div>
                        )}
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
                        {filteredPlanners.map((planner) => (
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
                                    <div className="text-xs text-gray-400 mt-1">
                                        Date: {new Date(toDateOnly(planner.date)).toLocaleDateString("it-IT")}
                                        {planner.ticketId ? ` (Ticket ID: ${planner.ticketId})` : " (No ticket)"}
                                    </div>
                                </div>
                            </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => addServiceToPlanner(selectedService)}
                    disabled={
                      isCreatingPlanner ||
                      (plannerOption === "new" && (!plannerTitle.trim() && !selectedTicket)) || // Title required for new planner without ticket
                      (plannerOption === "existing" && !selectedExistingPlanner) ||
                      (!selectedTicket && !plannerDate) // Se non c'è ticket, la data del planner è obbligatoria
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