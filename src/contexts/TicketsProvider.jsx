import express from 'express';
import prisma from '../prisma/prismaClient.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import { createTicketValidator, updateTicketValidator } from '../validators/tickets.validator.js';
import QRCode from 'qrcode';
import { TicketStatus } from '@prisma/client';
import { ticketStatusMiddleware } from '../middlewares/ticketStatus.middleware.js';
import { staffMiddleware } from '../middlewares/staff.middleware.js';
import { validateQrCodeValidator } from '../validators/qrCode.validator.js';

const ticketsRouter = express.Router();

const formatTicketWithPrice = (ticket) => ({
  ...ticket,
  ticketType: {
    ...ticket.ticketType,
    price: ticket.ticketType.price,
  },
});

ticketsRouter.get('/ticket-types', async (req, res) => {
  try {
    const ticketTypes = await prisma.ticketType.findMany({
      include: {
        attractions: {
          include: { attraction: true }
        },
        services: {
          include: { service: true }
        },
        shows: {
          include: { show: true }
        }
      }
    });
    res.json(ticketTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving ticket types' });
  }
});

ticketsRouter.get('/tickets', authMiddleware, ticketStatusMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: {
        ticketType: {
          include: {
            attractions: { include: { attraction: true } },
            services: { include: { service: true } },
            shows: { include: { show: true } }
          }
        },
        user: true,
        discount: true,
      },
    });
    res.json(tickets.map(formatTicketWithPrice));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving tickets' });
  }
});

ticketsRouter.get('/tickets/:id', authMiddleware, ticketStatusMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ticket ID' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        ticketType:
        { include:
          {
            attractions: { include: { attraction: true } },
            services: { include: { service: true } },
            shows: { include: { show: true } }
           }
        },
        user: true,
        discount: true,
      },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.userId !== req.user.id) return res.status(403).json({ error: 'Permission denied' });
    res.json(formatTicketWithPrice(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving the ticket' });
  }
});

ticketsRouter.post(
  '/tickets',
  authMiddleware,
  ticketStatusMiddleware,
  validatorMiddleware(createTicketValidator),
  async (req, res) => {
    const { ticketTypeId, validFor, discountId, status, paymentMethod } = req.body;
    try {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
      });
      if (!ticketType)
        return res.status(404).json({ error: 'Ticket type not found' });

      const baseUrl = process.env.FRONTEND_URL;
      const rawCode = `TICKET-${req.user.id}-${ticketTypeId}-${Date.now()}`;
      const ticketUrl = `${baseUrl}/validate-ticket?code=${encodeURIComponent(
        rawCode
      )}`;

      const qrCodeImage = await QRCode.toDataURL(ticketUrl);

      // --- INIZIO LOGICA DATA CREAZIONE (POST /tickets) ---
      const inputDateString = validFor;

      const validForStartOfDayUTC = new Date(inputDateString + 'T00:00:00.000Z');
      const validForEndOfDayUTC = new Date(inputDateString + 'T23:59:59.999Z'); // Fine del giorno di validità (UTC)

      const nowUTC = new Date(); // Il momento esatto UTC dell'acquisto
      const todayUTCStart = new Date();
      todayUTCStart.setUTCHours(0, 0, 0, 0); // L'inizio del giorno corrente UTC

      console.log("-----------------------------------------");
      console.log("Debug POST /tickets for date issue:");
      console.log("inputDateString (from frontend):", inputDateString);
      console.log("validForStartOfDayUTC (ticket start UTC):", validForStartOfDayUTC.toISOString());
      console.log("validForEndOfDayUTC (ticket end UTC):", validForEndOfDayUTC.toISOString());
      console.log("nowUTC (current purchase moment UTC):", nowUTC.toISOString());
      console.log("todayUTCStart (start of current day UTC):", todayUTCStart.toISOString());
      console.log("-----------------------------------------");


      // Controlla se la data di validità è antecedente all'inizio del giorno corrente (UTC)
      if (validForStartOfDayUTC.getTime() < todayUTCStart.getTime()) {
        console.log("Validity date is in the past.");
        return res.status(400).json({ error: 'Validity date cannot be in the past' });
      }

      // DETERMINAZIONE DELLO STATO ALLA CREAZIONE:
      let computedStatus = TicketStatus.ACTIVE; // Presupponi ACTIVE
      
      // Se la data di validità è NEL FUTURO, è sicuramente ACTIVE.
      // Se la data di validità è OGGI (validForStartOfDayUTC.getTime() === todayUTCStart.getTime()),
      // allora il biglietto è ACTIVE per definizione per l'intera giornata.
      // Diventa EXPIRED solo se la data di validità è già passata completamente rispetto al momento attuale.
      if (nowUTC.getTime() > validForEndOfDayUTC.getTime()) {
          // Questo significa che l'acquisto sta avvenendo DOPO la mezzanotte del giorno per cui il ticket è valido.
          // Quindi, è EXPIRED.
          computedStatus = TicketStatus.EXPIRED;
          console.log("Ticket purchased after its validity period (EXPIRED).");
      } else if (status) {
          // Se lo stato è stato esplicitamente fornito nel body, usalo (es. per staff)
          computedStatus = status;
      }
      // Se non rientra nei casi precedenti, rimane ACTIVE (copre il caso "oggi").

      const ticket = await prisma.ticket.create({
        data: {
          userId: req.user.id,
          ticketTypeId,
          qrCode: qrCodeImage,
          rawCode,
          validFor: validForStartOfDayUTC, // Salviamo l'inizio del giorno UTC nel DB
          discountId: discountId || null,
          paymentMethod: paymentMethod || null,
          status: computedStatus,
        },
        include: {
          ticketType: {
            include: {
              attractions: { include: { attraction: true } },
              services: { include: { service: true } },
              shows: { include: { show: true } },
            },
          },
        },
      });
      console.log("Created ticket with status:", computedStatus);
      // --- FINE LOGICA DATA CREAZIONE ---

      res.status(201).json(formatTicketWithPrice(ticket));
    } catch (error) {
      console.error("Error creating the ticket:", error); // Log più dettagliato dell'errore
      res.status(500).json({ error: 'Error creating the ticket' });
    }
  }
);

ticketsRouter.put('/tickets/:id', authMiddleware, ticketStatusMiddleware, validatorMiddleware(updateTicketValidator(false)), staffMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

  const { ticketTypeId, validFor, discountId, status, paymentMethod } = req.body;
  try {
    const ticketType = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!ticketType) return res.status(404).json({ error: 'Ticket type not found' });

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    // Il controllo `if (ticket.userId !== req.user.id)` è stato rimosso in PUT per staffMiddleware.
    // Se vuoi che solo il proprietario possa aggiornare, devi ripristinarlo o affinarlo nel middleware.


    // Prepara validFor per Prisma
    let updatedValidFor = validFor;
    if (typeof validFor === 'string' && validFor.match(/^\d{4}-\d{2}-\d{2}$/)) {
      updatedValidFor = new Date(validFor + "T00:00:00.000Z"); // Salviamo inizio giorno UTC
    } else if (validFor instanceof Date) {
      updatedValidFor = validFor;
    }

    const now = new Date(); // Data e ora locale del server
    // Calcola lo status basandosi sulla data di validità (fine giornata UTC per consistenza)
    const validForForStatusCheck = updatedValidFor instanceof Date ? new Date(updatedValidFor.toISOString().split('T')[0] + 'T23:59:59.999Z') : null;
    const computedStatus = status || (validForForStatusCheck && now.getTime() > validForForStatusCheck.getTime() ? TicketStatus.EXPIRED : TicketStatus.ACTIVE);

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ticketTypeId,
        validFor: updatedValidFor, // Utilizza la data preparata
        discountId: discountId || null,
        paymentMethod: paymentMethod || null,
        status: computedStatus,
      },
      include: {
        ticketType: { include: {
            attractions: { include: { attraction: true } },
            services: { include: { service: true } },
            shows: { include: { show: true } } } },
        user: true,
        discount: true,
      }
    });
    res.json(formatTicketWithPrice(updatedTicket));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating the ticket' });
  }
});

ticketsRouter.delete('/tickets/:id', authMiddleware, ticketStatusMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        ticketType: { include: {
            attractions: { include: { attraction: true } },
            services: { include: { service: true } },
            shows: { include: { show: true } } } },
        user: true,
        discount: true,
      }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.userId !== req.user.id) return res.status(403).json({ error: 'Permission denied' });

    await prisma.ticket.delete({ where: { id: ticketId } });
    res.json({ message: 'Ticket successfully deleted', ticket: formatTicketWithPrice(ticket) });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error deleting the ticket' });
  }
});

ticketsRouter.post('/tickets/validate', authMiddleware, staffMiddleware, async (req, res) => {
  const { qrCode: rawCode } = req.body;

  if (!rawCode) {
    return res.status(400).json({ error: 'rawCode is required for validation' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { rawCode } });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'USED') {
      return res.status(400).json({ error: 'Ticket already used' });
    }

    if (ticket.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Ticket not valid, status: ${ticket.status}` });
    }

    // --- LOGICA DATA VALIDAZIONE (POST /tickets/validate) ---
    const ticketValidForDB = new Date(ticket.validFor); // Ottieni la data come salvata nel DB (sarà UTC)

    const ticketValidDayUTC = new Date(ticketValidForDB.toISOString().split('T')[0] + 'T00:00:00.000Z');

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0); // Questo assicura che sia l'inizio del giorno UTC

    // Confronta i timestamp UTC degli inizi dei giorni per verificare se è lo stesso giorno
    if (ticketValidDayUTC.getTime() !== todayUTC.getTime()) {
      return res.status(400).json({ error: 'Ticket can only be validated on the indicated date.' });
    }
    // --- FINE LOGICA DATA VALIDAZIONE ---

    const updatedTicket = await prisma.ticket.update({
      where: { rawCode },
      data: { status: 'USED' }
    });

    return res.json({ message: 'Ticket successfully validated', ticket: updatedTicket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error during ticket validation' });
  }
});


ticketsRouter.get('/tickets/code/:rawCode', authMiddleware, async (req, res) => {
  const { rawCode } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { rawCode },
      include: {
        ticketType: {
          include: {
            attractions: {
              include: {
                attraction: true
              }
            }
          }
        },
        user: true,
        discount: true
      }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json(formatTicketWithPrice(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving ticket by code' });
  }
});

export default ticketsRouter;