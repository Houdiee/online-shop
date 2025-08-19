import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'
import type { User } from './types/user';

export const user: User = {
  id: 1,
  email: "kerimugurlu24@gmail.com",
  firstName: "Kerim",
  lastName: "Kerim",
  role: "admin",
  shoppingCart: {
    id: 1,
    items: [],
    totalCost: 0,
  },
  orders: [],
};

export const API_BASE_URL = "http://localhost:5000";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
