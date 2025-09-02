import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'
import { App as AntdApp } from 'antd';
import { UserProvider } from './contexts/UserContext';

export const API_BASE_URL = "http://localhost:5000";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdApp>
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider >
      </BrowserRouter>
    </AntdApp>
  </StrictMode>
);
