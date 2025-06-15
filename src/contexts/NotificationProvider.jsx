import React, { createContext, useContext, useState, useEffect } from "react";
import { useAxios } from "./AxiosProvider";
import { useUser } from "./UserProvider";  // importiamo useUser dal tuo UserProvider

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useUser();  // prendiamo l'utente dallo UserProvider
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const myaxios = useAxios();

  // Carica notifiche SOLO se utente loggato
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await myaxios.get("/notifications");
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Errore nel caricamento delle notifiche");
    } finally {
      setLoading(false);
    }
  };

  // Crea notifica (richiede login)
  const createNotification = async (notificationData) => {
    if (!user) {
      const msg = "Devi essere loggato per creare una notifica";
      setCreateError(msg);
      throw new Error(msg);
    }

    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await myaxios.post("/service-booking", notificationData);
      setNotifications((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Errore nella creazione della notifica";
      setCreateError(message);
      throw new Error(message);
    } finally {
      setCreating(false);
    }
  };

  const markAsRead = async (id) => {
    if (!user) return;
    try {
      await myaxios.patch(`/notifications/${id}`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Errore nel segnare come letta la notifica:", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!user) {
      throw new Error("Devi essere loggato per eliminare una notifica");
    }
    try {
      await myaxios.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Errore nell'eliminare la notifica:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]); // ricarica notifiche se cambia l'utente (login/logout)

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        fetchNotifications,
        createNotification,
        creating,
        createError,
        markAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
