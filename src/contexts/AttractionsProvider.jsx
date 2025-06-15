// src/providers/AttractionsProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";

const AttractionsContext = createContext({
  attractions: [],
  fetchAttractions: () => {},
  createAttraction: async () => {},
  updateAttraction: async () => {},
  deleteAttraction: async () => {},
  isLoading: false,
  error: null,
});

export const AttractionsProvider = ({ children }) => {
  const myaxios = useAxios();
  const [attractions, setAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttractions = async () => {
    setIsLoading(true);
    try {
      const res = await myaxios.get("/attractions");
      // Debugging: Controlla la struttura di res.data nella console del browser
      console.log("Risposta API /attractions:", res.data);

      // === MODIFICA QUI ===
      // Assicurati che 'attractions' sia sempre un array.
      // Sostituisci 'data' con la chiave effettiva del tuo oggetto risposta se è annidata.
      // Ad esempio, se l'API restituisce { "data": [{...}, {...}] }, userai res.data.data
      // Se l'API restituisce direttamente un array [{...}, {...}], allora res.data è già corretto
      // ma è bene avere un controllo di sicurezza.

      if (Array.isArray(res.data)) {
        setAttractions(res.data);
      } else if (
        res.data &&
        typeof res.data === "object" &&
        res.data.data &&
        Array.isArray(res.data.data)
      ) {
        setAttractions(res.data.data);
      } else if (
        res.data &&
        typeof res.data === "object" &&
        res.data.items &&
        Array.isArray(res.data.items)
      ) {
        setAttractions(res.data.items);
      } else {
        console.warn(
          "Attenzione: La risposta API per /attractions non è un array diretto o annidato come previsto:",
          res.data
        );
        setAttractions([]);
      }
      // === FINE MODIFICA ===

      setError(null);
    } catch (err) {
      console.error("Errore nel recupero delle attrazioni:", err); // Imposta attractions a un array vuoto anche in caso di errore per prevenire map su undefined/null
      setAttractions([]);
      setError(err.response?.data?.message || "Errore durante il caricamento");
    } finally {
      setIsLoading(false);
    }
  };

  const createAttraction = async (data) => {
    try {
      const res = await myaxios.post("/attractions", data);
      setAttractions((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Errore nella creazione dell'attrazione:", err);
      throw err;
    }
  };

  const updateAttraction = async (id, data) => {
    try {
      const res = await myaxios.put(`/attractions/${id}`, data);
      setAttractions((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
      return res.data;
    } catch (err) {
      console.error("Errore nell'aggiornamento dell'attrazione:", err);
      throw err;
    }
  };

  const deleteAttraction = async (id) => {
    try {
      await myaxios.delete(`/attractions/${id}`);
      setAttractions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Errore nella cancellazione dell'attrazione:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  return (
    <AttractionsContext.Provider
      value={{
        attractions,
        fetchAttractions,
        createAttraction,
        updateAttraction,
        deleteAttraction,
        isLoading,
        error,
      }}
    >
      {children}
    </AttractionsContext.Provider>
  );
};

export function useAttractions() {
  return useContext(AttractionsContext);
}
