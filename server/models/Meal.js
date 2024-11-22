import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, enum: [ 'Déjeuner', 'Petit-déjeuner'], required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },  // Track availability
});

const Meal = mongoose.model('Meal', MealSchema);  // Ensure the model is named 'Meal'

export default Meal;
