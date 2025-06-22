import GoogleMapComponent from "@/components/Api-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { contactFaqs } from "@/lib/data/faqs"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import gsap from "gsap"
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Twitter,
  Youtube
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(100, { message: "Subject cannot exceed 100 characters" }),
  message: z
    .string()
    .min(20, { message: "Message must be at least 20 characters" })
    .max(1000, { message: "Message cannot exceed 1000 characters" }),
})

export default function ContactsPage() {
  const { toast } = useToast()
  const [isFixed, setIsFixed] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const headerRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        variant: "success",
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
        className: "bg-white text-gray-900 border border-gray-200 shadow-md"
      })
      reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
      })
    }
  }

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > 50 && !isFixed) {
        setIsFixed(true)
        gsap.fromTo(
          headerRef.current,
          { y: -50, paddingTop: getPaddingPx(false), paddingBottom: getPaddingPx(false) },
          { y: 0, paddingTop: 32, paddingBottom: 32, duration: 0.2, ease: "power2.out" },
        )
      } else if (scrollY <= 50 && isFixed) {
        setIsFixed(false)
        gsap.to(headerRef.current, {
          y: 0,
          paddingTop: getPaddingPx(false),
          paddingBottom: getPaddingPx(false),
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFixed])


  function getPaddingPx(isFixed) {
    if (isFixed) {
      return 32 
    } else {
      if (window.innerWidth >= 1024) {
        return 128 
      } else {
        return 80 
      }
    }
  }

  return (
    <div>
      {/* Animated Header */}
      <div className={`mx-auto p-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 " : "relative"
          } text-white text-center transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-20 lg:py-32 rounded-3xl lg:mx-4"
          }`}
        >
          <h1
            className={`transition-all duration-700 font-light tracking-wider ${
              isFixed ? "lg:text-2xl md:text-xl text-lg px-4" : "lg:text-8xl md:text-5xl text-4xl"
            }`}
          >
            Contact us
          </h1>
          {!isFixed && (
            <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4 px-4">
              We're here to help with any questions about Heptapod Park
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto py-10">
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:py-24 md:py-24 py-12 overflow-x-auto sm:overflow-visible ps-4 md:ps-0 lg:px-8 lg:ms-0 mb-16 md:px-4 md:ms-4 scrollbar-hide lg:">
          {/* Email */}
          <div className="min-w-[380px] sm:min-w-0 lg:min-w-0 bg-cyan-700/15 rounded-3xl p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-cyan-700" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 text-center mb-2">Email us</h3>
            <p className="text-gray-600 text-center mb-4">For general inquiries and support</p>
            <a
              href="mailto:info@heptapodpark.com"
              className="block text-cyan-700 text-center hover:underline"
            >
              info@heptapodpark.com
            </a>
          </div>

          {/* Phone */}
          <div className="min-w-[380px] sm:min-w-0 lg:min-w-0 bg-cyan-700/15 rounded-3xl p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-cyan-700" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 text-center mb-2">Call us</h3>
            <p className="text-gray-600 text-center mb-4">Speak directly with our support team</p>
            <a href="tel:+06 9456 7812" className="block text-cyan-700 text-center hover:underline">
              06 9456 7812
            </a>
          </div>

          {/* Location */}
          <div className="min-w-[380px] sm:min-w-0 lg:min-w-0 bg-cyan-700/15 rounded-3xl p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-cyan-700" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 text-center mb-2">Visit us</h3>
            <p className="text-gray-600 text-center mb-4">Find us at our main location</p>
            <address className="not-italic text-cyan-700 text-center">
              1101 W McKinley Ave, Pomona
              <br />
              CA 91768, USA
            </address>
          </div>

          {/* Hour */}
          <div className="min-w-[380px] sm:min-w-0 lg:min-w-0 bg-cyan-700/15 rounded-3xl p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-cyan-700" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 text-center mb-2">Hours</h3>
            <p className="text-gray-600 text-center mb-4">Our support team is available</p>
            <p className="text-cyan-700 text-center">
              Monday: Closed
              <br />
              Tuesday - Friday: 10:00 AM - 21:00 PM
              <br />
              Weekends: 9:00 AM - 8:00 PM
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:mb-16 mb-10 lg:px-8 px-4 md:mx-0 ">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Get in touch</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="John Doe"
                  className={cn(
                    "w-full rounded-xl border-gray-200 focus:border-teal-700",
                    errors.name && "border-red-300 focus:border-red-500",
                  )}
                />
                {errors.name && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  className={cn(
                    "w-full rounded-xl border-gray-200 focus:border-teal-700",
                    errors.email && "border-red-300 focus:border-red-500",
                  )}
                />
                {errors.email && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  {...register("subject")}
                  placeholder="How can we help you?"
                  className={cn(
                    "w-full rounded-xl border-gray-200 focus:border-teal-700",
                    errors.subject && "border-red-300 focus:border-red-500",
                  )}
                />
                {errors.subject && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.subject.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Please provide details about your inquiry..."
                  className={cn(
                    "w-full rounded-xl border-gray-200 focus:border-teal-700 min-h-[150px]",
                    errors.message && "border-red-300 focus:border-red-500",
                  )}
                />
                {errors.message && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.message.message}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-full h-12"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Map */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
            <div className="h-full w-full relative">
              <div className="absolute inset-0 bg-gray-200">
                <div className="h-full w-full flex items-center justify-center">
                    <GoogleMapComponent />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl p-8 lg:mb-16 mb-10">
          <div className="max-w-3xl mx-auto my-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Find quick answers to common questions about Heptapod Park and our services
              </p>
            </div>

            <div className="space-y-4">
              {contactFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-normal text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-teal-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  <div
                    className={cn(
                      "px-6 overflow-hidden transition-all duration-200",
                      expandedFaq === index ? "max-h-96 pb-6" : "max-h-0",
                    )}
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 lg:px-8">
          {/* Social Media */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 lg:p-8 px-4 py-6">
            <h2 className="text-2xl font-light text-gray-900 mb-6">Connect with us</h2>
            <p className="text-gray-600 mb-6">Follow us on social media for updates, events, and special offers</p>
            <div className="flex flex-wrap gap-4">
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
          </div>

          {/* Live Chat */}
          <div className="bg-teal-700 rounded-3xl lg:p-8 px-4 py-6 text-white">
            <div className="flex items-start">
              <div className="w-16 h-16 shrink-0 bg-white/20 rounded-full flex items-center justify-center mr-6">
                <MessageSquare className="h-8 w-8 text-white"/>
              </div>
              <div>
                <h2 className="text-2xl mb-2 font-light">Need immediate Help?</h2>
                <p className="text-teal-100 mb-6">Our support team is ready to assist you in real-time</p>
                <Button
                  onClick={() =>
                    toast({
                      title: "Live Chat",
                      description: "Live chat feature will be available soon!",
                    })
                  }
                  className="bg-white text-teal-700 hover:bg-teal-50 rounded-full shadow-none"
                >
                  Write us an email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
