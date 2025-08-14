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


createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<UserLayout />} >
					<Route index element={<Explore />} />
					<Route path='/vendor/:vendorName' element={<VendorInfo />} />
					<Route path='/cart' element={<Cart />} />
					<Route path='/checkout' element={<Checkout />} />
				</Route>

				<Route path="/user" element={<UserProfileLayout />}>
					<Route index element={<Profile />} />
					<Route path='/user/favorite' element={<Favorite />} />
					<Route path='/user/orders' element={<Orders />} />
				</Route>

				<Route path="/vendor" element={<VendorLayout />} >
					<Route path='/vendor/dashboard' element={<Dashboard />} />
					<Route path='/vendor/orders' element={<VendorOrders />} />
					<Route path='/vendor/hours' element={<WorkingHours />} />
					<Route path='/vendor/menu' element={<MenuList />} />
					<Route path='/vendor/analysis' element={<Analysis />} />
					<Route path='/vendor/promotion' element={<Branding />} />
					<Route path='/vendor/delivery' element={<Delivery />} />
					<Route path='/vendor/settings' element={<Settings />} />
				</Route>

				<Route path="/auth" element={<AuthLayout />}>
					<Route path="/auth/login" element={<Login />} />
					<Route path="/auth/register" element={<Register />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>,
)
