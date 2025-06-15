"use client"

import gsap from "gsap"
import { useRef, useEffect } from "react"

const FuturisticParkSVG = () => {
  const svgRef = useRef(null)

  // This component is set up for GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ruota panoramica completa (cerchio + raggi + cabine)
      // Rotation: -360 for clockwise rotation (negative values rotate clockwise in GSAP)
      gsap.to("#ferris-wheel", {
        rotation: -360,
        transformOrigin: "", // centro esatto della ruota
        duration: 10,
        repeat: -1,
        ease: "none",
      })

      // Navicelle volanti
      gsap.to("#flying-vehicles .flying-vehicle", {
        y: -10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 2,
        stagger: {
          each: 0.5,
          repeat: -1,
          yoyo: true,
        },
      })

      // Animate roller coaster cars
      gsap.to(".coaster-car", {
        duration: 8,
        motionPath: {
          path: ".coaster-track",
          align: ".coaster-track",
          autoRotate: true,
          alignOrigin: [0.5, 0.5],
        },
        repeat: -1,
        ease: "none",
        stagger: 0.2,
      })

      // Animate monorail
      gsap.to(".monorail-train", {
        duration: 15,
        x: 400,
        repeat: -1,
        repeatDelay: 1,
        yoyo: true,
        ease: "power1.inOut",
      })

      // Animate holograms
      gsap.to(".hologram", {
        duration: 2,
        opacity: 0.3,
        scale: 1.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5,
      })

      // Animate floating platforms
      gsap.to(".platform", {
        duration: 3,
        y: "-=10",
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.8,
      })

      // Animate tower light
      gsap.to(".tower-light", {
        duration: 1.5,
        opacity: 0.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      })
    }, svgRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="w-full h-full" ref={svgRef}>
      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background Elements */}
        <circle cx="400" cy="300" r="180" fill="rgba(255,255,255,0.03)" />
        <circle cx="400" cy="300" r="120" fill="rgba(255,255,255,0.05)" />

        {/* Futuristic City Skyline */}
        <g id="city-skyline">
          <path
            d="M50 400 L50 350 L70 350 L70 320 L90 320 L90 350 L110 350 L110 300 L130 300 L130 350 L150 350 L150 330 L170 330 L170 400 Z"
            fill="rgba(255,255,255,0.2)"
            className="city-building"
          />
          <path
            d="M180 400 L180 320 L200 300 L220 320 L220 400 Z"
            fill="rgba(255,255,255,0.15)"
            className="city-building"
          />
          <path
            d="M230 400 L230 280 L250 280 L250 320 L270 320 L270 280 L290 280 L290 400 Z"
            fill="rgba(255,255,255,0.25)"
            className="city-building"
          />
          <path
            d="M300 400 L300 250 L320 230 L340 250 L340 400 Z"
            fill="rgba(255,255,255,0.2)"
            className="city-building"
          />
          <path
            d="M350 400 L350 270 L370 270 L370 240 L390 240 L390 270 L410 270 L410 400 Z"
            fill="rgba(255,255,255,0.15)"
            className="city-building"
          />
          <path
            d="M420 400 L420 260 L440 240 L460 260 L460 400 Z"
            fill="rgba(255,255,255,0.25)"
            className="city-building"
          />
          <path
            d="M470 400 L470 290 L490 290 L490 260 L510 260 L510 290 L530 290 L530 400 Z"
            fill="rgba(255,255,255,0.2)"
            className="city-building"
          />
          <path
            d="M540 400 L540 270 L560 250 L580 270 L580 400 Z"
            fill="rgba(255,255,255,0.15)"
            className="city-building"
          />
          <path
            d="M590 400 L590 280 L610 280 L610 250 L630 250 L630 280 L650 280 L650 400 Z"
            fill="rgba(255,255,255,0.25)"
            className="city-building"
          />
          <path
            d="M660 400 L660 300 L680 280 L700 300 L700 400 Z"
            fill="rgba(255,255,255,0.2)"
            className="city-building"
          />
          <path
            d="M710 400 L710 320 L730 320 L730 290 L750 290 L750 320 L770 320 L770 400 Z"
            fill="rgba(255,255,255,0.15)"
            className="city-building"
          />
        </g>

        {/* Main Futuristic Tower */}
        <g id="main-tower">
          <path d="M380 400 L380 150 L420 150 L420 400 Z" fill="rgba(255,255,255,0.3)" className="tower-base" />
          <circle cx="400" cy="130" r="30" fill="rgba(255,255,255,0.4)" className="tower-top" />
          <path d="M390 130 L390 100 L410 100 L410 130 Z" fill="rgba(255,255,255,0.5)" className="tower-antenna" />
          <circle cx="400" cy="90" r="5" fill="rgba(255,255,255,0.6)" className="tower-light" />

          {/* Tower Windows */}
          <rect x="390" y="170" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="190" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="210" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="230" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="250" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="270" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="290" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="310" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="330" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="350" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
          <rect x="390" y="370" width="20" height="10" fill="rgba(255,255,255,0.6)" className="tower-window" />
        </g>

        {/* Futuristic Roller Coaster */}
        <g id="roller-coaster">
          <path
            d="M200 250 C250 200, 300 300, 350 250 C400 200, 450 300, 500 250 C550 200, 600 300, 650 250"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="4"
            fill="none"
            className="coaster-track"
          />
          <circle cx="250" cy="225" r="8" fill="rgba(255,255,255,0.8)" className="coaster-car" />
          <circle cx="270" cy="235" r="8" fill="rgba(255,255,255,0.8)" className="coaster-car" />
          <circle cx="290" cy="260" r="8" fill="rgba(255,255,255,0.8)" className="coaster-car" />
        </g>

        {/* Futuristic Flying Vehicles */}
        <g id="flying-vehicles">
          <path d="M150 150 L170 140 L190 150 L170 160 Z" fill="rgba(255,255,255,0.6)" className="flying-vehicle" />
          <path d="M550 180 L570 170 L590 180 L570 190 Z" fill="rgba(255,255,255,0.6)" className="flying-vehicle" />
          <path d="M300 100 L320 90 L340 100 L320 110 Z" fill="rgba(255,255,255,0.6)" className="flying-vehicle" />
        </g>

        {/* Futuristic Ferris Wheel */}
        <g id="ferris-wheel">
          <circle
            cx="600"
            cy="200"
            r="50"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="3"
            fill="none"
            className="wheel"
          />
          <circle cx="600" cy="200" r="5" fill="rgba(255,255,255,0.7)" className="wheel-center" />

          {/* Spokes */}
          <line
            x1="600"
            y1="200"
            x2="600"
            y2="150"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="600"
            y2="250"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="550"
            y2="200"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="650"
            y2="200"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="565"
            y2="165"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="635"
            y2="165"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="565"
            y2="235"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />
          <line
            x1="600"
            y1="200"
            x2="635"
            y2="235"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            className="wheel-spoke"
          />

          {/* Cabins */}
          <circle cx="600" cy="150" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="600" cy="250" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="550" cy="200" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="650" cy="200" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="565" cy="165" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="635" cy="165" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="565" cy="235" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
          <circle cx="635" cy="235" r="6" fill="rgba(255,255,255,0.8)" className="wheel-cabin" />
        </g>

        {/* Futuristic Monorail */}
        <g id="monorail">
          <path
            d="M100 320 C200 300, 300 340, 400 320 C500 300, 600 340, 700 320"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3"
            fill="none"
            className="monorail-track"
          />
          <rect x="320" y="310" width="60" height="15" rx="7" fill="rgba(255,255,255,0.7)" className="monorail-train" />
        </g>

        {/* Holographic Projections */}
        <g id="holograms">
          <circle
            cx="200"
            cy="200"
            r="15"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
            strokeDasharray="3,3"
            fill="none"
            className="hologram"
          />
          <circle
            cx="500"
            cy="150"
            r="10"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
            strokeDasharray="3,3"
            fill="none"
            className="hologram"
          />
          <circle
            cx="350"
            cy="180"
            r="12"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
            strokeDasharray="3,3"
            fill="none"
            className="hologram"
          />
        </g>

        {/* Floating Platforms */}
        <g id="floating-platforms">
          <ellipse cx="150" cy="280" rx="30" ry="10" fill="rgba(255,255,255,0.3)" className="platform" />
          <ellipse cx="450" cy="220" rx="25" ry="8" fill="rgba(255,255,255,0.3)" className="platform" />
          <ellipse cx="650" cy="180" rx="20" ry="7" fill="rgba(255,255,255,0.3)" className="platform" />
        </g>

        {/* Light Beams */}
        <g id="light-beams">
          <path d="M200 400 L180 200" stroke="rgba(255,255,255,0.2)" strokeWidth="2" className="light-beam" />
          <path d="M400 400 L380 150" stroke="rgba(255,255,255,0.2)" strokeWidth="2" className="light-beam" />
          <path d="M600 400 L580 180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" className="light-beam" />
        </g>
      </svg>
    </div>
  )
}

export default FuturisticParkSVG
