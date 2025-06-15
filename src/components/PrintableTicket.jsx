import HeptapodAll from "@/assets/HeptapodAll"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default function PrintableTicket({ ticket, qrCodeImage }) {
  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active"
      case "EXPIRED":
        return "Expired"
      case "USED":
        return "Used"
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "CREDIT_CARD":
        return "Credit Card"
      case "PAYPAL":
        return "PayPal"
      default:
        return method || "Not specified"
    }
  }

  const getTicketPrice = (ticket) => {
    return ticket?.price || ticket?.ticketType?.price || ticket?.originalPrice || 0
  }

  const ticketPrice = getTicketPrice(ticket)
  const validityDate = new Date(ticket.validFor)
  const purchaseDate = new Date(ticket.purchaseDate || Date.now())

  return (

      <div className="print-ticket-container">
        <div className="print-header">
          <div className="print-logo flex justify-center items-center">
            <HeptapodAll width="150px" height="150px"/>
          </div>
          <div className="print-ticket-title">{ticket.ticketType?.name || `Ticket #${ticket.id}`}</div>
          <div className="print-ticket-id">Ticket #{ticket.id}</div>
        </div>
  
        <div className="print-details-grid">
          <div>
            <div className="print-detail-item">
              <div className="print-detail-label">Price</div>
              <div className="print-detail-value print-price">€{ticketPrice.toFixed(2)}</div>
            </div>
            <div className="print-detail-item">
              <div className="print-detail-label">State</div>
              <div className="print-detail-value">
                <span className="print-status">{getStatusText(ticket.status)}</span>
              </div>
            </div>
            <div className="print-detail-item">
              <div className="print-detail-label">Purchase date</div>
              <div className="print-detail-value">{format(purchaseDate, "d MMMM yyyy", { locale: it })}</div>
            </div>
          </div>
          <div>
            <div className="print-detail-item">
              <div className="print-detail-label">Valid until</div>
              <div className="print-detail-value">{format(validityDate, "d MMMM yyyy", { locale: it })}</div>
            </div>
            <div className="print-detail-item">
              <div className="print-detail-label">Payment method</div>
              <div className="print-detail-value">{getPaymentMethodText(ticket.paymentMethod)}</div>
            </div>
            <div className="print-detail-item">
              <div className="print-detail-label">Ticket ID</div>
              <div className="print-detail-value">#{ticket.id}</div>
            </div>
          </div>
        </div>
  
        <div className="print-qr-section">
          <div className="print-qr-title">QR code for entry</div>
          <div className="print-qr-subtitle">Show this code at the park entrance</div>
          <div className="print-qr-image-container">
            {qrCodeImage ? (
              <img src={qrCodeImage || "/placeholder.svg"} alt="QR Code" className="print-qr-image" />
            ) : (
              <div className="print-qr-placeholder">
                <div className="print-qr-icon">⬜</div>
                <div className="print-qr-text">{ticket.rawCode || `TICKET-${ticket.id}`}</div>
              </div>
            )}
          </div>
          <div className="print-qr-code-text">{ticket.rawCode || `TICKET-${ticket.id}`}</div>
        </div>
  
        <div className="print-footer">
          <p>Printed on {format(new Date(), "d MMMM yyyy 'alle' HH:mm", { locale: it })}</p>
          <p>Heptapod Park - The future of fun</p>
          <p className="print-footer-note">Keep this ticket for the entire duration of your visit</p>
        </div>

      <style jsx>{`
        .print-ticket-container {
          display: none;
        }

        @media print {
          /* Nascondi tutto tranne il biglietto da stampare */
          body * {
            visibility: hidden;
          }

          .print-ticket-container,
          .print-ticket-container * {
            visibility: visible;
          }

          .print-ticket-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #14b8a6;
            border-radius: 15px;
            padding: 30px;
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
            font-family: Lato, sans-serif;
            color: #333;
            page-break-inside: avoid;
          }

          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #14b8a6;
            padding-bottom: 20px;
            font-weight: light;
          }

          .print-logo {
            font-size: 24px;
            font-weight: light;
            color: #14b8a6;
            margin-bottom: 10px;
          }

          .print-ticket-title {
            font-size: 20px;
            font-weight: light;
            margin-bottom: 5px;
          }

          .print-ticket-id {
            color: #666;
            font-size: 14px;
          }

          .print-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }

          .print-detail-item {
            margin-bottom: 15px;
          }

          .print-detail-label {
            font-weight: light;
            color: #14b8a6;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }

          .print-detail-value {
            font-size: 16px;
          }

          .print-qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          }

          .print-qr-title {
            font-weight: light;
            margin-bottom: 10px;
            font-size: 16px;
          }

          .print-qr-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }

          .print-qr-image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px 0;
          }

          .print-qr-image {
            width: 150px;
            height: 150px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          .print-qr-placeholder {
            width: 150px;
            height: 150px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
          }

          .print-qr-icon {
            font-size: 48px;
            color: #9ca3af;
            margin-bottom: 10px;
          }

          .print-qr-text {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            font-family: monospace;
          }

          .print-qr-code-text {
            margin-top: 15px;
            font-family: monospace;
            font-size: 14px;
            font-weight: light;
            color: #666;
          }

          .print-price {
            font-size: 24px;
            font-weight: light;
            color: #14b8a6;
          }

          .print-status {
            display: inline-block;
            padding: 5px 0px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: light;
            background: #dcfce7;
            color: #666;
          }

          .print-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #666;
          }

          .print-footer-note {
            margin-top: 10px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}
