import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import AccountDetails from './pages/AccountDetails.tsx';
import Dashboard from './pages/Dashboard.tsx';
import CreateProduct from './pages/CreateProduct.tsx';
import LoginPage from './pages/Login.tsx';
import { useContext, useEffect } from 'react';
import { UserContext } from './contexts/UserContext.tsx';

const ProtectedRoute = ({ children }: any) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.history.back();
    }
  }, [navigate]);

  if (user && user.role === 'admin') {
    return children;
  }

  return null;
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/account" element={<AccountDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id/:variantId" element={<ProductDetails />} />

      <Route path="/admin/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      <Route path="/admin/create" element={<ProtectedRoute> <CreateProduct /> </ProtectedRoute>} />
      <Route path="/admin/edit/:productId" element={<ProtectedRoute><CreateProduct /> </ProtectedRoute>} />
    </Routes>
  );
}

export default App;
