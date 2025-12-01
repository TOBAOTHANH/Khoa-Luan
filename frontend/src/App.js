import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  ProductDetailsPage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  ProfilePage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  OrderDetailsPage,
  TrackOrderPage,
  ShopAllRefunds,
  UserInbox,
} from './routes/Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Store from './redux/store.js';
import { loadSeller, loadUser } from './redux/actions/user';
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopEditProduct,
  ShopAllProducts,
  ShopCreateEvent,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopDashboardUsers,
  ShopDashboardReviews,
} from './routes/ShopRoutes.js';
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
} from './routes/AdminRoutes';
import { useSelector } from 'react-redux';
import { ShopHomePage } from './ShopRoutes.js';
import SellerProtectedRoute from './routes/SellerProtectedRoute';
import ProtectedRoute from './ProtectedRoute';
import { getAllProducts } from './redux/actions/product';
import { getAllEvents } from './redux/actions/event';

import axios from 'axios';
import { server } from './server.js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute.js';
const App = () => {
  const [stripeApikey, setStripeApiKey] = useState('');

  async function getStripeApikey() {
    const { data } = await axios.get(`${server}/payment/stripeapikey`);
    setStripeApiKey(data.stripeApikey);
  }
  const { loading, isAuthenticated } = useSelector((state) => state.user);
  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApikey();
  }, []);
  return (
    <div>
      <BrowserRouter>
        {stripeApikey && (
          <Elements stripe={loadStripe(stripeApikey)}>
            <Routes>
              <Route
                path='/payment'
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Elements>
        )}
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/sign-up' element={<SignupPage />} />
          <Route
            path='/activation/:activation_token'
            element={<ActivationPage />}
          />
          <Route
            path='/seller/activation/:activation_token'
            element={<SellerActivationPage />}
          />

          <Route path='/products' element={<ProductsPage />} />
          <Route path='/product/:id' element={<ProductDetailsPage />} />
          <Route path='/best-selling' element={<BestSellingPage />} />
          <Route path='/events' element={<EventsPage />} />
          <Route path='/faq' element={<FAQPage />} />
          <Route path='/order/success' element={<OrderSuccessPage />} />

          <Route
            path='/checkout'
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/user/order/:id'
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/user/track/order/:id'
            element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/profile'
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/inbox'
            element={
              <ProtectedRoute>
                <UserInbox />
              </ProtectedRoute>
            }
          />

          <Route path='/shop/preview/:id' element={<ShopPreviewPage />} />

          {/* Shop Router */}
          <Route path='/shop-create' element={<ShopCreatePage />} />
          <Route path='/shop-login' element={<ShopLoginPage />} />

          <Route
            path='/shop/:id'
            element={
              <SellerProtectedRoute>
                <ShopHomePage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <SellerProtectedRoute>
                <ShopSettingsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard'
            element={
              <SellerProtectedRoute>
                <ShopDashboardPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-create-product'
            element={
              <SellerProtectedRoute>
                <ShopCreateProduct />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-edit-product/:id'
            element={
              <SellerProtectedRoute>
                <ShopEditProduct />
              </SellerProtectedRoute>
            }
          />

          <Route
            path='dashboard-products'
            element={
              <SellerProtectedRoute>
                <ShopAllProducts />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-orders'
            element={
              <SellerProtectedRoute>
                <ShopAllOrders />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-refunds'
            element={
              <SellerProtectedRoute>
                <ShopAllRefunds />
              </SellerProtectedRoute>
            }
          />

          <Route
            path='/order/:id'
            element={
              <SellerProtectedRoute>
                <ShopOrderDetails />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-create-event'
            element={
              <SellerProtectedRoute>
                <ShopCreateEvent />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='dashboard-events'
            element={
              <SellerProtectedRoute>
                <ShopAllEvents />
              </SellerProtectedRoute>
            }
          />

          <Route
            path='dashboard-coupouns'
            element={
              <SellerProtectedRoute>
                <ShopAllCoupouns />
              </SellerProtectedRoute>
            }
          />

          <Route
            path='/dashboard-withdraw-money'
            element={
              <SellerProtectedRoute>
                <ShopWithDrawMoneyPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='/dashboard-messages'
            element={
              <SellerProtectedRoute>
                <ShopInboxPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='/dashboard-users'
            element={
              <SellerProtectedRoute>
                <ShopDashboardUsers />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='/dashboard-reviews'
            element={
              <SellerProtectedRoute>
                <ShopDashboardReviews />
              </SellerProtectedRoute>
            }
          />
          <Route
            path='/admin/dashboard'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-users'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardUsers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-sellers'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardSellers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-orders'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-products'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardProducts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-events'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardEvents />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin-withdraw-request'
            element={
              <ProtectedAdminRoute>
                <AdminDashboardWithdraw />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
        />
      </BrowserRouter>
    </div>
  );
};

export default App;
