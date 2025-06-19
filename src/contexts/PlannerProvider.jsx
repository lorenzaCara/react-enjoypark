import { createContext, useContext, useState, useEffect } from "react"
import { useAxios } from "./AxiosProvider"

const PlannerContext = createContext()

export function PlannerProvider({ children }) {
  const [planners, setPlanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  const myaxios = useAxios()

  // Carica tutti i planner
  const fetchPlanners = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await myaxios.get("/planners")
      setPlanners(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Errore nel caricamento dei planner")
    } finally {
      setLoading(false)
    }
  }

  // Crea un nuovo planner
  const createPlanner = async (plannerData) => {
    setCreating(true)
    setCreateError(null)
    try {
      const { data } = await myaxios.post("/planners", plannerData)
      setPlanners((prev) => [...prev, data])
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nella creazione del planner"
      setCreateError(message)
      throw new Error(message)
    } finally {
      setCreating(false)
    }import { createContext, useContext, useState, useEffect } from "react"
import { useAxios } from "./AxiosProvider"

const PlannerContext = createContext()

export function PlannerProvider({ children }) {
  const [planners, setPlanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Nuovi stati per le operazioni di aggiunta singola
  const [addingItem, setAddingItem] = useState(false)
  const [addItemError, setAddItemError] = useState(null)


  const myaxios = useAxios()

  // Carica tutti i planner
  const fetchPlanners = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await myaxios.get("/planners")
      setPlanners(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Errore nel caricamento dei planner")
    } finally {
      setLoading(false)
    }
  }

  // Crea un nuovo planner
  const createPlanner = async (plannerData) => {
    setCreating(true)
    setCreateError(null)
    try {
      const { data } = await myaxios.post("/planners", plannerData)
      setPlanners((prev) => [...prev, data])
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nella creazione del planner"
      setCreateError(message)
      throw new Error(message)
    } finally {
      setCreating(false)
    }
  }

  // Aggiorna un planner esistente (modifica completa con 'set')
  const updatePlanner = async (id, plannerData) => {
    setUpdating(true)
    setUpdateError(null)
    try {
      const { data } = await myaxios.put(`/planners/${id}`, plannerData)

      // Aggiorna lo stato locale dei planner con i dati aggiornati dal backend
      setPlanners((prev) => prev.map((planner) => (planner.id === id ? data : planner)))

      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nell'aggiornamento del planner"
      setUpdateError(message)
      throw new Error(message)
    } finally {
      setUpdating(false)
    }
  }

  // Elimina un planner
  const deletePlanner = async (id) => {
    try {
      await myaxios.delete(`/planners/${id}`)
      setPlanners((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Errore nell'eliminazione del planner:", err)
      throw err
    }
  }

  // --- NUOVE LOGICHE PER AGGIUNTA SINGOLA ---

  // Aggiungi una singola attrazione a un planner
  const addAttractionToPlanner = async (plannerId, attractionId) => {
    setAddingItem(true)
    setAddItemError(null)
    try {
      const { data } = await myaxios.post(`/planners/${plannerId}/attractions`, { attractionId })
      
      // Aggiorna lo stato locale per riflettere l'aggiunta
      setPlanners((prev) => prev.map((planner) => (planner.id === plannerId ? data : planner)))
      
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nell'aggiunta dell'attrazione."
      setAddItemError(message)
      throw new Error(message)
    } finally {
      setAddingItem(false)
    }
  }

  // Aggiungi un singolo show a un planner
  const addShowToPlanner = async (plannerId, showId) => {
    setAddingItem(true)
    setAddItemError(null)
    try {
      const { data } = await myaxios.post(`/planners/${plannerId}/shows`, { showId })
      
      // Aggiorna lo stato locale per riflettere l'aggiunta
      setPlanners((prev) => prev.map((planner) => (planner.id === plannerId ? data : planner)))
      
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nell'aggiunta dello show."
      setAddItemError(message)
      throw new Error(message)
    } finally {
      setAddingItem(false)
    }
  }

  // Aggiungi un singolo servizio a un planner
  const addServiceToPlanner = async (plannerId, serviceId) => {
    setAddingItem(true)
    setAddItemError(null)
    try {
      const { data } = await myaxios.post(`/planners/${plannerId}/services`, { serviceId })
      
      // Aggiorna lo stato locale per riflettere l'aggiunta
      setPlanners((prev) => prev.map((planner) => (planner.id === plannerId ? data : planner)))
      
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nell'aggiunta del servizio."
      setAddItemError(message)
      throw new Error(message)
    } finally {
      setAddingItem(false)
    }
  }

  // --- FINE NUOVE LOGICHE ---


  useEffect(() => {
    fetchPlanners()
  }, [])

  return (
    <PlannerContext.Provider
      value={{
        planners,
        loading,
        error,
        fetchPlanners,
        createPlanner,
        creating,
        createError,
        updatePlanner,
        updating,
        updateError,
        deletePlanner,
        // Nuovi valori esposti dal context
        addAttractionToPlanner,
        addShowToPlanner,
        addServiceToPlanner,
        addingItem,
        addItemError,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanners() {
  return useContext(PlannerContext)
}
  }

  // Aggiorna un planner esistente
  const updatePlanner = async (id, plannerData) => {
    setUpdating(true)
    setUpdateError(null)
    try {
      const { data } = await myaxios.put(`/planners/${id}`, plannerData)

      // Aggiorna lo stato locale dei planner
      setPlanners((prev) => prev.map((planner) => (planner.id === id ? { ...planner, ...data } : planner)))

      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Errore nell'aggiornamento del planner"
      setUpdateError(message)
      throw new Error(message)
    } finally {
      setUpdating(false)
    }
  }

  // Elimina un planner
  const deletePlanner = async (id) => {
    try {
      await myaxios.delete(`/planners/${id}`)
      setPlanners((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Errore nell'eliminazione del planner:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchPlanners()
  }, [])

  return (
    <PlannerContext.Provider
      value={{
        planners,
        loading,
        error,
        fetchPlanners,
        createPlanner,
        creating,
        createError,
        updatePlanner,
        updating,
        updateError,
        deletePlanner,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanners() {
  return useContext(PlannerContext)
}
