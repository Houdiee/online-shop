import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import AccountDetails from './pages/AccountDetails.tsx';
import Dashboard from './pages/Dashboard.tsx';
import CreateProduct from './pages/CreateProduct.tsx';

function App() {
  return (
    <Routes>
      <Route path="/account" element={<AccountDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id/:variantId" element={<ProductDetails />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/create" element={<CreateProduct />} />
    </Routes>
  )
}

export default App
