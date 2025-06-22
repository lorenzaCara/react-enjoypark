"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router"
import { HomeIcon, MapIcon, UserIcon, Ticket, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [activeTab, setActiveTab] = useState("")
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (path === "/") {
      setActiveTab("home")
    } else {
      const segment = path.split("/")[1]
      setActiveTab(segment)
    }
  }, [location.pathname]) // Dipendenza su location.pathname

  return (
    <div className="px-4 pb-4">
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-2">
        <div className="flex items-center justify-around">
          <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Home" to="/" isActive={activeTab === "home"} />
          <NavItem icon={<MapIcon className="w-5 h-5" />} label="Map" to="/map" isActive={activeTab === "map"} />
          <CenterButton />
          <NavItem
            icon={<Ticket className="w-5 h-5" />}
            label="Tickets"
            to="/tickets"
            isActive={activeTab === "tickets"}
          />
          <NavItem
            icon={<UserIcon className="w-5 h-5" />}
            label="Profile"
            to="/profile"
            isActive={activeTab === "profile"}
          />
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, to, isActive }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center w-16 py-1">
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
          isActive ? "text-teal-700" : "text-gray-500 hover:text-teal-600",
        )}
      >
        {icon}
      </div>
      <span className={cn("text-xs mt-1 transition-colors", isActive ? "text-teal-700 font-medium" : "text-gray-500")}>
        {label}
      </span>
    </Link>
  )
}

function CenterButton() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Link to="/mobile-tickets">
        <button className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-700 hover:bg-teal-600 text-white transition-colors">
          <QrCode className="w-6 h-6" />
        </button>
      </Link>
      <span className="text-xs mt-1 text-gray-500">&nbsp;</span>
    </div>
  )
}
