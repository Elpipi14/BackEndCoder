import { TicketModel } from "../schema/ticket.model.js";

export default class TicketManager {
    async getTickets() {
        try {
            const tickets = await TicketModel.find();
            return tickets;
        } catch (error) {
            console.error("Error displaying tickets", error);
            throw error;
        }
    }

    async findTicketById(ticketId) {
        try {
            const ticket = await TicketModel.findById(ticketId);
            return ticket;
        } catch (error) {
            console.error("Ticket id not found:", error);
            throw error;
        }
    }

    async deleteTicketById(ticketId) {
        try {
            const deletedTicket = await TicketModel.findByIdAndDelete(ticketId);
            return deletedTicket;
        } catch (error) {
            console.error("Error delete ticket:", error);
            throw error;
        }
    }

    async createTicket(ticketData) {
        try {
            const newTicket = new TicketModel(ticketData);
            await newTicket.save();
            return newTicket;
        } catch (error) {
            console.error("Error creating ticket:", error);
            throw error;
        }
    }

    async getTicketsByUserEmail(email) {
        try {
            const tickets = await TicketModel.find({ buyerEmail: email });
            return tickets;
        } catch (error) {
            console.error("Error fetching tickets by user email", error);
            throw error;
        }
    }

};