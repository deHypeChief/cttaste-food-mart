import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import UserLayout from './pages/user/layout'
import Explore from './pages/user/explore'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import AuthLayout from './pages/auth/layout'
import Register from './pages/auth/register'
import VendorInfo from './pages/user/vendorPage'
import VOrder from './pages/public/vorder'
import Cart from './pages/user/cart'
import Checkout from './pages/user/checkout'
import UserProfileLayout from './pages/user/profile/layout'
import Profile from './pages/user/profile/profile'
import Favorite from './pages/user/profile/favorite'
import Orders from './pages/user/profile/orders'
import VendorLayout from './pages/vendor/layout'
import Dashboard from './pages/vendor/dashboard'
import VendorOrders from './pages/vendor/orders'
import WorkingHours from './pages/vendor/workingHours'
import MenuList from './pages/vendor/menuList'
import Analysis from './pages/vendor/analysis'
import Branding from './pages/vendor/branding'
import Delivery from './pages/vendor/delivery'
import Settings from './pages/vendor/settings'
import { AuthProvider } from './contexts/AuthContext.jsx'
import CartProvider from './contexts/CartProvider.jsx'
import ApiDebugger from './components/ApiDebugger.jsx'
import { ProtectedUserRoute, ProtectedVendorRoute, PublicRoute } from './components/ProtectedRoute.jsx'
import { ToastProvider } from './components/toast.jsx'


createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ToastProvider>
			<AuthProvider>
				<CartProvider>
				<BrowserRouter>
				<Routes>
					<Route path="/" element={<UserLayout />} >
						<Route index element={<Explore />} />
						<Route path='/vendor/:vendorName' element={<VendorInfo />} />
						<Route path='/cart' element={<Cart />} />
						<Route path='/checkout' element={<Checkout />} />
					</Route>

					{/* Public vendor order preview route used by WhatsApp quick links */}
					<Route path="/vorder/:id" element={<VOrder />} />

					<Route path="/user" element={
						<ProtectedUserRoute>
							<UserProfileLayout />
						</ProtectedUserRoute>
					}>
						<Route index element={<Profile />} />
						<Route path='profile' element={<Profile />} />
						<Route path='favorite' element={<Favorite />} />
						<Route path='orders' element={<Orders />} />
					</Route>

					<Route path="/vendor" element={
						<ProtectedVendorRoute>
							<VendorLayout />
						</ProtectedVendorRoute>
					} >
						<Route index element={<Dashboard />} />
						<Route path='dashboard' element={<Dashboard />} />
						<Route path='orders' element={<VendorOrders />} />
						<Route path='hours' element={<WorkingHours />} />
						<Route path='menu' element={<MenuList />} />
						<Route path='analysis' element={<Analysis />} />
						<Route path='promotion' element={<Branding />} />
						<Route path='delivery' element={<Delivery />} />
						<Route path='settings' element={<Settings />} />
					</Route>

					<Route path="/auth" element={
						<PublicRoute>
							<AuthLayout />
						</PublicRoute>
					}>
						<Route path="/auth/login" element={<Login />} />
						<Route path="/auth/register" element={<Register />} />
					</Route>
					
					<Route path="/debug" element={<ApiDebugger />} />
				</Routes>
			</BrowserRouter>
				</CartProvider>
		</AuthProvider>
	</ToastProvider>
</StrictMode>,
)
