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
