// 데모 상품 데이터
// const demoProducts = [
//   {
//     id: 1,
//     name: '프리미엄 가죽 재킷',
//     price: 289000,
//     originalPrice: 350000,
//     image:
//       'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
//     rating: 4.8,
//     reviews: 124,
//     isNew: true,
//     isSale: true,
//     category: '아우터',
//   },
//   {
//     id: 2,
//     name: '미니멀 화이트 셔츠',
//     price: 89000,
//     image:
//       'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
//     rating: 4.6,
//     reviews: 89,
//     isNew: false,
//     isSale: false,
//     category: '상의',
//   },
//   {
//     id: 3,
//     name: '스트라이프 니트 스웨터',
//     price: 129000,
//     originalPrice: 159000,
//     image:
//       'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
//     rating: 4.7,
//     reviews: 156,
//     isNew: false,
//     isSale: true,
//     category: '상의',
//   },
// ]

import React, { useEffect, useState } from 'react'
import {
  Search,
  Grid,
  List,
  // Star,
  // Heart,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { Bot } from 'lucide-react'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 👇 페이지 이동을 위한 네비게이터
  const navigate = useNavigate()

  // localStorage에서 토큰 확인하여 로그인 상태 세팅
  useEffect(() => {
    // 1. 로그인 상태 확인
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    // 2. 상품 불러오기
    setLoading(true)
    axios
      .get('/api/products')
      .then((response) => setProducts(response.data))
      .catch((error) => {
        console.error('상품 불러오기 오류:', error)
        setProducts([]) // 오류 시 빈 배열
      })
      .finally(() => setLoading(false))
  }, [])

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">상품을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = async (productId) => {
    try {
      // ① 상품을 장바구니에 추가 (백엔드 API 호출)
      await axios.post(
        '/api/cart',
        {
          productId,
          quantity: 1, // 또는 사용자가 선택한 수량
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      // ② 성공시 장바구니 페이지로 이동
      navigate('/cart')
    } catch (error) {
      alert('장바구니 담기에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-500" />
                전체 상품
              </h1>
              <p className="text-gray-600 mt-1">당신만의 스타일을 찾아보세요</p>
            </div>

            {/* 오른쪽: 상품 개수 + 로그인/회원가입 버튼을 하나의 flex 컨테이너로 묶음 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {products.length}개 상품
              </div>

              {isLoggedIn ? (
                <>
                  <button
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
                    onClick={() => navigate('/mypage')}
                  >
                    마이페이지
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition font-semibold"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition font-semibold"
                    onClick={() => navigate('/login')}
                  >
                    로그인
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-white text-purple-500 border border-purple-500 hover:bg-purple-50 transition font-semibold"
                    onClick={() => navigate('/register')}
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 검색바 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="상품명을 검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* 정렬 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">이름순</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
                <option value="rating">평점순</option>
              </select>

              {/* 뷰 모드 */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="container mx-auto px-4 py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">다른 검색어로 시도해보세요</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className={`group cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden'
                    : 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex items-center gap-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  // 그리드 뷰
                  <>
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                      />
                      {/* 배지들 */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            NEW
                          </span>
                        )}
                        {product.isSale && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            SALE
                          </span>
                        )}
                      </div>
                      {/* 하트 아이콘 */}
                      {/* <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                      </button> */}
                    </div>

                    <div className="p-4">
                      <p className="text-sm text-purple-600 font-medium mb-1">
                        {product.category}
                      </p>
                      <h3
                        className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors"
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* 평점 */}
                      {/* <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviews})
                        </span>
                      </div> */}

                      {/* 가격 */}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">
                              {formatPrice(product.originalPrice)}원
                            </span>
                          )}
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}원
                          </span>
                        </div>
                        <button
                          className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // 리스트 뷰
                  <>
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-xl"
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                      />
                      {product.isNew && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">
                            {product.category}
                          </p>
                          <h3
                            className="font-semibold text-gray-900 text-lg mb-1"
                            onClick={() =>
                              navigate(`/productdetail/${product.id}`)
                            }
                          >
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-2">
                            {/* <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div> */}
                            {/* <span className="text-sm text-gray-600">
                              ({product.reviews})
                            </span> */}
                          </div>
                        </div>

                        <div className="text-right">
                          {product.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}원
                            </div>
                          )}
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}원
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {/* <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                              <Heart className="w-5 h-5 text-gray-600" />
                            </button> */}
                            <button
                              className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors flex items-center gap-2"
                              onClick={() => handleAddToCart(product.id)}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              담기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all font-semibold"
        onClick={() => navigate('/chatbotIntro')}
      >
        <Bot className="w-5 h-5" />
        챗봇 도우미
      </button>
    </div>
  )
}

export default ProductList
