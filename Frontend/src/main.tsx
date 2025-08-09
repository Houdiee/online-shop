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
  role: "customer",
  shoppingCart: {
    id: 1,
    items: [],
  },
  orders: [],
};

export const API_BASE_URL = "https://localhost:5001";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
