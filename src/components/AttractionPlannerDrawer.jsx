import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { AlertCircle, MapPin, Clock, Plus, Ticket } from "lucide-react"
import { usePlanners } from "../contexts/PlannerContext" // <-- Assicurati che il percorso sia corretto

export default function AttractionPlannerDrawer({
  selectedAttraction,
  isDrawerOpen,
  onClose,
  purchasedTickets,
  planners, // Questo prop non sarà più necessario se usi usePlanners
  createPlanner, // Questo prop non sarà più necessario se usi usePlanners
  updatePlanner, // Questo prop non sarà più necessario se usi usePlanners
  toast,
}) {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerOption, setPlannerOption] = useState("new")
  const [selectedExistingPlanner, setSelectedExistingPlanner] = useState(null)
  const [plannerTitle, setPlannerTitle] = useState("")
  const [plannerDescription, setPlannerDescription] = useState("")
  const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)

  // Utilizza il contesto dei planner per accedere alle funzioni
  const {
    planners: allPlanners, // Rinomina per evitare conflitti con il prop 'planners'
    createPlanner: contextCreatePlanner, // Rinomina
    updatePlanner: contextUpdatePlanner, // Rinomina
    addAttractionToPlanner: contextAddAttractionToPlanner, // Nuova funzione
    addingItem, // Nuovo stato per l'aggiunta singola
    addItemError, // Nuovo errore per l'aggiunta singola
    creating, // Stato di creazione dal context (se vuoi usarlo)
    updating, // Stato di aggiornamento dal context (se vuoi usarlo)
  } = usePlanners();

  // Funzione per estrarre solo la data in formato YYYY-MM-DD in modo sicuro
  const toDateOnly = (dateStr) => {
    if (!dateStr) return null;
    // Estrae solo la parte della data "YYYY-MM-DD"
    return dateStr.split("T")[0];
  }

  // Funzione per creare un oggetto Date che rappresenti solo il giorno desiderato,
  // senza influenzare il fuso orario o l'ora del giorno.
  const createDateForDisplay = (dateStr) => {
    if (!dateStr) return null;
    const datePart = dateStr.split('T')[0]; // Es: "2025-06-18"
    const [year, month, day] = datePart.split('-').map(Number);
    // Crea una data locale al 00:00:00 del giorno specificato.
    // Month è 0-indexed in JS Date, quindi month - 1.
    return new Date(year, month - 1, day);
  };

  // Funzione per ottenere i biglietti validi per l'attrazione
  const getValidTicketsForAttraction = (attraction) => {
    if (!attraction) return []

    return (
      purchasedTickets?.filter((ticket) => {
        if (ticket.status !== "USED" || !ticket.validFor) return false

        // Verifica che il ticketType.attractions esista e contenga l'attrazione
        const hasAccess = ticket.ticketType?.attractions?.some((ta) => ta.attractionId === attraction.id); // Modificato in attractionId
        return hasAccess
      }) || []
    )
  }

  // Funzione per aggiungere l'attrazione al planner
  const addAttractionToPlanner = async (attraction) => {
    console.log("Attempting to add attraction to planner:", attraction)

    if (!selectedTicket) {
      console.warn("No ticket selected.")
      toast({
        title: "Error",
        description: "Please select a valid ticket",
        variant: "destructive",
      })
      return
    }

    const formattedDate = toDateOnly(selectedTicket.validFor)
    console.log("Formatted date of selected ticket:", formattedDate)

    setIsCreatingPlanner(true) // Questo stato locale potrebbe non essere più necessario se usi 'creating' e 'addingItem' dal context
    try {
      if (plannerOption === "new") {
        console.log("Creating a new planner.")
        const plannerData = {
          ticketId: selectedTicket.id,
          // userId: selectedTicket.userId, // userId è già preso dal middleware nel backend
          title: plannerTitle.trim() || `Planner for ${attraction.name}`,
          description: plannerDescription || `Planner for the attraction ${attraction.name}`,
          date: formattedDate,
          attractionIds: [attraction.id],
          showIds: [],
          serviceIds: [],
        }
        console.log("New planner data:", plannerData)

        await contextCreatePlanner(plannerData) // Usa la funzione dal context
        toast({
          title: "Planner created!",
          description: `"${attraction.name}" has been added to a new planner for ${new Date(formattedDate).toLocaleDateString("en-GB")}!`,
          className: "bg-white text-gray-900 border border-gray-200 shadow-md"
        })
      } else { // plannerOption === "existing"
        console.log("Adding attraction to an existing planner.")
        const existingPlanner = allPlanners.find((p) => p.id === Number(selectedExistingPlanner))
        if (!existingPlanner) {
          console.error("Selected planner not found. ID:", selectedExistingPlanner)
          toast({
            title: "Error",
            description: "Selected planner not found",
            variant: "destructive",
          })
          return
        }

        console.log("Existing planner found:", existingPlanner)

        // Controlla se l'attrazione è già presente nel planner esistente
        // Nota: existingPlanner.attractions è ora un array di oggetti completi, non solo ID
        if (existingPlanner.attractions?.some(a => a.id === attraction.id)) {
            console.warn("The attraction is already in the selected planner.")
            toast({
                title: "Warning",
                description: "This attraction is already in the selected planner",
                variant: "destructive",
            })
            return
        }

        // CHIAMATA AL NUOVO ENDPOINT DI AGGIUNTA SINGOLA
        await contextAddAttractionToPlanner(existingPlanner.id, attraction.id);

        toast({
          title: "Attraction added!",
          description: `"${attraction.name}" has been added to the planner "${existingPlanner.title}"`,
          className: "bg-white text-gray-900 border border-gray-200 shadow-md"
        })
      }

      resetForm()
      onClose()
    } catch (error) {
      console.error("Error while adding attraction to planner:", error)
      toast({
        title: "Error",
        description: `Something went wrong: ${error.message || addItemError || createError || updateError}`, // Migliorata gestione errore
        variant: "destructive",
      })
    } finally {
      setIsCreatingPlanner(false) // Puoi rimuovere questa linea se usi solo gli stati del context
    }
  }

  // Funzione per resettare il form
  const resetForm = () => {
    setSelectedTicket(null)
    setPlannerOption("new")
    setSelectedExistingPlanner(null)
    setPlannerTitle("")
    setPlannerDescription("")
  }

  // Gestisce l'apertura del drawer
  const handleDrawerOpen = (open) => {
    if (open) {
      // Reset form quando si apre il drawer
      resetForm()
      // Imposta un titolo predefinito basato sul nome dell'attrazione
      if (selectedAttraction) {
        setPlannerTitle(`Planner for ${selectedAttraction.name}`)
      }
    } else {
      onClose()
      resetForm()
    }
  }

  if (!selectedAttraction) return null

  // Determina se il bottone di submit deve essere disabilitato
  const isSubmitDisabled =
    (plannerOption === "new" && (!selectedTicket || !plannerTitle.trim())) ||
    (plannerOption === "existing" && (!selectedTicket || !selectedExistingPlanner)) ||
    isCreatingPlanner || // Vecchio stato locale, puoi usare 'creating' || 'addingItem' dal context
    creating || // Stato di creazione dal context
    addingItem; // Stato di aggiunta singola dal context


  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6 mt-8">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-normal text-gray-900 mb-2">{selectedAttraction.name}</SheetTitle>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              {selectedAttraction.category}
            </Badge>
          </div>
          <SheetDescription className="text-start text-gray-600 mt-4">
            {selectedAttraction.description || "Attraction description not available."}
          </SheetDescription>
        </SheetHeader>

        {/* Attraction Info */}
        <div className="bg-teal-50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>Waiting time</span>
              </div>
              <span className="text-teal-700">{selectedAttraction.waitTime} minutes</span>
            </div>
            {selectedAttraction.location && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Position</span>
                </div>
                <span className=" text-teal-700">{selectedAttraction.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Available tickets</h3>
          {(() => {
            const validTickets = getValidTicketsForAttraction(selectedAttraction)
            if (validTickets.length > 0) {
              return (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Select a ticket to add this attraction to the planner:
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
              )
            } else {
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Access not available</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Purchase a ticket that includes this attraction to gain access.
                  </p>
                </div>
              )
            }
          })()}
        </div>

        {/* Planner Options - mostrato solo se un biglietto è selezionato */}
        {selectedTicket && (
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
                  <div className="text-xs text-gray-500">Create a new planner for your ticket</div>
                </div>
              </label>

              {/* Mostra l'opzione per planner esistenti solo se ce ne sono */}
              {allPlanners.filter( // Usa allPlanners dal context
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

            {/* Form per nuovo planner */}
            {plannerOption === "new" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-normal text-gray-700 mb-1 block">Title</label>
                  <input
                    type="text"
                    value={plannerTitle}
                    onChange={(e) => setPlannerTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                    placeholder="Es. Planner for the day at the park..."
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

            {/* Selezione planner esistente */}
            {plannerOption === "existing" && (
              <div className="mt-4">
                <label className="text-sm font-normal text-gray-700 mb-2 block">Select an existing planner</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allPlanners // Usa allPlanners dal context
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {(() => {
            const validTickets = getValidTicketsForAttraction(selectedAttraction)
            if (validTickets.length > 0) {
              return (
                <Button
                  onClick={() => addAttractionToPlanner(selectedAttraction)}
                  disabled={isSubmitDisabled} // Usa il nuovo stato combinato
                  className="flex-1 bg-teal-700 hover:bg-teal-600 text-white rounded-full h-12 font-normal"
                >
                  {(isCreatingPlanner || creating || addingItem) ? ( // Usa tutti gli stati di caricamento
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
              )
            } else {
              return (
                <Button disabled className="flex-1 bg-gray-300 text-gray-500 rounded-full h-12 cursor-not-allowed">
                  <Ticket className="h-4 w-4 mr-2" />
                  Not available
                </Button>
              )
            }
          })()}
          <SheetClose asChild>
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full h-12">
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}