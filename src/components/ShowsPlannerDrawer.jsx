import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { AlertCircle, MapPin, Clock, Calendar, Plus, Ticket } from "lucide-react"

export default function ShowsPlannerDrawer({
  selectedShow,
  isDrawerOpen,
  onClose,
  purchasedTickets,
  planners,
  createPlanner,
  updatePlanner,
  toast,
  userId, // Aggiungi userId come prop
}) {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerOption, setPlannerOption] = useState("new")
  const [selectedExistingPlanner, setSelectedExistingPlanner] = useState(null)
  const [plannerTitle, setPlannerTitle] = useState("")
  const [plannerDescription, setPlannerDescription] = useState("")
  const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)
  const [plannerDate, setPlannerDate] = useState(toDateOnly(new Date())); // Nuova state per la data del planner senza ticket

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
    // Quando si seleziona uno show, imposta la data del planner (e del biglietto se presente) alla data dello show.
    // Se non c'è uno show, imposta alla data corrente.
    if (selectedShow && selectedShow.date) {
      setPlannerDate(toDateOnly(selectedShow.date));
      // Reset selected ticket if the show changes
      setSelectedTicket(null);
    } else {
      setPlannerDate(toDateOnly(new Date()));
    }
  }, [selectedShow]);


  // Function to get valid tickets for the show
  const getValidTicketsForShow = (show) => {
    if (!show.date) return []

    const showDate = toDateOnly(show.date)

    return (
      purchasedTickets?.filter((ticket) => {
        // Solo biglietti non "ACTIVE" (quindi disponibili per l'uso nel planner)
        // e che abbiano una data di validità che corrisponda alla data dello show
        const ticketDate = toDateOnly(ticket.validFor);
        const hasAccess = ticket.ticketType?.shows?.some((tsShow) => tsShow.show.id === show.id);

        // Consideriamo "validi" per l'aggiunta al planner solo i biglietti NON ANCORA USATI (status !== "ACTIVE")
        // e che corrispondano alla data dello show e che abbiano accesso allo show.
        return hasAccess && ticketDate === showDate && ticket.status !== "ACTIVE";
      }) || []
    )
  }

  // Function to add the show to the planner
  const addShowToPlanner = async (show) => {
    console.log("Attempting to add show to planner:", show);

    // Se un ticket è selezionato e il suo status è ACTIVE, non permettere l'aggiunta.
    // Questa check è ridondante se getValidTicketsForShow filtra già per status,
    // ma aggiunge un ulteriore livello di sicurezza.
    if (selectedTicket && selectedTicket.status === "ACTIVE") {
      toast({
        title: "Attention",
        description: "It is not possible to add shows to a planner with an already active ticket (used/booked).",
        variant: "destructive",
      });
      return;
    }

    // Determina la data da usare per il planner: se c'è un ticket selezionato, usa la sua data; altrimenti, usa plannerDate.
    const dateForPlanner = selectedTicket ? toDateOnly(selectedTicket.validFor) : plannerDate;

    if (!dateForPlanner) {
      toast({
        title: "Error",
        description: "Please select a date for the planner.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPlanner(true);
    try {
      if (plannerOption === "new") {
        console.log("Creating a new planner.");
        const plannerData = {
          ticketId: selectedTicket ? selectedTicket.id : null, // Imposta a null se nessun ticket selezionato
          userId: selectedTicket ? selectedTicket.userId : userId, // Usa l'ID utente dalla prop o contesto
          title: plannerTitle.trim() || `Planner for ${show.title}`,
          description: plannerDescription || `Planner for the show ${show.title}`,
          date: dateForPlanner, // Usa la data determinata
          showIds: [show.id],
          attractionIds: [],
          serviceIds: [],
        };
        console.log("New planner data:", plannerData);

        await createPlanner(plannerData);
        toast({
          title: "Planner created!",
          description: `"${show.title}" has been added to a new planner for ${new Date(dateForPlanner).toLocaleDateString("en-US")}!`,
          className: "bg-white text-gray-900 border border-gray-200 shadow-md"
        });
      } else {
        console.log("Adding show to an existing planner.");
        const existingPlanner = planners.find((p) => p.id === Number(selectedExistingPlanner));
        if (!existingPlanner) {
          console.error("Selected planner not found. ID:", selectedExistingPlanner);
          toast({
            title: "Error",
            description: "Selected planner not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Existing planner found:", existingPlanner);

        // Controllo di compatibilità della data del planner esistente
        if (toDateOnly(existingPlanner.date) !== dateForPlanner) {
            toast({
                title: "Error",
                description: "The selected planner is for a different date.",
                variant: "destructive",
            });
            return;
        }

        // Controllo compatibilità ticketId
        if ((selectedTicket && existingPlanner.ticketId !== selectedTicket.id) || (!selectedTicket && existingPlanner.ticketId !== null)) {
            toast({
                title: "Error",
                description: "The selected planner is not compatible with the current ticket selection (or lack thereof).",
                variant: "destructive",
            });
            return;
        }


        if (existingPlanner.showIds?.includes(show.id)) {
          console.warn("The show is already present in the selected planner.");
          toast({
            title: "Attention",
            description: "This show is already present in the selected planner",
            variant: "destructive",
          });
          return;
        }

        const updatedShowIds = [...(existingPlanner.showIds || []), show.id];
        console.log("New list of showIds:", updatedShowIds);

        const updatedPlannerData = {
          ...existingPlanner,
          showIds: updatedShowIds,
        };

        console.log("Complete updated planner data:", updatedPlannerData);

        await updatePlanner(existingPlanner.id, updatedPlannerData);

        toast({
          title: "Show added!",
          description: `"${show.title}" has been added to the planner "${existingPlanner.title}"`,
          className: "bg-white text-gray-900 border border-gray-200 shadow-md"
        });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error while adding show to planner:", error);
      toast({
        title: "Error",
        description: `Error during operation: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingPlanner(false);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setSelectedTicket(null)
    setPlannerOption("new")
    setSelectedExistingPlanner(null)
    setPlannerTitle("")
    setPlannerDescription("")
    setPlannerDate(selectedShow && selectedShow.date ? toDateOnly(selectedShow.date) : toDateOnly(new Date()));
  }

  // Handles drawer opening
  const handleDrawerOpen = (open) => {
    if (open) {
      // Reset form when drawer opens
      resetForm()
      // Set a default title based on the show name
      if (selectedShow) {
        setPlannerTitle(`Planner for ${selectedShow.title}`)
      }
    } else {
      onClose()
      resetForm()
    }
  }

  if (!selectedShow) return null

  const validTickets = getValidTicketsForShow(selectedShow);

  // Filter planners for "existing" option:
  // - If a ticket is selected, show planners associated with that ticket and date
  // - If no ticket is selected, show all planners for the current user that have no ticketId and match the plannerDate
  const filteredPlanners = planners.filter((p) => {
    const plannerHasTicket = p.ticketId !== null;
    const plannerDateMatch = toDateOnly(p.date) === plannerDate;
    const showDateMatch = selectedShow && toDateOnly(selectedShow.date) === toDateOnly(p.date); // For shows, date must always match.

    if (selectedTicket) {
      // If a ticket is selected, planner must match that ticket ID and date
      return p.ticketId === selectedTicket.id && toDateOnly(p.date) === toDateOnly(selectedTicket.validFor);
    } else {
      // If no ticket is selected, planner must NOT have a ticketId, match the plannerDate, and belong to the current user
      return !plannerHasTicket && plannerDateMatch && p.userId === userId;
    }
  });


  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6 mt-8">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-normal text-gray-900 mb-2">{selectedShow.title}</SheetTitle>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              Show
            </Badge>
          </div>
          <SheetDescription className="text-gray-600 mt-4">
            {selectedShow.description || "Show description not available."}
          </SheetDescription>
        </SheetHeader>

        {/* Show Info */}
        <div className="bg-teal-50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {selectedShow.date && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Date</span>
                </div>
                <span className=" text-teal-700">
                  {new Date(selectedShow.date).toLocaleDateString("en-US")}
                </span>
              </div>
            )}
            {selectedShow.time && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Time</span>
                </div>
                <span className=" text-teal-700">{selectedShow.time}</span>
              </div>
            )}
            {selectedShow.location && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Location</span>
                </div>
                <span className=" text-teal-700">{selectedShow.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Selection (Optional for planner functionality) */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Available tickets</h3>
          {validTickets.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Select a ticket to add this show to the planner, or proceed without one to add it for general interest:
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
                                Already used/booked (cannot be added to planner)
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
                You can still add this show to your planner as a general interest item for{" "}
                {selectedShow.date ? new Date(selectedShow.date).toLocaleDateString("en-US") : "a specific date"}.
              </p>
            </div>
          )}
        </div>

        {/* Planner Options */}
        {/* The planner section is always visible now, regardless of ticket selection */}
        <div className="mb-6">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Planner's option</h3>

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

            {filteredPlanners.length > 0 && ( // Usa filteredPlanners per determinare se mostrare l'opzione "existing"
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

          {/* Form for new planner */}
          {plannerOption === "new" && (
            <div className="mt-4 space-y-4">
                {/* L'input data è sempre lo stesso della data dello show.
                    Se selectedTicket è null, l'utente non può cambiarla per lo show,
                    perché uno show ha una data fissa.
                    Tuttavia, ho messo qui il plannerDate in modo che il resto del form
                    si basi su questa data, che viene sincronizzata con show.date.
                */}
                <div>
                    <label className="text-sm font-normal text-gray-700 mb-1 block">Planner Date</label>
                    <input
                        type="date"
                        value={plannerDate}
                        onChange={(e) => setPlannerDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                        readOnly // La data per uno show è fissa
                    />
                     <p className="text-xs text-gray-500 mt-1">
                        The planner date for a show is fixed to the show's date.
                    </p>
                </div>
              <div>
                <label className="text-sm font-normal text-gray-700 mb-1 block">Title</label>
                <input
                  type="text"
                  value={plannerTitle}
                  onChange={(e) => setPlannerTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                  placeholder="Ex. My show..."
                />
              </div>
              <div>
                <label className="text-sm font-normal text-gray-700 mb-1 block">Description (optional)</label>
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

          {/* Existing planner selection */}
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

          {/* Action Button for Planner */}
          <Button
            onClick={() => addShowToPlanner(selectedShow)}
            disabled={
              isCreatingPlanner ||
              (plannerOption === "new" && !plannerTitle.trim()) || // Title is always required for new planner
              (plannerOption === "existing" && !selectedExistingPlanner)
            }
            className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-2xl h-12 mt-4"
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
        </div>


        {/* Close Button */}
        <div className="flex gap-3 mt-8">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full h-12"
            >
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}