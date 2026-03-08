import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrderList = lazy(() => import('./pages/OrderList'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const InventoryDashboard = lazy(() => import('./pages/InventoryDashboard'));
const SupplierManagement = lazy(() => import('./pages/SupplierManagement'));
const AddSupply = lazy(() => import('./pages/AddSupply'));
const SupplyHistory = lazy(() => import('./pages/SupplyHistory'));
const Reports = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Sales = lazy(() => import('./pages/Sales'));
const SalesHistory = lazy(() => import('./pages/SalesHistory'));

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="h-screen flex items-center justify-center dark:bg-gray-950 dark:text-white">Loading...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="sales-history" element={<SalesHistory />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/new" element={<CreateOrder />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="inventory" element={<InventoryDashboard />} />
                    <Route path="suppliers" element={<SupplierManagement />} />
                    <Route path="supplies" element={<SupplyHistory />} />
                    <Route path="supplies/add" element={<AddSupply />} />
                    <Route path="reports" element={<PrivateRoute roles={['Admin']}><Reports /></PrivateRoute>} />
                    <Route path="users" element={<PrivateRoute roles={['Admin']}><UserManagement /></PrivateRoute>} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
