const OrderSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meals: [
      {
        meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
        quantity: { type: Number, required: true },
      },
    ],
    time: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
    status: { 
      type: String, 
      enum: ['pending', 'preparing', 'completed', 'refused'], 
      default: 'pending' 
    },
    refusedReason: { type: String, default: null }, // Reason for refusal
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Order', OrderSchema);
  