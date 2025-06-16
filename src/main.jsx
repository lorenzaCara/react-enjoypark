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
import AppLoader from "./components/AppLoader"

// Set the default bg color for the entire app
document.documentElement.classList.add("bg-gray-100")

// --- INIZIO MODIFICA: Aggiunta del try...catch qui ---
try {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('Elemento #root non trovato nel DOM! Impossibile avviare l\'applicazione.');
    // Fallback se l'elemento root non esiste (meno probabile con il preload)
    document.body.innerHTML = `
      <div style="color: red; background-color: black; text-align: center; padding: 20px; font-family: sans-serif;">
        <h1>ERRORE CRITICO: ELEMENTO ROOT MANCANTE!</h1>
        <p>L'applicazione non può essere caricata perché l'elemento HTML #root non è stato trovato.</p>
        <p>Assicurati che il tuo file index.html contenga <code style="color: white;">&lt;div id="root"&gt;&lt;/div&gt;</code>.</p>
      </div>
    `;
  } else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <ScrollToTop />
          <AxiosProvider>
            <ThemeProvider>
              <UserProvider>
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
      </React.StrictMode>
    );
  }
} catch (error) {
  // QUESTO BLOCCO CATTURERÀ L'ERRORE E LO MOSTRERÀ SULLO SCHERMO
  console.error("Errore critico durante il rendering dell'app:", error);

  const rootElement = document.getElementById("root"); // Riprova a prendere rootElement nel caso il primo fallisca
  const targetElement = rootElement || document.body; // Usa root o body come fallback

  targetElement.innerHTML = `
    <div style="color: red; background-color: black; text-align: center; padding: 20px; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="color: white;">ERRORE CRITICO DI CARICAMENTO!</h1>
      <p style="color: white;">L'applicazione non è riuscita ad avviarsi correttamente.</p>
      <p style="color: lightgray; word-break: break-all;"><strong>Messaggio:</strong> ${error.message}</p>
      <p style="color: lightgray; word-break: break-all;"><strong>Stack (parziale):</strong> ${error.stack ? error.stack.split('\n')[0] + '\n' + error.stack.split('\n')[1] : 'N/A'}</p>
      <p style="color: white; margin-top: 20px;">Per favore, riprova o contatta il supporto.</p>
    </div>
  `;
}
// --- FINE MODIFICA ---