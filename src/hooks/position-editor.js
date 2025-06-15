import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAttractions } from "@/contexts/AttractionsProvider"

export default function AttractionPositionEditor() {
  const { attractions, updateAttraction } = useAttractions()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [posX, setPosX] = useState<number>(50)
  const [posY, setPosY] = useState<number>(50)

  const selectedAttraction = attractions.find((a) => a.id === selectedId)

  const handleSelect = (id: string) => {
    const attraction = attractions.find((a) => a.id === id)
    if (attraction) {
      setSelectedId(id)
      setPosX(attraction.positionX || 50)
      setPosY(attraction.positionY || 50)
    }
  }

  const handleUpdate = () => {
    if (!selectedId || !updateAttraction) return

    updateAttraction(selectedId, {
      positionX: posX,
      positionY: posY,
    })

    setSelectedId(null)
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-4">Position Editor</h3>

      <div className="mb-4">
        <label className="block text-sm mb-1">Select Attraction</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedId || ""}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">-- Select --</option>
          {attractions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} {!a.positionX && !a.positionY ? "(No position)" : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedAttraction && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Position X (%)</label>
              <Input type="number" min="0" max="100" value={posX} onChange={(e) => setPosX(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Position Y (%)</label>
              <Input type="number" min="0" max="100" value={posY} onChange={(e) => setPosY(Number(e.target.value))} />
            </div>
          </div>

          <Button onClick={handleUpdate} className="w-full">
            Update Position
          </Button>
        </>
      )}
    </div>
  )
}
