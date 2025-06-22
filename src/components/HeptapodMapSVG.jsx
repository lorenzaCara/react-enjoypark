import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  MapPin,
  Settings,
  Gamepad,
  RollerCoaster,
  Calendar,
  Clock,
  Star,
} from "lucide-react"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { useServices } from "@/contexts/ServicesProvider"
import { useShows } from "@/contexts/ShowsProvider"
import MappaSVG from "@/assets/mappa"
import MappaDettaglioSVG from "@/assets/zoom-area"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router"

export default function HeptapodMapSVG() {
  const mapRef = useRef(null)
  const drawerRef = useRef(null)
  const overlayRef = useRef(null)
  const mapContainerRef = useRef(null)

  // Provider data
  const { attractions, isLoading: attractionsLoading, error: attractionsError } = useAttractions()
  const { services, isLoading: servicesLoading, error: servicesError } = useServices()
  const { shows, isLoading: showsLoading, error: showsError } = useShows()

  // Map state
  const [currentView, setCurrentView] = useState("main")
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [highlightedItem, setHighlightedItem] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  const isLoading = attractionsLoading || servicesLoading || showsLoading
  const error = attractionsError || servicesError || showsError

  // Punti speciali 
  const specialPoints = [
    {
      id: "entrance",
      name: "Main entrance",
      type: "entrance",
      mapX: 50,
      mapY: 95,
    },
    {
      id: "stage1",
      name: "Neon Theatre",
      type: "stage",
      mapX: 35,
      mapY: 75,
      location: "Neon Theater", 
    },
    {
      id: "stage2",
      name: "Sky Dome Arena",
      type: "stage",
      mapX: 65,
      mapY: 65,
      location: "Sky Dome Arena",
    },
    {
      id: "stage3",
      name: "Drone Arena",
      type: "stage",
      mapX: 50,
      mapY: 80,
      location: "Drone Arena",
    },
    {
      id: "stage4",
      name: "Galactic Theater",
      type: "stage",
      mapX: 25,
      mapY: 60,
      location: "Galactic Theater", 
    },
  ]

  // Funzione per ottenere gli show per una location specifica
  const getShowsForLocation = (location) => {
    if (!shows || !location) return []
    return shows.filter(
      (show) => show.location && show.location.toLowerCase() === location.toLowerCase() && show.status === "SCHEDULED",
    )
  }

  // Funzione per formattare data e ora
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "Data non specificata"

    const date = new Date(dateString)
    const time = timeString ? new Date(timeString) : null

    const dateFormatted = date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const timeFormatted = time
      ? time.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : ""

    return timeFormatted ? `${dateFormatted} alle ${timeFormatted}` : dateFormatted
  }

  // Animazione per il cambio vista
  const animateViewTransition = (toView) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentView(toView)
        setScale(1)
        setPosition({ x: 0, y: 0 })
        setHighlightedItem(null)

        // Animazione di entrata
        gsap.fromTo(
          mapContainerRef.current,
          {
            scale: 0.8,
            opacity: 0,
            rotationY: toView === "detail" ? -15 : 15,
          },
          {
            scale: 1,
            opacity: 1,
            rotationY: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            onComplete: () => setIsTransitioning(false),
          },
        )
      },
    })

    // Animazione di uscita
    tl.to(mapContainerRef.current, {
      scale: 0.9,
      opacity: 0,
      rotationY: toView === "detail" ? 15 : -15,
      duration: 0.4,
      ease: "power2.in",
    })
  }

  // Animazione per il drawer
  const animateDrawerOpen = () => {
    if (!drawerRef.current || !overlayRef.current) return

    // Mostra l'overlay
    gsap.set(overlayRef.current, { display: "block" })

    const tl = gsap.timeline()

    // Animazione overlay
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })

    // Animazione drawer
    tl.fromTo(
      drawerRef.current,
      {
        y: "100%",
        scale: 0.95,
      },
      {
        y: "0%",
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      },
      "-=0.2",
    )
  }

  const animateDrawerClose = () => {
    if (!drawerRef.current || !overlayRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        setShowDrawer(false)
        setSelectedPoint(null)
        gsap.set(overlayRef.current, { display: "none" })
      },
    })

    // Animazione drawer
    tl.to(drawerRef.current, {
      y: "100%",
      scale: 0.95,
      duration: 0.4,
      ease: "power2.in",
    })

    // Animazione overlay
    tl.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.2")
  }

  // Effetto per animare l'apertura del drawer
  useEffect(() => {
    if (showDrawer && drawerRef.current) {
      animateDrawerOpen()
    }
  }, [showDrawer])

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (
      e.target.closest(".point-marker") ||
      e.target.closest("button") ||
      e.target.closest(".detail-transition-point") ||
      isTransitioning
    )
      return

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    setLastPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || isTransitioning) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Limit drag boundaries
    const maxOffset = 200
    const boundedX = Math.max(-maxOffset, Math.min(maxOffset, newX))
    const boundedY = Math.max(-maxOffset, Math.min(maxOffset, newY))

    setPosition({ x: boundedX, y: boundedY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (
      e.target.closest(".point-marker") ||
      e.target.closest("button") ||
      e.target.closest(".detail-transition-point") ||
      isTransitioning
    )
      return
    if (e.touches.length !== 1) return

    setIsDragging(true)
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    })
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1 || isTransitioning) return

    const newX = e.touches[0].clientX - dragStart.x
    const newY = e.touches[0].clientY - dragStart.y

    const maxOffset = 200
    const boundedX = Math.max(-maxOffset, Math.min(maxOffset, newX))
    const boundedY = Math.max(-maxOffset, Math.min(maxOffset, newY))

    setPosition({ x: boundedX, y: boundedY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom handlers
  const handleZoomIn = () => {
    if (isTransitioning) return
    setScale((prev) => Math.min(prev + 0.2, 2.5))
  }

  const handleZoomOut = () => {
    if (isTransitioning) return
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    if (isTransitioning) return
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Point click handler
  const handlePointClick = (point) => {
    if (isDragging || isTransitioning) return

    let selectedItem = null

    // Se è un punto speciale (stage), cerca gli show per quella location
    if (typeof point === "string") {
      const specialPoint = specialPoints.find((sp) => sp.id === point)
      if (specialPoint && specialPoint.type === "stage") {
        const stageShows = getShowsForLocation(specialPoint.location)
        selectedItem = {
          ...specialPoint,
          shows: stageShows,
          type: "stage",
        }
      } else {
        selectedItem = specialPoint
      }
    } else {
      // Trova l'attrazione o il servizio corrispondente
      const attraction = attractions?.find(a => a.id === point)
      const service = services?.find(s => s.id === point)

      if (service) {
        selectedItem = service
      } else if (attraction) {
        selectedItem = attraction
      }
    }

    if (selectedItem) {
      setSelectedPoint(selectedItem)
      setShowDrawer(true)
      setHighlightedItem(selectedItem.id)

      // Rimuovi l'evidenziazione dopo 3 secondi
      setTimeout(() => {
        setHighlightedItem(null)
      }, 3000)
    }
  }

  // View switching con animazioni
  const switchToDetailView = () => {
    if (isDragging || isTransitioning) return
    animateViewTransition("detail")
  }

  const switchToMainView = () => {
    if (isTransitioning) return
    animateViewTransition("main")
  }

  const closeDrawer = () => {
    animateDrawerClose()
  }

  // Highlight item on map and open drawer
  const handleItemClick = (item) => {
    if (isTransitioning) return

    // Se l'item è nella vista sbagliata, cambia vista
    if (item.category === "Kids" && currentView === "main") {
      animateViewTransition("detail")

      // Attendiamo un momento per il cambio vista prima di selezionare il punto
      setTimeout(() => {
        setSelectedPoint(item)
        setShowDrawer(true)
        setHighlightedItem(item.id)
      }, 800)
    } else if (item.category !== "Kids" && currentView === "detail") {
      animateViewTransition("main")

      // Attendiamo un momento per il cambio vista prima di selezionare il punto
      setTimeout(() => {
        setSelectedPoint(item)
        setShowDrawer(true)
        setHighlightedItem(item.id)
      }, 800)
    } else {
      // Stessa vista, apri subito il drawer
      setSelectedPoint(item)
      setShowDrawer(true)
      setHighlightedItem(item.id)
    }

    // Centra la mappa sull'item se ha coordinate
    if (item.x && item.y) {
      // Calcola la posizione per centrare l'item
      const targetX = (50 - item.x) * 2 // Inverti e scala
      const targetY = (50 - item.y) * 2 // Inverti e scala

      setPosition({
        x: Math.max(-200, Math.min(200, targetX)),
        y: Math.max(-200, Math.min(200, targetY)),
      })
      setScale(1.5) // Zoom in per evidenziare
    }

    // Rimuovi l'evidenziazione dopo 3 secondi
    setTimeout(() => {
      setHighlightedItem(null)
    }, 3000)
  }

  // Filter items based on current view
  const getVisibleAttractions = () => {
    if (!attractions) return []
    return currentView === "main"
      ? attractions.filter((a) => a.category !== "Kids")
      : attractions.filter((a) => a.category === "Kids")
  }

  const getVisibleServices = () => {
    if (!services) return []
    // I servizi sono sempre visibili nella vista principale
    return currentView === "main" ? services : []
  }

  // Transform alla mappa per gestire drag e zoom
  const mapStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.2s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">Loading error</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl">Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-12 lg:mx-4">
      <div className="relative w-full h-[80vh] bg-gradient-to-br from-gray-950 to-teal-900/50 rounded-3xl overflow-hidden mb-8">
        {/* Map Content */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div
            ref={mapRef}
            className="w-full h-full flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={mapStyle}
          >
            {currentView === "main" ? (
              <>
                <MappaSVG
                  className="w-full h-full object-contain pointer-events-auto"
                  attractions={attractions || []}
                  services={services || []}
                  onPointClick={handlePointClick}
                  selectedPointId={selectedPoint?.id}
                  highlightedPointId={highlightedItem}
                  kidsAreaX={230}  // coordinate x in px
                  kidsAreaY={100}  // coordinate y in px
                  switchToDetailView={switchToDetailView}
                />
          
              </>
            ) : (
              <MappaDettaglioSVG
                className="w-full h-full object-contain pointer-events-auto"
                attractions={attractions?.filter((a) => a.category === "Kids") || []}
                onPointClick={handlePointClick}
                selectedPointId={selectedPoint?.id}
                highlightedPointId={highlightedItem}
              />
            )}
          </div>
        </div>

        {/* Header for detail view */}
        {currentView === "detail" && (
          <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center">
            <Button
              onClick={switchToMainView}
              disabled={isTransitioning}
              variant="ghost"
              size="sm"
              className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 text-teal-700 hover:bg-teal-50 border border-teal-200 flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 border border-teal-200 shadow-lg">
              <span className="text-teal-700 font-medium">Kids area</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex gap-2 shadow-lg border border-teal-200">
            <Button
              onClick={handleZoomIn}
              disabled={isTransitioning}
              variant="ghost"
              size="sm"
              className="rounded-full h-10 w-10 p-0 text-teal-700 hover:bg-teal-50"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleZoomOut}
              disabled={isTransitioning}
              variant="ghost"
              size="sm"
              className="rounded-full h-10 w-10 p-0 text-teal-700 hover:bg-teal-50"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleReset}
              disabled={isTransitioning}
              variant="ghost"
              size="sm"
              className="rounded-full h-10 w-10 p-0 text-teal-700 hover:bg-teal-50"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Status indicators */}
        {currentView === "main" && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-teal-200 shadow-lg">
            <div className="text-teal-700 text-sm font-medium">
              Main view
            </div>
            <div className="text-teal-600 text-xs font-medium mt-1">Zoom: {Math.round(scale * 100)}%</div>
            <div className="text-gray-500 text-xs">Attractions: {attractions ? attractions.length : 0}</div>
            {currentView === "main" && (
              <div className="text-teal-600 text-xs mt-1">Click on the white point to see the kids area</div>
            )}
          </div>
        )}


        {/* Loading indicator per transizioni */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-3xl z-30">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Lista Attrazioni e Servizi - Versione Minimal */}
      <div className="bg-white rounded-3xl border border-white overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-light text-gray-900">
              {currentView === "main" ? "Attractions and services" : "Kids attractions"}
            </h3>
          </div>
        </div>

        <div className="p-4">
          {/* Attrazioni */}
          {getVisibleAttractions().length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 ">
                <MapPin className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm text-gray-700">Attractions {currentView === "detail" ? "for kids" : ""}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getVisibleAttractions().map((attraction) => (
                  <div
                    key={attraction.id}
                    onClick={() => handleItemClick(attraction)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 bg-gray-100/60 ${
                      highlightedItem === attraction.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className=" text-gray-900 text-sm truncate">{attraction.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Servizi */}
          {getVisibleServices().length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm text-gray-700">Services</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getVisibleServices().map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleItemClick(service)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 bg-gray-100/60 ${
                      highlightedItem === service.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className=" text-gray-900 text-sm truncate">{service.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Palchi/Stage */}
          {currentView === "main" && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm text-gray-700">Stages & Shows</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {specialPoints
                  .filter((point) => point.type === "stage")
                  .map((stage) => {
                    console.log("Stage:", stage); // Log stage data

                    const stageShows = getShowsForLocation(stage.location);

                    console.log("Stage location:", stage.location);
                    console.log("Shows found:", stageShows);

                    return (
                      <div
                        key={stage.id}
                        onClick={() => handlePointClick(stage.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 bg-gray-100/60 ${
                          highlightedItem === stage.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 text-sm truncate">{stage.name}</span>
                          {stageShows.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">
                              {stageShows.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {getVisibleAttractions().length === 0 && getVisibleServices().length === 0 && (
            <div className="text-center py-6">
              <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                {currentView === "detail"
                  ? "There are no attractions for kids in this view."
                  : "There are no attractions o services available in this view."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay per il drawer */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-60 z-50"
        style={{ display: "none" }}
        onClick={closeDrawer}
      />

      {/* Point Details Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50"
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
          transform: "translateY(100%)",
        }}
      >
        {selectedPoint && (
          <div className="px-6 py-6">
            {/* Drag indicator */}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-100">
                  <span className="text-2xl">
                    {selectedPoint.type === "stage" ? (
                      <Star className="text-teal-600" />
                    ) : !selectedPoint.category ? (
                      <Settings className="text-teal-600" />
                    ) : selectedPoint.category === "Kids" ? (
                      <Gamepad className="text-teal-700" />
                    ) : (
                      <RollerCoaster className="text-teal-700" />
                    )}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-light text-gray-900">{selectedPoint.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedPoint.type === "stage" ? "Stage" : selectedPoint.category || selectedPoint.type}
                  </span>
                </div>
              </div>
              <Button
                onClick={closeDrawer}
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {selectedPoint.description && (
                <div>
                  <h4 className="text-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600">{selectedPoint.description}</p>
                </div>
              )}

              {selectedPoint.location && (
                <div>
                  <h4 className="text-medium text-gray-900 mb-1">Position</h4>
                  <p className="text-gray-600">{selectedPoint.location}</p>
                </div>
              )}

              {selectedPoint.type === "stage" && selectedPoint.shows && selectedPoint.shows.length > 0 && (
                <div>
                  <h4 className="text-medium text-gray-900 mb-3">Shows in programma</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedPoint.shows.map((show, index) => (
                      <div key={index} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="mb-2">
                          <h5 className="font-medium text-gray-900 text-lg">{show.title}</h5>
                        </div>
                        {show.description && <p className="text-sm text-gray-600 mb-3">{show.description}</p>}
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            <span>
                              {new Date(show.date).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span>
                              <strong>Inizio:</strong>{" "}
                              {new Date(show.startTime).toLocaleTimeString("it-IT", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span>
                              <strong>Fine:</strong>{" "}
                              {new Date(show.endTime).toLocaleTimeString("it-IT", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPoint.type === "stage" && (!selectedPoint.shows || selectedPoint.shows.length === 0) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-700 text-sm">No scheduled show.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPoint.category && (
                  <div>
                    <h4 className="text-medium text-gray-900 mb-1">Category</h4>
                    <p className="text-gray-600 capitalize">{selectedPoint.category}</p>
                  </div>
                )}
                {selectedPoint.waitTime !== undefined && (
                  <div>
                    <h4 className="text-medium text-gray-700 mb-1">Waiting time</h4>
                    <p className="text-gray-600">
                      {selectedPoint.waitTime > 0 ? `${selectedPoint.waitTime} min` : "No waiting time"}
                    </p>
                  </div>
                )}
                {selectedPoint && selectedPoint.requiresBooking !== undefined && (
                  <div>
                    <h4 className="text-medium text-gray-700 mb-1">Requires booking</h4>
                    <p className="text-gray-600">
                      {selectedPoint.requiresBooking === true || selectedPoint.requiresBooking === "true"
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between gap-4">
                {selectedPoint.type !== "entrance" && (
                  <Link
                    to={
                      selectedPoint.type === "stage"
                        ? "/shows"
                        : selectedPoint.category === "Kids"
                          ? "/attractions#kids"
                          : selectedPoint.type
                            ? "/services"
                            : "/attractions"
                    }
                    className="flex-1"
                  >
                    <Button className="font-light w-full flex-1 rounded-full py-6 bg-teal-700 hover:bg-teal-600">
                      {selectedPoint.type === "stage" ? "See all shows" : "See more"}
                    </Button>
                  </Link>
                )}

                <Link to={"/tickets"} className="flex-1">
                  <Button variant="ghost" className="font-light w-full flex-1 rounded-full py-6 bg-gray-100">
                    + Buy your ticket
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
