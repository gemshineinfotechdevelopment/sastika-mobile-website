import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './site/SiteLayout';
import Home from './site/Home';
import Catalog from './site/Catalog';
import ProductDetail from './site/ProductDetail';
import Cart from './site/Cart';
import Checkout from './site/Checkout';
import Confirmation from './site/Confirmation';
import Account from './site/Account';
import Services from './site/Services';
import About from './site/About';
import Contact from './site/Contact';

import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import Inventory from './admin/Inventory';
import ServiceDesk from './admin/ServiceDesk';
import Settings from './admin/Settings';

export default function App() {
  return (
    <Routes>
      {/* Storefront — mobile view */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="mobiles" element={<Catalog kind="phones" />} />
        <Route path="accessories" element={<Catalog kind="accessories" />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="confirmation/:id" element={<Confirmation />} />
        <Route path="account" element={<Account />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Admin — desktop view */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="service" element={<ServiceDesk />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
