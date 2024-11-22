import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the meal type based on MealCardProps
interface Meal {
  id: number; // Identifier for the meal
  name: string;
  image: string;
  price: string;
  category: string;
  feedbacks: {
    _id: number;
    user: { name: string; email: string };
    stars: number;
    date: Date;
    feedback: string;
  }[];
  available: boolean;
}

interface MealState {
  meals: Meal[];
}

const initialState: MealState = {
  meals: [],
};

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    // Set all meals
    setMeals(state, action: PayloadAction<Meal[]>) {
      state.meals = action.payload;
    },

    // Update specific meal properties by id
    updateMeal(state, action: PayloadAction<{ id: number; updates: Partial<Omit<Meal, 'id'>> }>) {
      const { id, updates } = action.payload;
      const meal = state.meals.find((m) => m.id === id);
      if (meal) {
        Object.assign(meal, updates); // Update the meal with new properties
      }
    },
  },
});

export const { setMeals, updateMeal } = mealSlice.actions;
export default mealSlice.reducer;
