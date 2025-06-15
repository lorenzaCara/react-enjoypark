import { useState, useEffect } from "react"
import HeptapodLoader from "./HeptapodLoader"

export default function AppLoader({ children }) {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const isAppLoaded = sessionStorage.getItem("appLoaded")

    if (!isAppLoaded) {
      // Mostra il loader solo al primo accesso assoluto
      setShowLoader(true)
    }
  }, [])

  const handleLoaderComplete = () => {
    // Marca che l'app è stata già caricata
    sessionStorage.setItem("appLoaded", "true")
    setShowLoader(false)
  }

  if (showLoader) {
    return <HeptapodLoader onComplete={handleLoaderComplete} />
  }

  return <>{children}</>
}
