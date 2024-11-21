import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the order type
interface Order {
  id: number; // or string, depending on your actual id type
  status: string;
  refusedReason?: string; // Optional field, only present when the status is 'refused'
}

interface OrderState {
  orders: Order[];
}

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    updateOrderStatus(state, action: PayloadAction<{ id: number; status: string; refusedReason?: string }>) {
      const { id, status, refusedReason } = action.payload;
      const order = state.orders.find((o) => o.id === id);
      if (order) {
        order.status = status;
        if (status === 'refused') {
          order.refusedReason = refusedReason;
        }
      }
    },
  },
});

export const { setOrders, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
