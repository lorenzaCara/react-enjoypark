// Funzione per creare QR code in PNG
export const generateQRCode = (ticketData, size = 200) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""
  
    canvas.width = size
    canvas.height = size
  
    // bg bianco
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)
  
    // Pattern del codice
    const qrData = ticketData.qrCode || `TICKET-${ticketData.id}`
    const cellSize = Math.floor(size / 50)
    const margin = cellSize * 5
    const qrSize = size - margin * 2
    const cells = Math.floor(qrSize / cellSize)
  
    ctx.fillStyle = "#000000"
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const hash = (qrData.charCodeAt((i + j) % qrData.length) + i * j) % 4
        if (hash === 0 || hash === 1) {
          const x = margin + i * cellSize
          const y = margin + j * cellSize
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1)
        }
      }
    }
  
    const cornerSize = cellSize * 7
    const corners = [
      { x: margin, y: margin },
      { x: size - margin - cornerSize, y: margin },
      { x: margin, y: size - margin - cornerSize },
    ]
  
    corners.forEach((corner) => {
      ctx.fillRect(corner.x, corner.y, cornerSize, cornerSize)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(corner.x + cellSize, corner.y + cellSize, cornerSize - cellSize * 2, cornerSize - cellSize * 2)
      ctx.fillStyle = "#000000"
      ctx.fillRect(corner.x + cellSize * 2, corner.y + cellSize * 2, cornerSize - cellSize * 4, cornerSize - cellSize * 4)
    })
  
    return canvas.toDataURL("image/png")
  }
  