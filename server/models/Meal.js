import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true }, // Track availability
});

const Meals = mongoose.model('Meal', MealSchema);

export default Meals;