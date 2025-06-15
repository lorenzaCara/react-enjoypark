import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";

const ServicesContext = createContext({
  services: [],
  serviceBookings: [],
  fetchServices: () => {},
  fetchServiceBookings: () => {},
  createService: async () => {},
  updateService: async () => {},
  deleteService: async () => {},
  createServiceBooking: async () => {},
  updateServiceBooking: async () => {},
  deleteServiceBooking: async () => {},
  isLoading: false,
  error: null,
});

export const ServicesProvider = ({ children }) => {
  const myaxios = useAxios();

  const [services, setServices] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // === Services ===
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await myaxios.get("/services");
      setServices(res.data);
      setError(null);
    } catch (err) {
      console.error("Errore nel recupero dei servizi:", err);
      setError(err.response?.data?.message || "Errore durante il caricamento");
    } finally {
      setIsLoading(false);
    }
  };

  const createService = async (data) => {
    try {
      const res = await myaxios.post("/services", data);
      setServices((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Errore nella creazione del servizio:", err);
      throw err;
    }
  };

  const updateService = async (id, data) => {
    try {
      const res = await myaxios.put(`/services/${id}`, data);
      setServices((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
      return res.data;
    } catch (err) {
      console.error("Errore nell'aggiornamento del servizio:", err);
      throw err;
    }
  };

  const deleteService = async (id) => {
    try {
      await myaxios.delete(`/services/${id}`);
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Errore nella cancellazione del servizio:", err);
      throw err;
    }
  };

  // === Service Bookings ===
  const fetchServiceBookings = async () => {
    setIsLoading(true);
    try {
      const res = await myaxios.get("/service-bookings");
      setServiceBookings(res.data);
      setError(null);
    } catch (err) {
      console.error("Errore nel recupero delle prenotazioni:", err);
      setError(err.response?.data?.message || "Errore durante il caricamento");
    } finally {
      setIsLoading(false);
    }
  };

  const createServiceBooking = async (data) => {
    console.log("Dati inviati al server:", data);  // <-- aggiungi questo
    try {
      const res = await myaxios.post("/service-bookings", data);
      setServiceBookings((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Errore nella creazione della prenotazione:", err.response?.data || err.message);
      throw err;
    }
  };
  

  const updateServiceBooking = async (id, data) => {
    try {
      const res = await myaxios.put(`/service-bookings/${id}`, data);
      setServiceBookings((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
      return res.data;
    } catch (err) {
      console.error("Errore nell'aggiornamento della prenotazione:", err);
      throw err;
    }
  };

  const deleteServiceBooking = async (id) => {
    try {
      await myaxios.delete(`/service-bookings/${id}`);
      setServiceBookings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Errore nella cancellazione della prenotazione:", err);
      throw err;
    }
  };

  // === useEffect ===
  useEffect(() => {
    fetchServices();
    fetchServiceBookings();
  }, []);

  return (
    <ServicesContext.Provider
      value={{
        services,
        serviceBookings,
        fetchServices,
        fetchServiceBookings,
        createService,
        updateService,
        deleteService,
        createServiceBooking,
        updateServiceBooking,
        deleteServiceBooking,
        isLoading,
        error,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export function useServices() {
  return useContext(ServicesContext);
}
