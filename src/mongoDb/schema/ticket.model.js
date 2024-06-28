import { Schema, model } from "mongoose";

export const ticketsCollection = "tickets";

const ticketSchema = new Schema({
    totalPrice: {
        type: Number,
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: Number
    }],
    dateTime: {
        type: Date,
        default: Date.now
    },
    buyerEmail: {
        type: String,
        required: true
    }
});


export const TicketModel = model(ticketsCollection, ticketSchema);

