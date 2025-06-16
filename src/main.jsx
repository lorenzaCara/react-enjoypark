import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import { Toaster } from "./components/ui/toaster"
import AxiosProvider from "./contexts/AxiosProvider"
import { NotificationProvider } from "./contexts/NotificationProvider"
import { TicketsProvider } from "./contexts/TicketsProvider"
import UserProvider from "./contexts/UserProvider"
import "./index.css"
import GuestLayout from "./layouts/GuestLayout"
import MainLayout from "./layouts/MainLayout.jsx"
import ContactsPage from "./pages/ContactPage"
import ForgotPassword from "./pages/ForgotPassword"
import HomePage from "./pages/HomePage.jsx"
import Login from "./pages/Login"
import MobileTicketsPage from "./pages/MobileTicketsPage"
import ProfilePage from "./pages/ProfilePage"
import RecoveryPage from "./pages/Recovery"
import Register from "./pages/Register"
import TicketPage from "./pages/TicketPage"
import TicketsPage from "./pages/TicketsPage"
import Unauthorized from "./pages/Unathorized"
import ValidateTicket from "./pages/ValidateTicket"
import NotificationPage from "./pages/NotificationPage"
import MapPage from "./pages/MapPage"
import { PlannerProvider } from "./contexts/PlannerProvider"
import PlannerPage from "./components/PlannerManager"
import AttractionsPage from "./pages/AttractionsPage"
import { AttractionsProvider } from "./contexts/AttractionsProvider"
import { ServicesProvider } from "./contexts/ServicesProvider"
import ServicesPage from "./pages/ServicesPage"
import { ShowsProvider } from "./contexts/ShowsProvider"
import ShowsPage from "./pages/ShowsPage"
import ProfileSettings from "./pages/ProfileSettings"
import SettingsPage from "./pages/SettingsPage"
import { ThemeProvider } from "./contexts/ThemeProvider"
import { ScrollToTop } from "./components/ScrollToTop"
import BookingManager from "./components/BookingManager"
import "./firebaseConfig.js"
import TicketsManager from "./components/Tickets-manager"
import AppLoader from "./components/AppLoader" // Import del nuovo componente

// Set the default bg color for the entire app
document.documentElement.classList.add("bg-gray-100")

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AxiosProvider>
        <ThemeProvider>
          <UserProvider>
            {/* AppLoader avvolge tutto il contenuto dell'app */}
            <AppLoader>
              <Routes>
                <Route
                  path="/"
                  element={
                    <NotificationProvider>
                      <TicketsProvider>
                        <PlannerProvider>
                          <AttractionsProvider>
                            <ServicesProvider>
                              <ShowsProvider>
                                <MainLayout />
                              </ShowsProvider>
                            </ServicesProvider>
                          </AttractionsProvider>
                        </PlannerProvider>
                      </TicketsProvider>
                    </NotificationProvider>
                  }
                >
                  <Route index element={<HomePage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="/profile/:ticketId" element={<TicketPage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="validate-ticket" element={<ValidateTicket />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/mobile-tickets" element={<MobileTicketsPage />} />
                  <Route path="/notifications" element={<NotificationPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/attractions" element={<AttractionsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/shows" element={<ShowsPage />} />
                  <Route path="/profile-settings" element={<ProfileSettings />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/bookings" element={<BookingManager />} />
                  <Route path="/ticket-manager" element={<TicketsManager />} />
                </Route>
                <Route path="/" element={<GuestLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="recovery" element={<RecoveryPage />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>
              </Routes>
              <Toaster />
            </AppLoader>
          </UserProvider>
        </ThemeProvider>
      </AxiosProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
