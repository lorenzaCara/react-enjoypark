import { Outlet } from "react-router"
import ResponsiveHeader from "@/components/responsive-header"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

export default function App() {
  const [showMobileNav, setShowMobileNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const footerEl = document.getElementById("site-footer");
    
      if (!footerEl) return;
    
      const footerTop = footerEl.offsetTop;
      const windowHeight = window.innerHeight;
      const scrollBottom = currentScrollY + windowHeight;
    
      const nearFooter = scrollBottom >= footerTop - 50;
    
      if (nearFooter) {
        // Siamo vicini al footer: nascondi nav mobile
        setShowMobileNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Stiamo scrollando verso l'alto: mostra nav mobile
        setShowMobileNav(true);
      }
    
      setLastScrollY(currentScrollY);
    };    

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <div className="min-h-screen bg-gray-200/90 py-4">
      {/* Responsive Header (Desktop + Mobile) */}
      <ResponsiveHeader showMobileNav={showMobileNav} />

      <main className="mx-auto lg:pb-4">
        {/* Main Content */}
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
