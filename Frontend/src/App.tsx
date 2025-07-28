import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import { ConfigProvider, theme } from 'antd';

function App() {
  return (
    <Routes>
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productSlug" element={<ProductDetails />} />
    </Routes>
  )
}

export default App
