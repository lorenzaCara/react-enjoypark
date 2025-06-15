import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Calendar, Users, Info, Tag, MapPin, Music, Wrench } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function TicketDetailsDrawer({ ticket, isOpen, onClose, onPurchase }) {
  if (!ticket) return null

  console.log("TicketType:", ticket.ticketType)

  // Controlla se ci sono elementi inclusi
  const hasAttractions = ticket.attractions?.length > 0
  const hasShows = ticket.shows?.length > 0
  const hasServices = ticket.services?.length > 0
  const hasInclusions = hasAttractions || hasShows || hasServices

  const imageMap = {
    KID: "/img/kid-ticket.jpg",
    "FAST ACCESS": "/img/fastaccess-ticket.jpg",
    STANDARD: "/img/standard-ticket.jpg",
    VIP: "/img/vip-ticket.jpg",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">

      {/* Immagine in alto */}
      <div className="w-full h-48 rounded-2xl overflow-hidden my-6">
          <img
            src={imageMap[ticket.name]}
            alt={`${ticket.name || "Ticket"} image`}
            className="w-full h-full object-cover"
          />
        </div>

        <SheetHeader className="mb-6 mt-8">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <SheetTitle className="text-2xl text-gray-900 font-normal mb-2">{ticket.name}</SheetTitle>
              <SheetDescription className="text-gray-600">{ticket.description}</SheetDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                {ticket.ticketType?.name || "Standard"}
              </Badge>
              {ticket.ticketType?.description && (
                <p className="text-sm text-gray-500 mt-1">{ticket.ticketType.description}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Price Section */}
        <div className="bg-teal-50 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
              <p className="text-gray-700">Price</p>
              <p className="text-3xl font-bold text-teal-700">€{ticket.price}</p>
              {ticket.priceNote && <p className="text-sm text-teal-600">{ticket.priceNote}</p>}
            </div>
        </div>

        {/* Features Section with Accordion */}
        <div className="mb-6 mt-10">
          <h3 className="text-lg text-gray-900 mb-3">What's Included</h3>

          {hasInclusions ? (
            <Accordion type="single" collapsible className="w-full">
              {/* Attractions Accordion */}
              {hasAttractions && (
                <AccordionItem value="attractions" className="border-b border-gray-200">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-1.5 rounded-full mr-3">
                        <MapPin className="h-4 w-4 text-teal-700" />
                      </div>
                      <span className=" text-gray-800  font-normal">
                        Attractions <span className="text-gray-500 ml-1">({ticket.attractions.length})</span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <ul className="space-y-3 pl-10">
                      {ticket.attractions.map((item, idx) => (
                        <li key={`attraction-${idx}`} className="flex items-start">
                          <div className="bg-teal-50 p-1 rounded-full mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-teal-600" />
                          </div>
                          <span className="text-gray-700">{item.attraction?.name}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Shows Accordion */}
              {hasShows && (
                <AccordionItem value="shows" className="border-b border-gray-200">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-1.5 rounded-full mr-3">
                        <Music className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="text-gray-800 font-normal"> 
                      Shows <span className="text-gray-500 ml-1">({ticket.shows.length})</span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <ul className="space-y-3 pl-10">
                      {ticket.shows.map((item, idx) => (
                        <li key={`show-${idx}`} className="flex items-start">
                          <div className="bg-teal-50 p-1 rounded-full mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-teal-600" />
                          </div>
                          <span className="text-gray-700">{item.show?.title}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Services Accordion */}
              {hasServices && (
                <AccordionItem value="services" className="border-b border-gray-200">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-1.5 rounded-full mr-3">
                        <Wrench className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className=" text-gray-800  font-normal">
                        Services <span className="text-gray-500 ml-1">({ticket.services.length})</span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <ul className="space-y-3 pl-10">
                      {ticket.services.map((item, idx) => (
                        <li key={`service-${idx}`} className="flex items-start">
                          <div className="bg-teal-50 p-1 rounded-full mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-teal-600" />
                          </div>
                          <span className="text-gray-700">{item.service?.name}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <p className="text-gray-500">General park access included</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {ticket.note && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <p className="text-gray-600 text-sm">{ticket.note}</p>
            </div>
          </div>
        )}

        {/* Popular Badge */}
        {ticket.popular && (
          <div className="mb-6">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1">
              <Tag className="h-3.5 w-3.5 mr-1" /> Most Popular
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={() => {
              onClose()
              onPurchase(ticket)
            }}
            className="flex-1 bg-teal-700 hover:bg-teal-600 text-white rounded-full h-12 font-normal "
          >
            Buy Now
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="border-gray-200 text-gray-700  rounded-full h-12">
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
