import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAxios } from "./AxiosProvider";
import { useUser } from "./UserProvider";

const TicketsContext = createContext();

export function TicketsProvider({ children }) {
  const { user } = useUser(); // prendo utente dal UserProvider
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchasedTickets, setPurchasedTickets] = useState([]);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [currentTicket, setCurrentTicket] = useState(null);
  const [currentTicketError, setCurrentTicketError] = useState(null);

  const myaxios = useAxios();

  const fetchPurchasedTickets = async () => {
    if (!user) {
      setPurchasedTickets([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await myaxios.get("/tickets");
      setPurchasedTickets(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    if (!user) {
      const msg = "Devi essere loggato per creare un biglietto";
      setCreateError(msg);
      throw new Error(msg);
    }

    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await myaxios.post("/tickets", ticketData);
      setPurchasedTickets((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nella creazione del biglietto";
      setCreateError(message);
      throw new Error(message);
    } finally {
      setCreating(false);
    }
  };

  const updateTicket = async (ticketId, updatedData) => {
    if (!user) {
      const msg = "Devi essere loggato per aggiornare un biglietto";
      setUpdateError(msg);
      throw new Error(msg);
    }

    setUpdating(true);
    setUpdateError(null);
    try {
      const { data } = await myaxios.put(`/tickets/${ticketId}`, updatedData);
      setPurchasedTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? data : t))
      );
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nell'aggiornamento del biglietto";
      setUpdateError(message);
      console.error("Errore di aggiornamento:", err.response?.data);
      throw new Error(message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!user) {
      const msg = "Devi essere loggato per eliminare un biglietto";
      setDeleteError(msg);
      throw new Error(msg);
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await myaxios.delete(`/tickets/${ticketId}`);
      setPurchasedTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nell'eliminazione del biglietto";
      setDeleteError(message);
      throw new Error(message);
    } finally {
      setDeleting(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await myaxios.get("/ticket-types");
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketByCode = useCallback(async (code) => {
    if (!user) {
      setCurrentTicket(null);
      setCurrentTicketError("Devi essere loggato per recuperare un biglietto");
      throw new Error("Devi essere loggato per recuperare un biglietto");
    }

    setCurrentTicket(null);
    setCurrentTicketError(null);
    try {
      const { data } = await myaxios.get(`/tickets/code/${code}`);
      setCurrentTicket(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nel recupero del biglietto";
      setCurrentTicketError(message);
      throw new Error(message);
    }
  }, [user]);

  const validateTicket = async (qrCode) => {
    if (!user) {
      const msg = "Devi essere loggato per validare un biglietto";
      setUpdateError(msg);
      throw new Error(msg);
    }

    setUpdating(true);
    setUpdateError(null);
  
    try {
      const { data } = await myaxios.post('/tickets/validate', { qrCode });
  
      if (!data || !data.ticket) {
        throw new Error("Risposta non valida dal server: ticket mancante");
      }
  
      const validatedTicket = data.ticket;
  
      setPurchasedTickets((prev) =>
        prev.map((t) => (t.rawCode === qrCode ? validatedTicket : t))
      );
  
      setCurrentTicket((prev) =>
        prev?.rawCode === qrCode ? validatedTicket : prev
      );
  
      return validatedTicket;
  
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nella validazione del biglietto";
      setUpdateError(message);
      console.error("Errore nella validazione del biglietto:", err);
      throw new Error(message);
    } finally {
      setUpdating(false);
    }
  };

  // Quando cambia user (login/logout), ricarica i dati
  useEffect(() => {
    fetchTickets();
    fetchPurchasedTickets();
  }, [user]);

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        loading,
        error,
        fetchTickets,
        purchasedTickets,
        fetchPurchasedTickets,

        createTicket,
        creating,
        createError,

        updateTicket,
        updating,
        updateError,

        deleteTicket,
        deleting,
        deleteError,

        currentTicket,
        currentTicketError,
        fetchTicketByCode,

        validateTicket,
        setCurrentTicket,
        setCurrentTicketError,

        addPurchasedTicket: (ticket) => setPurchasedTickets((prev) => [...prev, ticket]),
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketsContext);
}
