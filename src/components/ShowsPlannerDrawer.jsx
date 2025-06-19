import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { AlertCircle, MapPin, Clock, Calendar, Plus, Ticket } from "lucide-react"
import { usePlanners } from "@/contexts/PlannerProvider"

export default function ShowsPlannerDrawer({
  selectedShow,
  isDrawerOpen,
  onClose,
  purchasedTickets,
  planners,
  createPlanner,
  updatePlanner,
  toast,
}) {
  const { addShowToPlanner: addSingleShowToPlanner } = usePlanners()
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerOption, setPlannerOption] = useState("new")
  const [selectedExistingPlanner, setSelectedExistingPlanner] = useState(null)
  const [plannerTitle, setPlannerTitle] = useState("")
  const [plannerDescription, setPlannerDescription] = useState("")
  const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)

  const toDateOnly = (dateStr) => {
        if (!dateStr) return null;
        // Estrae solo la parte della data "YYYY-MM-DD"
         return dateStr.split("T")[0];
      }

    const createDateForDisplay = (dateStr) => {
        if (!dateStr) return null;
        const datePart = dateStr.split('T')[0]; // Es: "2025-06-18"
        const [year, month, day] = datePart.split('-').map(Number);
        // Crea una data locale al 00:00:00 del giorno specificato.
        // Month è 0-indexed in JS Date, quindi month - 1.
        return new Date(year, month - 1, day);
      };

  // Function to get valid tickets for the show
  const getValidTicketsForShow = (show) => {
    if (!show.date) return []

    const showDate = toDateOnly(show.date)

    return (
      purchasedTickets?.filter((ticket) => {
        if (ticket.status !== "ACTIVE" || !ticket.validFor) return false

        const ticketDate = toDateOnly(ticket.validFor)
        const hasAccess = ticket.ticketType.shows.some((tsShow) => tsShow.show.id === show.id)

        return hasAccess && ticketDate === showDate
      }) || []
    )
  }

  // Function to add the show to the planner
  const addShowToPlanner = async (show) => {
    console.log("Attempting to add show to planner:", show);

    if (!selectedTicket) {
      console.warn("No ticket selected.");
      toast({
        title: "Error",
        description: "Please select a valid ticket",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = toDateOnly(selectedTicket.validFor);
    console.log("Formatted date of selected ticket:", formattedDate);

    setIsCreatingPlanner(true);
    try {
      if (plannerOption === "new") {
        console.log("Creating a new planner.");
        const plannerData = {
          ticketId: selectedTicket.id,
          userId: selectedTicket.userId,
          title: plannerTitle.trim() || `Planner for ${show.title}`,
          description: plannerDescription || `Planner for the show ${show.title}`,
          date: formattedDate,
          showIds: [show.id],
          attractionIds: [],
          serviceIds: [],
        };
        console.log("New planner data:", plannerData);

        await createPlanner(plannerData);
        toast({
          title: "Planner created!",
          description: `"${show.title}" has been added to a new planner for ${new Date(formattedDate).toLocaleDateString("en-US")}!`,
        });
      } else {
        const existingPlanner = planners.find((p) => p.id === Number(selectedExistingPlanner));
        if (!existingPlanner) {
          toast({
            title: "Error",
            description: "Selected planner not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Existing planner found:", existingPlanner);

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
        });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error while adding show to planner:", error);
      toast({
        title: "Error",
        description: `Error during operation: ${error.message}`,
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

        {/* Ticket Selection */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg font-normal text-gray-900 mb-3">Available tickets</h3>
          {(() => {
            const validTickets = getValidTicketsForShow(selectedShow)
            if (validTickets.length > 0) {
              return (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Select a ticket to add this show to the planner:
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
                    <span className="font-normal">Access not available</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {selectedShow.date
                      ? `You need a valid ticket for ${new Date(selectedShow.date).toLocaleDateString("en-US")} that includes this show.`
                      : "Purchase a ticket that includes this show to gain access."}
                  </p>
                </div>
              )
            }
          })()}
        </div>

        {/* Planner Options - shown only if a ticket is selected */}
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

              {/* Show option for existing planners only if there are any */}
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

            {/* Form for new planner */}
            {plannerOption === "new" && (
              <div className="mt-4 space-y-4">
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {(() => {
            const validTickets = getValidTicketsForShow(selectedShow)
            if (validTickets.length > 0) {
              return (
                <Button
                  onClick={() => addShowToPlanner(selectedShow)}
                  disabled={
                    isCreatingPlanner || !selectedTicket || (plannerOption === "existing" && !selectedExistingPlanner)
                  }
                  className="flex-1 bg-teal-700 hover:bg-teal-600 text-white rounded-full h-12"
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