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
      // === AGGIUNGI QUESTO CONSOLE.LOG PER DEBUGGING ===
      console.log("Risposta API /shows:", res.data);
      // =================================================

      // === MODIFICA QUI per setShows ===
      if (Array.isArray(res.data)) {
        setShows(res.data); // Caso 1: L'API restituisce direttamente un array
      } else if (
        res.data &&
        typeof res.data === "object" &&
        Array.isArray(res.data.data)
      ) {
        setShows(res.data.data); // Caso 2: L'API restituisce un oggetto con l'array sotto la chiave 'data' (es. { data: [...] })
      } else if (
        res.data &&
        typeof res.data === "object" &&
        Array.isArray(res.data.shows)
      ) {
        setShows(res.data.shows); // Caso 3: L'API restituisce un oggetto con l'array sotto la chiave 'shows' (es. { shows: [...] })
      } else {
        console.warn(
          "Risposta API /shows non è un array diretto o annidato come previsto:",
          res.data
        );
        setShows([]); // Fallback sicuro: imposta sempre a un array vuoto
      }
      // === FINE MODIFICA ===

      setError(null);
    } catch (err) {
      console.error("Errore nel recupero degli spettacoli:", err);
      setError(
        err.response?.data?.message ||
          "Errore durante il caricamento degli spettacoli"
      );
      setShows([]); // Imposta a array vuoto anche in caso di errore
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
