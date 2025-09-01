import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'
import { App as AntdApp } from 'antd';
import type { User } from './types/user';

export const user: User | null = null;

export const API_BASE_URL = "http://localhost:5000";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdApp>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AntdApp>
  </StrictMode>
);
