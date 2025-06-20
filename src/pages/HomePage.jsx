import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { useServices } from "@/contexts/ServicesProvider"
import { useShows } from "@/contexts/ShowsProvider"
import { useTickets } from "@/contexts/TicketsProvider"
import { Link, useNavigate } from "react-router"
import { useRef, useState } from 'react'; 

export default function HomePage() {
  const navigate = useNavigate()

  // Provider hooks
  const { attractions, isLoading: attractionsLoading, error: attractionsError } = useAttractions()
  const { shows, isLoading: showsLoading, error: showsError } = useShows()
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets()
  const { services, isLoading: servicesLoading, error: servicesError } = useServices()

  // Filtra i dati per la homepage
  const topAttractions = attractions?.slice(0, 3) || []
  const todayShows = shows?.slice(0, 4) || []
  const topServices = services?.slice(0, 4) || []
  const featuredTickets = tickets?.slice(0, 4) || []

  const imageMap = {
    KID: "/img/kid-ticket.jpg",
    "FAST ACCESS": "/img/fastaccess-ticket.jpg",
    STANDARD: "/img/standard-ticket.jpg",
    VIP: "/img/vip-ticket.jpg",
  };

  // State and ref for draggable tickets
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      scrollContainerRef.current.style.cursor = 'grabbing'; // Visual feedback for dragging
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return; // Only drag if the mouse is pressed
    e.preventDefault(); // Prevent text selection and other default browser behaviors
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // Adjust scroll speed (e.g., 1.5 for a bit faster)
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'; // Reset cursor
    }
  };

  const handleMouseLeave = () => {
    // Important: if the mouse leaves the element while dragging, stop dragging
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'; // Reset cursor
    }
  };


  // Loading state
  if (attractionsLoading || showsLoading || ticketsLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (attractionsError || showsError || ticketsError || servicesError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto text-center">
          <h3 className="text-lg mb-2">Loading error</h3>
          <p className="mb-4">An error occurred while loading the data</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl">Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative h-screen rounded-2xl flex items-center justify-center overflow-hidden lg:mx-4">
        <div
          className="absolute m-4 rounded-3xl inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/img/homepage.jpg')" }}
        >
          <div className="absolute rounded-3xl inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 opacity-40"></div> {/* Riduci l'opacità del gradiente se l'immagine è molto scura */}
          <div className="absolute rounded-3xl inset-0 bg-black/20"></div>
          {/* Pattern decorativo - potresti volerli rimuovere o ridurre l'opacità se si scontrano con l'immagine */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-teal-300 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-wider mb-8">
            Where the
            <br />
            <span className="">future lives</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light px-4">
            Welcome to Heptapod Park, where imagination meets technology and every moment becomes an adventure beyond the boundaries of reality.
          </p>

          <Link to={"/tickets"} className="text-gray-900 dark:text-gray-100">
            <Button
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-12 py-6 text-medium font-normal"
            >
              Discover more
            </Button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 ms-[-10px] animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center items-start">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse "></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-4 lg:mx-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
            The Park of the Future welcomes people of all ages, curious minds, and adventurous spirits. Come take a journey through possible futures and bring that knowledge back to the present.
          </p>
        </div>
      </section>

      {/* Expand Your Experience - Due card affiancate */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900 mx-4 rounded-3xl lg:mx-8">
        <div className=" mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 mb-4">
              Expand your experience
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-0 lg:p-4 md:p-4">
            {/* Colonna di sinistra - senza margine extra */}
            <div className="flex flex-col gap-8">
              {/* Card 1 - Attrazioni */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-[40rem] cursor-pointer">
                {/* Sfondo immagine */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/img/attractions.jpg')" }}
                />
                {/* Overlay gradiente nero trasparente per contrasto */}
                <div className="absolute inset-0 bg-black/40"></div>
                <CardContent className="relative z-10 h-full flex flex-col justify-between p-8 py-14 text-white text-center">
                  <div>
                    <h3 className="text-3xl font-light mb-4">Explore now</h3>
                    <p className="text-lg text-gray-200 mb-6">
                      Discover {attractions?.length || 0}+ futuristic attractions that defy the laws of physics and imagination.
                    </p>
                  </div>
                  <Link to='/attractions' className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-white dark:text-white hover:bg-white text-teal-800 rounded-full px-8 py-3 mx-auto"
                    >
                      Explore attractions
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Card 3 - Esplorazioni */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-[40rem] cursor-pointer">
                {/* Sfondo immagine */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/img/map.jpg')" }}
                />
                {/* Overlay gradiente nero trasparente per contrasto */}
                <div className="absolute inset-0 bg-black/40"></div>
                <CardContent className="relative z-10 h-full flex flex-col justify-between p-8 py-14 text-white text-center">
                  <div>
                    <h3 className="text-3xl font-light mb-4">Virtual Discovery</h3>
                    <p className="text-lg text-gray-200 mb-6">
                      Immerse yourself in digital environments that redefine the idea of exploration.
                    </p>
                  </div>
                  <Link to='/map' className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-white dark:text-white hover:bg-white text-teal-800 rounded-full px-8 py-3 mx-auto"
                    >
                      Explore map
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Colonna di destra - inizia più in basso */}
            <div className="flex flex-col gap-8 lg:mt-12">
              {/* Card 2 - Spettacoli */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-[40rem] cursor-pointer">
                {/* Sfondo immagine */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/img/shows.jpg')" }}
                />
                {/* Overlay gradiente nero trasparente per contrasto */}
                <div className="absolute inset-0 bg-black/40"></div>
                <CardContent className="relative z-10 h-full flex flex-col justify-between p-8 py-14 text-white text-center">
                  <div>
                    <h3 className="text-3xl font-light mb-4">Tomorrow Today</h3>
                    <p className="text-lg text-gray-200 mb-6">
                      Experience shows that transform reality through holograms, augmented reality, and interactive performances.
                    </p>
                  </div>
                  <Link to='/shows' className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-white dark:text-white hover:bg-white text-teal-800 rounded-full px-8 py-3 mx-auto"
                    >
                      Explore shows
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Card 4 - Esperienze */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-[40rem] cursor-pointer">
                {/* Sfondo immagine */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/img/services.jpg')" }}
                />
                {/* Overlay gradiente nero trasparente per contrasto */}
                <div className="absolute inset-0 bg-black/40"></div>

                <CardContent className="relative z-10 h-full flex flex-col justify-between p-8 py-14 text-white text-center">
                  <div>
                    <h3 className="text-3xl font-light mb-4">Immersive Worlds</h3>
                    <p className="text-lg text-gray-200 mb-6">
                      Sensory experiences that break down the boundary between real and virtual.
                    </p>
                  </div>
                  <Link to='/services' className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-white dark:text-white hover:bg-white text-teal-800 rounded-full px-8 py-3 mx-auto"
                    >
                      Explore services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </section>

      {/* Servizi e Biglietti */}
      <section className="py-24 ps-4 lg:ms-4">
        <div className="mx-auto">
          <div className="text-center pb-24">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100">
              Plan your visit
            </h2>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-16">
            {/* Colonna Sinistra: Orari (mostrata sotto su mobile) */}
            <div className="space-y-8">
              <Card className="bg-white rounded-3xl border-2 border-transparent shadow-none transition-all duration-500 h-[27rem] me-4">
                <CardContent className="p-8 py-12 flex flex-col items-center justify-center h-full"> {/* Increased padding and added flex centering */}
                  <h3 className="text-3xl font-light mb-8 text-center text-gray-900 dark:text-gray-100">Opening hours</h3> {/* Adjusted margin-bottom */}
                  <ul className="text-gray-600 dark:text-gray-400 space-y-4 text-center"> {/* Increased space-y */}
                    <li className="text-lg">
                      <span className=" text-gray-800 dark:text-gray-200 block mb-1">Monday:</span> Closed
                    </li>
                    <li className="text-lg">
                      <span className=" text-gray-800 dark:text-gray-200 block mb-1">Tuesday - Friday:</span> 10:00 AM - 6:00 PM
                    </li>
                    <li className="text-lg">
                      <span className=" text-gray-800 dark:text-gray-200 block mb-1">Weekends:</span> 9:00 AM - 8:00 PM
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Colonna Destra: Biglietti (mostrata sopra su mobile) */}
            <div
              className="overflow-x-auto scrollbar-hide col-span-2 px-0 cursor-grab"
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave} 
            >
              <div className="flex gap-4 min-w-max scrollbar-hide">
                {featuredTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="flex flex-col w-[20rem] min-w-[10rem] sm:min-w-[24rem] md:min-w-[26rem] h-[27rem] rounded-3xl border-white overflow-hidden shadow-none"
                  >
                    <CardContent className="flex flex-col justify-between h-full p-6">
                      <div>
                        <img
                          src={imageMap[ticket.name]}
                          alt={ticket.name}
                          className="object-cover w-full rounded-2xl mb-6 h-48"
                        />
                        <h4 className="text-xl text-gray-800 lowercase dark:text-gray-100 mb-1">{ticket.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          {ticket.description || "Accesso completo al parco"}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-teal-600 mb-4 mt-auto">
                        €{ticket.price}
                      </div>
                      <Button
                        onClick={() => navigate("/tickets")}
                        className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-full py-5"
                      >
                        Book now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}