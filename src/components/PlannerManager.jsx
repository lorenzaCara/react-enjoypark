import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { usePlanners } from "@/contexts/PlannerProvider"
import { useShows } from "@/contexts/ShowsProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { useToast } from "@/hooks/use-toast"
import gsap from "gsap"
import {
  ArrowLeft,
  Calendar,
  Edit,
  HelpingHand,
  ListTodo,
  MapPin,
  Plus,
  Star,
  Ticket,
  Trash2
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"; // Usa react-router-dom se stai usando Link per la navigazione
import DeletePlannerDialog from "./Delete-planner-dialog"
import ManagePlannerDialog from "./Manage-planner-dialog"

export default function PlannerManager() {
  const { purchasedTickets, loading: ticketsLoading } = useTickets()
  const { shows, isLoading: showsLoading } = useShows()
  const { attractions, isLoading: attractionsLoading } = useAttractions()
  const { planners, loading: plannersLoading, createPlanner, updatePlanner, deletePlanner } = usePlanners()
  const { toast } = useToast()

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [plannerToManage, setPlannerToManage] = useState(null) // Useremo questo per tenere il planner da editare o null per la creazione
  const [isSaving, setIsSaving] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showManagePlannerDialog, setShowManagePlannerDialog] = useState(false) // Nuovo stato per controllare il dialog universale
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attractionIds: [],
    serviceIds: [],
    showIds: [],
  })

  const headerRef = useRef(null)
  const statsRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > 50 && !isFixed) {
        setIsFixed(true)
        gsap.fromTo(
          headerRef.current,
          { y: -50, paddingTop: getPaddingPx(false), paddingBottom: getPaddingPx(false) },
          { y: 0, paddingTop: 32, paddingBottom: 32, duration: 0.5, ease: "power2.out" },
        )
      } else if (scrollY <= 50 && isFixed) {
        setIsFixed(false)
        gsap.to(headerRef.current, {
          y: 0,
          paddingTop: getPaddingPx(false),
          paddingBottom: getPaddingPx(false),
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFixed])

  function getPaddingPx(isFixed) {
    if (isFixed) {
      return 32
    } else {
      if (window.innerWidth >= 1024) {
        return 80
      } else {
        return 48
      }
    }
  }

  useEffect(() => {
    // Animate entrance
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: "back.out(1.7)" },
      )
    }
  }, [])

  // Funzione per gestire le date in modo sicuro
  const toDateOnly = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toISOString().split("T")[0]
  }

  // Filtra i planner per il biglietto selezionato
  const ticketPlanners = selectedTicket ? planners.filter((p) => p.ticketId === selectedTicket.id) : []

  // Filtra gli spettacoli disponibili per la data del biglietto
  // Queste funzioni ora riceveranno il ticket come argomento dal dialog
  const getAvailableShows = (ticket) => {
    if (!ticket || !shows) return []
    const plannerDate = toDateOnly(ticket.validFor)
    const ticketShowIds = ticket.ticketType?.shows?.map(s => s.show.id) || []
    return shows.filter(show =>
      ticketShowIds.includes(show.id) &&
      toDateOnly(show.date) === plannerDate
    )
  }

  // Attrazioni disponibili
  const getAvailableAttractions = (ticket) => {
    if (!ticket || !attractions) return []
    const ticketAttractionIds = ticket.ticketType?.attractions?.map(a => a.attraction.id) || [];
    return attractions.filter(attraction => ticketAttractionIds.includes(attraction.id));
  }

  // Servizi disponibili
  const getAvailableServices = (ticket) => {
    if (!ticket || !attractions) return [] // Assuming attractions also contains services for now, adjust if services are separate
    const ticketServiceIds = ticket.ticketType?.services?.map(s => s.service.id) || [];
    return attractions.filter(service => ticketServiceIds.includes(service.id)); // Adjust this filter if 'services' is a different array
  }


  const resetFormAndDialogState = () => {
    setFormData({
      title: "",
      description: "",
      attractionIds: [],
      serviceIds: [],
      showIds: [],
    })
    setPlannerToManage(null) // Resetta il planner da gestire
    setShowManagePlannerDialog(false)
  }

  // Funzione unificata per salvare o aggiornare un planner
  const handleSaveOrUpdatePlanner = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const isEditMode = !!plannerToManage?.id; // Controlla se siamo in modalità modifica

      const plannerData = {
        ticketId: selectedTicket.id, // Il ticket è sempre quello selezionato
        title: formData.title,
        description: formData.description,
        date: toDateOnly(selectedTicket.validFor), // La data è sempre quella del ticket
        attractionIds: formData.attractionIds,
        serviceIds: formData.serviceIds,
        showIds: formData.showIds,
      }

      if (isEditMode) {
        await updatePlanner(plannerToManage.id, plannerData)
        toast({
          variant: "success",
          title: "Planner Updated",
          description: "The planner was successfully updated!",
          className: "bg-white text-gray-900 border border-white"
        })
      } else {
        await createPlanner(plannerData)
        toast({
          variant: "success",
          title: "Planner Created",
          description: "Your new planner was created successfully!",
          className: "bg-white text-gray-900 border border-white"
        })
      }
      resetFormAndDialogState() // Chiudi il dialog e resetta il form
    } catch (error) {
      console.error("Error saving/updating planner:", error);
      toast({
        title: "Error",
        description: error.message || `An error occurred while ${plannerToManage?.id ? "updating" : "creating"} the planner`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePlanner = async (plannerId) => {
    try {
      await deletePlanner(plannerId)
      toast({
        variant: "success",
        title: "Planner Deleted",
        description: "The planner was successfully deleted!",
        className: "bg-white text-gray-900 border border-white"
      })
      setShowDeleteDialog(false)
      setPlannerToManage(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error while deleting the planner",
        variant: "destructive",
      })
    }
  }

  // Apre il dialog per la creazione di un nuovo planner
  const openCreatePlannerDialog = () => {
    if (!selectedTicket) {
      toast({
        title: "Attention",
        description: "Please select a ticket first to create a planner.",
        variant: "destructive",
      });
      return;
    }
    setPlannerToManage(null); // Indicates we are creating a new planner
    setFormData({ // Initializes the form for creation
      title: `My planner for ${new Date(selectedTicket.validFor).toLocaleDateString('en-US')}`,
      description: "",
      attractionIds: [],
      serviceIds: [],
      showIds: [],
    });
    setShowManagePlannerDialog(true);
  };

  // Apre il dialog per la modifica di un planner esistente
  const openEditPlannerDialog = (planner) => {
    setPlannerToManage(planner); // Sets the planner to be edited

    // Initialize formData from the planner object, ensuring IDs are extracted from nested objects
    setFormData({
      title: planner.title || "",
      description: planner.description || "",
      attractionIds: planner.attractions?.map((a) => a.id) || [], // Correctly map objects to IDs, fallback to empty array
      serviceIds: planner.services?.map((s) => s.id) || [], // Correctly map objects to IDs, fallback to empty array
      showIds: planner.shows?.map((s) => s.id) || [], // Correctly map objects to IDs, fallback to empty array
    });
    setShowManagePlannerDialog(true);
  };


  const openDeleteDialog = (planner) => {
    setPlannerToManage(planner)
    setShowDeleteDialog(true)
  }

  const handleItemToggle = (itemId, type) => {
    const field = `${type}Ids`
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(itemId) ? prev[field].filter((id) => id !== itemId) : [...prev[field], itemId],
    }))
  }

  if (ticketsLoading || showsLoading || attractionsLoading || plannersLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading planners...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con effetto fisso - Stile ProfileSettings */}
      <div className={`mx-auto p-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed
              ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600"
              : "relative"
          } text-white transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-12 lg:py-20 rounded-3xl lg:mx-4"
          }`}
        >
          {/* Back button */}
          <div className="absolute left-6 top-6">
            <Link to="/profile">
              <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl border border-white/20 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <ListTodo className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`transition-all duration-700 font-light tracking-wider ${
                isFixed ? "lg:text-2xl md:text-xl text-lg" : "lg:text-5xl md:text-4xl text-3xl"
              }`}
            >
              My planners
            </h1>
            {!isFixed && (
              <p className="text-gray-100 text-lg mt-2 text-center max-w-2xl px-4">
                Plan your park visit perfectly and tailor it to your needs
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        {/* Enhanced Quick Stats */}
        <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto pb-2 mb-8 mx-auto px-4 pe-4 lg:mx-4">
          {/* Card 1 */}
          <div className="min-w-[350px] flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-6 text-left transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">
                {purchasedTickets.filter((t) => t.status === "USED").length}
              </div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Ticket className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-900">Used tickets</div>
            <div className="text-sm text-gray-500 mt-1">Ready to use</div>
          </div>

          {/* Card 2 */}
          <div className="min-w-[350px] flex-shrink-0 bg-white rounded-3xl border-2 border-gray-100 p-8 text-left transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-light text-gray-900 mb-2">
                {planners.length}
              </div>
              <div className="w-10 h-10 bg-teal-500/30 rounded-full flex items-center justify-center">
                <Ticket className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="text-gray-900">All planners</div>
            <div className="text-sm text-gray-500 mt-1">Planned visits</div>
          </div>
        </div>

        {/* Enhanced Ticket Selection */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden mb-8 mx-4 lg:mx-8">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-gray-900">Select ticket</h3>
                <p className="text-gray-600">Choose a ticket to create your custom planner</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <Select
              value={selectedTicket?.id || ""}
              onValueChange={(value) => {
                const ticket = purchasedTickets.find((t) => t.id === value)
                setSelectedTicket(ticket)
                resetFormAndDialogState() // Resetta il form e chiudi il dialog quando si cambia ticket
              }}
            >
              <SelectTrigger className="w-full h-14 rounded-2xl border-2 bg-gray-50 border-gray-50 hover:bg-teal-700/10 hover:border-teal-500/30 transition-colors">
                <SelectValue placeholder="Choose a ticket to get started..." />
              </SelectTrigger>
              <SelectContent>
                {purchasedTickets
                  .filter((t) => t.status === "USED")
                  .map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="">{ticket.ticketType?.name}</span>
                        <Badge className="ml-3 bg-teal-100 text-teal-700 hover:bg-teal-100">
                          {toDateOnly(ticket.validFor)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Planner Section */}
        {selectedTicket && (
          <div
            ref={cardRef}
            className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden mb-8 mx-4 lg:mx-8"
          >
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                    <ListTodo className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900">Your planners</h3>
                    <p className="text-gray-600">For {selectedTicket.ticketType?.name}</p>
                  </div>
                </div>
                <Button
                  onClick={openCreatePlannerDialog} // Chiama la nuova funzione per aprire il dialog in modalità creazione
                  className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-6 py-3 transition-all duration-300 font-light"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New planner
                </Button>
              </div>
            </div>

            {ticketPlanners.length > 0 ? (
              <div className="p-8">
                <div className="space-y-4">
                  {ticketPlanners.map((planner) => (
                    <div
                      key={planner.id}
                      className="group flex items-center gap-4 p-6 rounded-3xl bg-gray-50 hover:bg-teal-700/15 transition-all duration-300 border border-white"
                    >
                      <div className="w-12 h-12 bg-teal-500/30 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-teal-700" />
                      </div>
                      <div className="flex-1">
                        <div className=" text-gray-900 mb-2">{planner.title}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-4 flex-wrap">
                          {(planner.shows?.length || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-teal-500" />
                              {planner.shows.length} shows
                            </span>
                          )}
                          {(planner.attractions?.length || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-teal-500" />
                              {planner.attractions.length} attractions
                            </span>
                          )}
                          {(planner.services?.length || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <HelpingHand className="w-3 h-3 text-teal-500" />
                              {planner.services.length} services
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPlannerDialog(planner)} // Chiama la nuova funzione per aprire in modalità modifica
                          className="h-10 w-10 p-0 rounded-2xl border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(planner)}
                          className="h-10 w-10 p-0 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ListTodo className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-light text-gray-900 mb-3">No planners created</h4>
                <p className="text-gray-600 font-light mb-6 max-w-md mx-auto">
                  Create your first planner to better organize your park visit
                </p>
                <Button
                  onClick={openCreatePlannerDialog} // Chiama la nuova funzione per aprire il dialog in modalità creazione
                  className="bg-teal-700 hover:bg-teal-600 text-white rounded-2xl px-8 py-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your planner
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!selectedTicket && (
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 text-center mx-4 lg:mx-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-xl font-light text-gray-900 mb-3">Select a ticket to get started</h4>
            <p className="text-gray-600 font-light max-w-md mx-auto">
              Choose one of your purchased tickets to create personalized planners and organize your visit
            </p>
          </div>
        )}

        {/* ManagePlannerDialog riutilizzato per creazione e modifica */}
        <ManagePlannerDialog
          open={showManagePlannerDialog}
          onOpenChange={setShowManagePlannerDialog} // Permette al dialog di gestire la chiusura
          initialData={plannerToManage} // Sarà null per la creazione, o l'oggetto planner per la modifica
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
          onSave={handleSaveOrUpdatePlanner} // La funzione unificata
          onCancel={resetFormAndDialogState} // Resetta e chiudi il dialog
          handleItemToggle={handleItemToggle}
          getAvailableShows={getAvailableShows}
          getAvailableAttractions={getAvailableAttractions}
          getAvailableServices={getAvailableServices}
          plannerTicket={selectedTicket} // Passa il ticket attualmente selezionato
        />

        {/* Dialog per Conferma Eliminazione */}
        <DeletePlannerDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          selectedPlanner={plannerToManage} // Usa plannerToManage per la conferma eliminazione
          onDelete={handleDeletePlanner}
          onCancel={() => {
            setShowDeleteDialog(false)
            setPlannerToManage(null)
          }}
        />
      </div>
    </div>
  )
}