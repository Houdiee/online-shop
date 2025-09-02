import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import AccountDetails from './pages/AccountDetails.tsx';
import Dashboard from './pages/Dashboard.tsx';
import CreateProduct from './pages/CreateProduct.tsx';
import LoginPage from './pages/Login.tsx';
import SignupPage from './pages/Signup.tsx';
import { useContext, useEffect } from 'react';
import { UserContext } from './contexts/UserContext.tsx';

const ProtectedRoute = ({ children }: any) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      window.history.back();
    }
  }, [navigate]);

  if (user && user.role === 'Admin') {
    return children;
  }

  return null;
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/account" element={<Navigate to="/account/details" replace />} />
      <Route path="/account/details" element={<AccountDetails />} />
      <Route path="/account/orders" element={<AccountDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id/:variantId" element={<ProductDetails />} />

      <Route path="/admin/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      <Route path="/admin/create" element={<ProtectedRoute> <CreateProduct /> </ProtectedRoute>} />
      <Route path="/admin/edit/:productId" element={<ProtectedRoute><CreateProduct /> </ProtectedRoute>} />
    </Routes>
  );
}

export default App;
