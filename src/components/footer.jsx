import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { Link } from "react-router"
import HeptapodAll from "@/assets/HeptapodAll"

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export function Footer() {
  const [openSection, setOpenSection] = useState(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("");

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null)
    } else {
      setOpenSection(section)
    }
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
  
    const result = emailSchema.safeParse({ email })
  
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
  
    setError("") // clear previous errors if any
    console.log("Subscribing email:", email)
    setEmail("")
  }
  

  return (
    <footer id="site-footer" className="bg-gray-50 pt-10 pb-6 mx-4 px-4 rounded-3xl lg:mx-8">
      <div className=" mx-auto px-4">
        {/* Newsletter Subscription - Full Width on all screens */}
        <div className="mb-10 lg:flex lg:justify-between lg:items-center">
          <HeptapodAll width="130px" height="130px" color="#0d9488"/>

          <form onSubmit={handleSubscribe} className="lg:max-w-md lg:w-full">
            <div className="relative flex-grow">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 h-12 rounded-full bg-white border-gray-200"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1 h-10 w-10 rounded-full bg-teal-700 hover:bg-teal-600 p-0 flex items-center justify-center"
                aria-label="Subscribe"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-wrap gap-3 mb-10">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-teal-700/15 flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5 text-gray-700" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-teal-700/15 flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5 text-gray-700" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-teal-700/15 flex items-center justify-center transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5 text-gray-700" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-teal-700/15 flex items-center justify-center transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="h-5 w-5 text-gray-700" />
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Footer Links - Mobile Accordion / Desktop Columns */}
        <div className="lg:hidden">
          {/* Mobile Accordion Layout */}
          <FooterSection title="Explore" isOpen={openSection === "explore"} onClick={() => toggleSection("explore")}>
            <ul className="space-y-2 py-3">
              <li>
                <Link to={"/attractions"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Attractions
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/shows"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Shows
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/services"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Services
                  </p>
                </Link>
              </li>
            </ul>
          </FooterSection>

          <FooterSection title="Visit" isOpen={openSection === "visit"} onClick={() => toggleSection("visit")}>
            <ul className="space-y-2 py-3">
              <li>
                <Link to={"/profile"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Plan your visit
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"contacts"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Opening hours
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/tickets"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Tickets
                  </p>
                </Link>
              </li>
            </ul>
          </FooterSection>

          <FooterSection title="Heptapod Park" isOpen={openSection === "about"} onClick={() => toggleSection("about")}>
            <ul className="space-y-2 py-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-teal-700">
                  About us
                </a>
              </li>
              <li>
                <Link to={"/map"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Map
                  </p>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-teal-700">
                  Partners
                </a>
              </li>
            </ul>
          </FooterSection>

          <FooterSection title="Information" isOpen={openSection === "info"} onClick={() => toggleSection("info")}>
            <ul className="space-y-2 py-3">
              <li>
                <Link to={"/contacts"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    FAQs
                  </p>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-teal-700">
                  Accessibility
                </a>
              </li>
              <li>
                <Link to={"/contacts"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Contact us
                  </p>
                </Link>
              </li>
            </ul>
          </FooterSection>
        </div>

        {/* Desktop Columns Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8 mb-12">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to={"/attractions"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Attractions
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/shows"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Shows
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/services"}>
                  <a href="#" className="text-gray-600 hover:text-teal-700">
                    Services
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Visit</h3>
            <ul className="space-y-3">
              <li>
                <Link to={"/profile"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Plan your visit
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/contacts"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Opening hours
                  </p>
                </Link>
              </li>
              <li>
                <Link to={"/tickets"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Tickets
                  </p>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Heptapod Park</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-teal-700">
                  About us
                </a>
              </li>
              <li>
                <Link to={"/map"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    Map
                  </p>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-teal-700">
                  Partners
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link to={"/contacts"}>
                  <p className="text-gray-600 hover:text-teal-700">
                    FAQs
                  </p>
                </Link>
              </li>
              <li>
                <p>
                  <a href="#" className="text-gray-600 hover:text-teal-700">
                    Accessibility
                  </a>
                </p>
              </li>
              <li>
                <Link to="contacts" className="text-gray-600 hover:text-teal-700">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="text-sm text-gray-500">
          <div className="flex justify-between flex-wrap gap-4 mb-2 mt-10">
            <div className="flex gap-4">
                <a href="#" className="hover:text-teal-600">
                  Terms of Use
                </a>
                <a href="#" className="hover:text-teal-600">
                  Privacy Policy
                </a>
            </div>
            <p>Copyright © {new Date().getFullYear()} Heptapod Park LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterSection({ title, children, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200">
      <button onClick={onClick} className="flex items-center justify-between w-full py-4 text-left">
        <span className="text-gray-900 font-medium">{title}</span>
        <ChevronDown className={cn("h-5 w-5 text-gray-500 transition-transform", isOpen && "transform rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-48" : "max-h-0")}>{children}</div>
    </div>
  )
}
