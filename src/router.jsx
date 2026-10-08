import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { Layout } from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/** Old multi-page URLs (/menu.html#sets, /order.html?id=…) keep working */
function Legacy({ to }) {
  const { search, hash } = useLocation();
  return <Navigate replace to={{ pathname: to, search, hash }} />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order', element: <OrderPage /> },
      { path: 'index.html', element: <Legacy to="/" /> },
      { path: 'menu.html', element: <Legacy to="/menu" /> },
      { path: 'checkout.html', element: <Legacy to="/checkout" /> },
      { path: 'order.html', element: <Legacy to="/order" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
