import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import ProductList from './components/ProductList'
import 'bootstrap/dist/css/bootstrap.min.css'
import Cart from './components/Cart'
import Register from './components/Register'
import ProductDetail from './components/ProductDetail'
import Order from './components/Order'
import MyPage from './components/MyPage'
import ChatbotIntro from './components/ChatbotIntro'

// ★ 관리자 전용 import
import AdminApp from './admin/AdminApp'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productdetail/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/chatbotIntro" element={<ChatbotIntro />} />
        {/* ★ 관리자 메인페이지 (대시보드/관리 전체) */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Router>
  )
}

export default App
