import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import HomePage from './pages/HomePage';
import AccountDetails from './pages/AccountDetails.tsx';
import Dashboard from './pages/Dashboard.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/account" element={<AccountDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id/:variantId" element={<ProductDetails />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
