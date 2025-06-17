import { useEffect, useRef } from "react"
import gsap from "gsap"
import HeptapodAll from "@/assets/HeptapodAll"

export default function HeptapodLoader({ onComplete }) {
  const loaderRef = useRef(null)
  const logoRef = useRef(null)
  const textRef = useRef(null)
  const progressRef = useRef(null)
  const progressBarRef = useRef(null)
  const particlesRef = useRef(null)
  const backgroundRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    // Set initial states immediately to avoid flash
    gsap.set(loaderRef.current, {
      opacity: 1,
      scale: 1,
    })
    gsap.set(backgroundRef.current, {
      background: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)",
    })
    gsap.set(logoRef.current, {
      scale: 0.5,
      opacity: 0,
      y: 30,
      transformOrigin: "center center",
    })
    gsap.set(textRef.current, {
      y: 20,
      opacity: 0,
    })
    gsap.set(progressBarRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    })
    gsap.set(progressRef.current, {
      opacity: 0,
      y: 15,
    })
    gsap.set(".particle", {
      scale: 0,
      opacity: 0,
    })
    gsap.set(glowRef.current, {
      scale: 0.8,
      opacity: 0,
    })

    const tl = gsap.timeline({
      onComplete: () => {
        // Transizione più fluida verso l'home
        gsap.to(loaderRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            if (onComplete) onComplete()
          },
        })
      },
    })

    // Background smooth entrance
    tl.to(
      backgroundRef.current,
      {
        background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0d9488 100%)",
        duration: 1.5,
        ease: "power2.inOut",
      },
      0,
    )

    // Glow effect smooth entrance
    tl.to(
      glowRef.current,
      {
        scale: 1,
        opacity: 0.2,
        duration: 1.2,
        ease: "power2.out",
      },
      0.3,
    )

    // Logo entrance più fluido
    tl.to(
      logoRef.current,
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: "power3.out",
      },
      0.5,
    )

    // Logo breathing effect più sottile
    tl.to(
      logoRef.current,
      {
        scale: 1.03,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
      },
      2.5,
    )

    // Text fade in più fluido
    tl.to(
      textRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      },
      1.8,
    )

    // Progress container fade in
    tl.to(
      progressRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      },
      2.5,
    )

    // Progress bar fill animation più fluida
    tl.to(
      progressBarRef.current,
      {
        scaleX: 1,
        duration: 3,
        ease: "power2.inOut",
      },
      3,
    )

    // Particles entrance più graduale
    tl.to(
      ".particle",
      {
        scale: 1,
        opacity: 0.3,
        duration: 0.8,
        stagger: {
          amount: 1.2,
          from: "random",
        },
        ease: "power3.out",
      },
      3.5,
    )

    // Particles floating animation più fluida
    tl.to(
        logoRef.current,
        {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        },
        6.6,
    )
    
    // Esegui la floating animation fuori dalla timeline
    gsap.to(".particle", {
        y: "random(-25, 25)",
        x: "random(-15, 15)",
        rotation: "random(-90, 90)",
        duration: 4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
        amount: 1.5,
        from: "random",
        },
    })
  

    // Final logo pulse più delicato
    tl.to(
      logoRef.current,
      {
        scale: 1.05,
        duration: 0.6,
        ease: "power2.out",
      },
      6,
    )

    tl.to(
      logoRef.current,
      {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      6.6,
    )

    // Cleanup function
    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={loaderRef} className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background - Solo Teal */}
      <div ref={backgroundRef} className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-700 to-teal-800" />

      {/* Glow Effect - Teal */}
      <div
        ref={glowRef}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(20, 184, 166, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="particle absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <div className="w-1 h-1 bg-teal-200/40 rounded-full shadow-lg" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        {/* Logo Container */}
        <div className="mb-12">
          <div ref={logoRef} className="w-full max-w-md mx-auto filter drop-shadow-2xl">
            <HeptapodAll color="#ffffff" width="100%" height="100%" />
          </div>
        </div>

        {/* Text */}
        <div ref={textRef} className="mb-12">
          <p className="text-teal-50 text-lg font-light tracking-wide">Welcome to the future of entertainment</p>
        </div>

        {/* Progress Section */}
        <div ref={progressRef} className="w-full max-w-sm mx-auto">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-teal-800/40 rounded-full overflow-hidden mb-4 shadow-inner backdrop-blur-sm">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-teal-200 via-white to-teal-100 rounded-full shadow-lg"
            />
          </div>

          {/* Loading Text */}
          <p className="text-teal-200/80 text-sm font-light tracking-wider">Loading your experience...</p>
        </div>

      </div>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 text-teal-300/50 text-xs">
          <div className="w-8 h-px bg-teal-400/30" />
          <span className="font-light tracking-widest">HEPTAPOD PARK</span>
          <div className="w-8 h-px bg-teal-400/30" />
        </div>
      </div>

      {/* Corner Decorations - Teal */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-teal-400/20 rounded-tl-2xl" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-teal-400/20 rounded-tr-2xl" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-teal-400/20 rounded-bl-2xl" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-teal-400/20 rounded-br-2xl" />
    </div>
  )
}
