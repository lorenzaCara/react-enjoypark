import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";

const ShowsContext = createContext({
  shows: [],
  fetchShows: () => {},
  createShow: async () => {},
  updateShow: async () => {},
  deleteShow: async () => {},
  updateShowStatus: async () => {},
  isLoading: false,
  error: null,
});

export const ShowsProvider = ({ children }) => {
  const myaxios = useAxios();
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShows = async () => {
    setIsLoading(true);
    try {
      const res = await myaxios.get("/shows");
      setShows(res.data);
      setError(null);
    } catch (err) {
      console.error("Errore nel recupero degli spettacoli:", err);
      setError(err.response?.data?.message || "Errore durante il caricamento degli spettacoli");
    } finally {
      setIsLoading(false);
    }
  };

  const createShow = async (data) => {
    try {
      const res = await myaxios.post("/shows", data);
      setShows((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Errore nella creazione dello spettacolo:", err);
      throw err;
    }
  };

  const updateShow = async (id, data) => {
    try {
      const res = await myaxios.put(`/shows/${id}`, data);
      setShows((prev) => prev.map((show) => (show.id === id ? res.data : show)));
      return res.data;
    } catch (err) {
      console.error("Errore nell'aggiornamento dello spettacolo:", err);
      throw err;
    }
  };

  const deleteShow = async (id) => {
    try {
      await myaxios.delete(`/shows/${id}`);
      setShows((prev) => prev.filter((show) => show.id !== id));
    } catch (err) {
      console.error("Errore nella cancellazione dello spettacolo:", err);
      throw err;
    }
  };

  const updateShowStatus = async (id, status) => {
    try {
      const res = await myaxios.put(`/shows/${id}/status`, { status });
      setShows((prev) => prev.map((show) => (show.id === id ? res.data : show)));
      return res.data;
    } catch (err) {
      console.error("Errore nell'aggiornamento dello status:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <ShowsContext.Provider
      value={{
        shows,
        fetchShows,
        createShow,
        updateShow,
        deleteShow,
        updateShowStatus,
        isLoading,
        error,
      }}
    >
      {children}
    </ShowsContext.Provider>
  );
};

export function useShows() {
  return useContext(ShowsContext);
}
