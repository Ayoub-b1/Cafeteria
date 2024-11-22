import mongoose from "mongoose";
import Meal from './Meal.js'; // Import the Meal model

const OrderSchema = new mongoose.Schema({
  client: { type: String, required: true },  // Store user email directly
  meals: [
    {
      meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },  // Make sure 'Meal' is correctly referenced
      quantity: { type: Number, required: true },
    },
  ],
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'completed', 'refused'], 
    default: 'pending' 
  },
  refusedReason: { type: String, default: null },  // Reason for refusal
  createdAt: { type: Date, default: Date.now },
  qrCode: { type: String, default: null },
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
