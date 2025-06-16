import React from "react";
import { useTickets } from "@/contexts/TicketsProvider";
import { useUser } from "@/contexts/UserProvider";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Ticket,
  Sparkles,
  Shield,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ValidateTicket() {
  const [searchParams] = useSearchParams();
  const rawCode = searchParams.get("code");

  const navigate = useNavigate();
  const { user } = useUser();
  const location = useLocation(); // Aggiunto: Ottiene l'oggetto location corrente

  const {
    currentTicket,
    currentTicketError,
    fetchTicketByCode,
    validateTicket,
  } = useTickets();

  const [success, setSuccess] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  const headerRef = useRef(null);
  const cardRef = useRef(null);
  const detailsRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in and has STAFF role
    if (!user) {
      // MODIFICA QUI: Salva l'intera location anziché solo il rawCode
      // Questo memorizza il percorso e i parametri di ricerca come "/validate-ticket?code=XYZ"
      localStorage.setItem("redirectAfterLogin", JSON.stringify(location));
      navigate("/login");
      return;
    }

    // Rimuovi l'elemento dal localStorage una volta che l'utente è autenticato.
    // Questo è importante per evitare reindirizzamenti indesiderati in sessioni future.
    localStorage.removeItem("redirectAfterLogin");

    if (user.role !== "STAFF") {
      navigate("/unauthorized");
      return;
    } // If we have a code, fetch the ticket

    const fetchTicket = async () => {
      setIsLoading(true);
      try {
        if (rawCode) {
          await fetchTicketByCode(rawCode); // Animate card entrance after loading
          setTimeout(() => {
            setShowDetails(true);
            if (cardRef.current) {
              gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: "back.out(1.7)",
                }
              );
            }
          }, 300);
        } else {
          setLocalError("No ticket code provided");
        }
      } catch (err) {
        console.error(err);
        setLocalError(err.message || "Error loading the ticket");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket(); // Animate header entrance

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [rawCode, user, navigate, fetchTicketByCode, location]);

  const handleValidate = async () => {
    try {
      if (!currentTicket || !currentTicket.rawCode) {
        throw new Error("Invalid or unloaded ticket");
      }

      setIsValidating(true);
      await validateTicket(currentTicket.rawCode);
      setSuccess("Ticket successfully validated!");
      setLocalError("");

      // Animate success message
      if (successRef.current) {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
      }

      // Confetti effect simulation
      setTimeout(() => {
        if (successRef.current) {
          gsap.to(successRef.current, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          });
        }
      }, 500);
    } catch (err) {
      console.error("Validation error:", err);
      setLocalError(err.message || "Unknown error during validation");
      setSuccess("");
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          badge: (
            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 font-medium text-xs sm:text-sm">
              Active
            </Badge>
          ),
          color: "teal",
          icon: CheckCircle,
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      case "USED":
        return {
          badge: (
            <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 font-medium text-xs sm:text-sm">
              Used
            </Badge>
          ),
          color: "gray",
          icon: Eye,
          bgColor: "bg-cyan-50",
          borderColor: "border-cyan-200",
        };
      case "EXPIRED":
        return {
          badge: (
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-medium text-xs sm:text-sm">
              ✕ Expired
            </Badge>
          ),
          color: "gray",
          icon: XCircle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
      default:
        return {
          badge: (
            <Badge
              variant="secondary"
              className="font-medium text-xs sm:text-sm"
            >
              {status}
            </Badge>
          ),
          color: "gray",
          icon: AlertTriangle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const handleRetry = () => {
    setLocalError("");
    setSuccess("");
    window.location.reload();
  };

  if (!user || user.role !== "STAFF") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-4 sm:py-8 lg:mx-4">
      <div className="mx-auto px-3 sm:px-4">
        {/* Mobile-Optimized Header */}
        <div
          ref={headerRef}
          className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 text-white rounded-3xl p-4 sm:p-8 mb-4 sm:mb-8 relative overflow-hidden"
        >
          {/* Background Pattern - Hidden on very small screens */}
          <div className="absolute inset-0 opacity-10 hidden sm:block">
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <QrCode className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-4xl font-light mb-1 sm:mb-2 leading-tight">
                  Ticket validation
                </h1>
                <p className="text-teal-100 text-sm sm:text-lg">
                  Scan and validate ticket
                </p>
              </div>
            </div>

            {/* Mobile Staff Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-3 py-2 sm:px-4">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm truncate">
                Staff: {user?.firstName || user?.email?.split("@")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Main Content Card */}
        <div
          ref={cardRef}
          className="max-w-7xl mx-auto bg-white rounded-3xl  overflow-hidden backdrop-blur-sm"
          style={{ opacity: 0 }}
        >
          {isLoading ? (
            <div className="p-4 sm:p-8">
              {/* Mobile Loading State */}
              <div className="text-center py-8 sm:py-12">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-teal-200 rounded-full mx-auto mb-4 sm:mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <h3 className="text-lg sm:text-xl text-gray-900 mb-2">
                  Loading ticket
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Verification in progress...
                </p>
              </div>

              {/* Mobile Skeleton Loading */}
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-3xl"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-3xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentTicketError || localError ? (
            <div className="p-4 sm:p-8">
              <div className="text-center bg-red-50 p-6 sm:p-8 rounded-3xl border-2 border-red-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-2xl text-gray-900 mb-3">
                  Loading error
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base max-w-md mx-auto">
                  {currentTicketError || localError}
                </p>
                <Button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-3xl px-4 sm:px-6 text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try again
                </Button>
              </div>
            </div>
          ) : !currentTicket ? (
            <div className="p-4 sm:p-8">
              <div className="text-center bg-amber-50 p-6 sm:p-8 rounded-3xl border-2 border-amber-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-2xl text-gray-900 mb-3">
                  Ticket not found
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
                  No ticket found with the provided code. Please ensure the QR
                  code is readable.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-8">
              {/* Mobile-Optimized Ticket Status Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div
                  className={`inline-flex items-center gap-2 sm:gap-3 ${
                    getStatusConfig(currentTicket.status).bgColor
                  } ${
                    getStatusConfig(currentTicket.status).borderColor
                  } border rounded-3xl px-4 py-3 sm:px-6 sm:py-4`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                    {React.createElement(
                      getStatusConfig(currentTicket.status).icon,
                      {
                        className: `w-5 h-5 sm:w-6 sm:h-6 text-${
                          getStatusConfig(currentTicket.status).color
                        }-600`,
                      }
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      Ticket status
                    </div>
                    {getStatusConfig(currentTicket.status).badge}
                  </div>
                </div>
              </div>

              {/* Mobile-Optimized Ticket Details */}
              <div
                ref={detailsRef}
                className="bg-gray-200/30 rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 "
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-teal-500/30 rounded-3xl flex items-center justify-center">
                      <Ticket className="w-5 h-5 sm:w-7 sm:h-7 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl text-gray-900">
                        Ticket details
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                        Full ticket details
                      </p>
                    </div>
                  </div>

                  {/* Mobile Expand/Collapse Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedDetails(!expandedDetails)}
                    className="sm:hidden rounded-xl p-2"
                  >
                    {expandedDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Always show QR code and ticket type on mobile */}
                <div className="space-y-3 sm:space-y-4">
                  {/* QR Code - Always visible */}
                  <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-3xl border border-white transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/30 rounded-3xl flex items-center justify-center">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                        Ticket code
                      </div>
                      <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm break-all">
                        {currentTicket.rawCode}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Type - Always visible */}
                  {currentTicket.ticketType && (
                    <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-3xl border border-white transition-all duration-300">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">
                          Ticket type
                        </div>
                        <div className=" text-gray-900 text-sm sm:text-lg truncate">
                          {currentTicket.ticketType.name}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collapsible details on mobile, always visible on desktop */}
                  <div
                    className={`space-y-3 sm:space-y-4 ${
                      expandedDetails ? "block" : "hidden"
                    } sm:block`}
                  >
                    {/* Valid Until */}
                    {currentTicket.validFor && (
                      <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-3xl border border-white transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">
                            Valid until
                          </div>
                          <div className=" text-gray-900 text-sm sm:text-base">
                            {format(
                              new Date(currentTicket.validFor),
                              "d MMM yyyy",
                              { locale: it }
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Owner */}
                    {currentTicket.user && (
                      <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-3xl border border-white transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center ">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">
                            Owner
                          </div>
                          <div className=" text-gray-900 text-sm sm:text-base truncate">
                            {currentTicket.user.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Date */}
                    {currentTicket.purchaseDate && (
                      <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-3xl border border-white transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center ">
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">
                            Purchase date
                          </div>
                          <div className=" text-gray-900 text-sm sm:text-base">
                            {format(
                              new Date(currentTicket.purchaseDate),
                              "d MMM yyyy",
                              { locale: it }
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div
                  ref={successRef}
                  className="bg-gradient-to-r from-teal-50 to-teal-50 border-2 border-teal-200 rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-teal-900 mb-1 text-sm sm:text-lg">
                        Validation Completed
                      </h3>
                      <p className="text-teal-700 text-xs sm:text-base">
                        {success}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {localError && !currentTicketError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 ">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className=" text-red-900 mb-1 text-sm sm:text-lg">
                        Validation error
                      </h3>
                      <p className="text-red-700 text-xs sm:text-base">
                        {localError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile-Optimized Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-teal-50/30">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
              <Link to={"/"}>
                <Button
                  variant="outline"
                  className=" border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 sm:px-6 text-sm sm:text-base order-2 sm:order-1 rounded-full px-12 py-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go back Home
                </Button>
              </Link>

              {currentTicket && currentTicket.status === "ACTIVE" && (
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-3xl px-6 py-3 sm:px-8 shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base order-1 sm:order-2"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="hidden sm:inline">
                        Validation in progress...
                      </span>
                      <span className="sm:hidden">Validating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Validate ticket</span>
                      <span className="sm:hidden">Validate</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
