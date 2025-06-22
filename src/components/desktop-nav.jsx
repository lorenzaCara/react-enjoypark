import HeptapodLogo from "@/assets/HeptapodLogo"
import { useAttractions } from "@/contexts/AttractionsProvider"
import { useServices } from "@/contexts/ServicesProvider"
import { useShows } from "@/contexts/ShowsProvider"
import { cn } from "@/lib/utils"
import {
  Bell,
  Bookmark,
  ClipboardListIcon,
  Drama,
  HomeIcon, MapIcon,
  MapPinIcon,
  RollerCoaster,
  SearchIcon, Ticket,
  UserIcon
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

const suggestionsList = [
  { label: "Home", path: "/", icon: <HomeIcon className="w-4 h-4" /> },
  { label: "Map", path: "/map", icon: <MapIcon className="w-4 h-4" /> },
  { label: "Tickets", path: "/tickets", icon: <Ticket className="w-4 h-4" /> },
  { label: "Notifications", path: "/notifications", icon: <Bell className="w-4 h-4" /> },
  { label: "Planner", path: "/planners", icon: <ClipboardListIcon className="w-4 h-4" /> },
  { label: "Profile", path: "/profile", icon: <UserIcon className="w-4 h-4" /> },
  { label: "Attractions", path: "/attractions", icon: <RollerCoaster className="w-4 h-4" /> },
  { label: "Services", path: "/services", icon: <Bookmark className="w-4 h-4" /> },
  { label: "Shows", path: "/shows", icon: <Drama className="w-4 h-4" /> },
]

const synonymMap = {
  home: "/", casa: "/", mappa: "/map", map: "/map",
  ticket: "/tickets", tickets: "/tickets", biglietto: "/tickets", biglietti: "/tickets",
  notification: "/notifications", notifications: "/notifications", avvisi: "/notifications",
  planner: "/planners", pianificatore: "/planners",
  profile: "/profile", profilo: "/profile",
  attractions: "/attractions", attrazioni: "/attractions",
  services: "/services", servizi: "/services",
  shows: "/shows", events:"/shows", spettacoli: "/shows", eventi:"/shows"
}

export function DesktopHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [activeTab, setActiveTab] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const { attractions } = useAttractions()
  const { services } = useServices();
  const { shows } = useShows();

  useEffect(() => {
    const path = location.pathname
    setActiveTab(path === "/" ? "home" : path.split("/")[1])
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = searchQuery.trim().toLowerCase()
    const destination = synonymMap[trimmed]

    if (destination) {
      navigate(destination)
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    }

    setSearchQuery("")
    setFilteredSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
  
    const lowerValue = value.toLowerCase()
  
    const staticSuggestions = suggestionsList.filter((s) =>
      s.label.toLowerCase().includes(lowerValue)
    )
  
    const dynamicAttractions = attractions
      .filter((a) => a.name && a.name.toLowerCase().includes(lowerValue))
      .map((a) => ({
        label: a.name,
        path: `/attractions/${a.id}`, // o solo `/attractions`
        icon: <MapPinIcon className="w-4 h-4 text-teal-600" />
      }))
  
    const dynamicShows = shows
      .filter((s) => s.name && s.name.toLowerCase().includes(lowerValue))
      .map((s) => ({
        label: s.name,
        path: `/shows/${s.id}`,
        icon: <ClipboardListIcon className="w-4 h-4 text-teal-800" />
      }))
  
    const dynamicServices = services
      .filter((s) => s.name && s.name.toLowerCase().includes(lowerValue))
      .map((s) => ({
        label: s.name,
        path: `/services/${s.id}`,
        icon: <UserIcon className="w-4 h-4 text-teal-400" />
      }))
  
    setFilteredSuggestions([
      ...staticSuggestions,
      ...dynamicAttractions,
      ...dynamicShows,
      ...dynamicServices,
    ])
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        const selected = filteredSuggestions[selectedIndex]
        navigate(selected.path)
        setSearchQuery("")
        setFilteredSuggestions([])
        setSelectedIndex(-1)
        inputRef.current?.blur()
      } else {
        handleSearch(e)
      }
    }
  }

  return (
    <header className="hidden lg:block bg-white mx-4 rounded-3xl lg:mx-8">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center px-4">
              <HeptapodLogo width="50px" height="50px" color="#0d9488"/>
            </Link>
          </div>

          <div className="flex-1 max-w-3xl mx-8 relative">
            <form onSubmit={handleSearch}>
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Search attractions, tickets, profile..."
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 border"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-gray-500" />
              </div>
            </form>
            {searchQuery && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border mt-2 rounded-xl w-full shadow-lg max-h-64 overflow-y-auto">
                {filteredSuggestions.map((item, index) => (
                  <li
                    key={item.label}
                    onClick={() => {
                      navigate(item.path)
                      setSearchQuery("")
                      setFilteredSuggestions([])
                      setSelectedIndex(-1)
                      inputRef.current?.blur()
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-xl",
                      index === selectedIndex ? "bg-teal-100" : ""
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="flex items-center space-x-6">
            <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Home" to="/" isActive={activeTab === "home"} />
            <NavItem icon={<MapIcon className="w-5 h-5" />} label="Map" to="/map" isActive={activeTab === "map"} />
            <NavItem icon={<Ticket className="w-5 h-5" />} label="Tickets" to="/tickets" isActive={activeTab === "tickets"} />
            <NavItem icon={<UserIcon className="w-5 h-5" />} label="Profile" to="/profile" isActive={activeTab === "profile"} />
          </nav>
        </div>
      </div>
    </header>
  )
}

function NavItem({ icon, label, to, isActive }) {
  return (
    <Link to={to} className="flex items-center px-3 py-2 rounded-2xl hover:bg-gray-100 transition-colors">
      <div className={cn("flex items-center justify-center", isActive ? "text-teal-700" : "text-gray-500")}>
        {icon}
      </div>
      <span className={cn("ml-2 font-medium", isActive ? "text-teal-700" : "text-gray-700")}>{label}</span>
    </Link>
  )
}
