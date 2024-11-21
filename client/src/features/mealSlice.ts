import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the meal type
interface Meal {
  id: number; // or string, depending on your actual id type
  status: string;
  category: string;
  price: string;
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
    setMeals(state, action: PayloadAction<Meal[]>) {
      state.meals = action.payload;
    },
    updateMealStatus(state, action: PayloadAction<{ id: number; category: string; price?: string; available?: boolean }>) {
      const { id, category, price, available } = action.payload;
      const meal = state.meals.find((m) => m.id === id);
      if (meal) {
        if (category) meal.category = category;
        if (price) meal.price = price;
        if (available !== undefined) meal.available = available;
      }
    },
  },
});

export const { setMeals, updateMealStatus } = mealSlice.actions;
export default mealSlice.reducer;
