import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  // Star,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const ProductDetail = () => {
  // 1. URL에서 id 추출
  const { id } = useParams()
  const navigate = useNavigate()

  // 2. 상태 선언
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [currentView, setCurrentView] = useState('loading')

  // 3. 뒤로가기
  const handleGoBack = () => navigate(-1)

  // 4. 데이터 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        setCurrentView('loading')

        // 백엔드에서 상품 fetch
        const response = await axios.get(`/api/products/${id}`)
        setProduct(response.data)
        setCurrentView('success')
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            '상품 정보를 불러올 수 없습니다',
        )
        setCurrentView('error')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  // 5. 별점 렌더링
  // const renderStars = (rating) => {
  //   const stars = []
  //   const fullStars = Math.floor(rating)
  //   const hasHalfStar = rating % 1 !== 0
  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
  //     )
  //   }
  //   if (hasHalfStar) {
  //     stars.push(
  //       <Star
  //         key="half"
  //         className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
  //       />,
  //     )
  //   }
  //   const emptyStars = 5 - Math.ceil(rating)
  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
  //   }
  //   return stars
  // }

  // 6. 가격 포맷
  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)

  // 7. 장바구니
  const handleAddToCart = async (productId) => {
    try {
      // ① 상품을 장바구니에 추가 (백엔드 API 호출)
      await axios.post(
        '/api/cart',
        {
          productId,
          quantity, // 또는 사용자가 선택한 수량
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      // ② 성공시 장바구니 페이지로 이동
      navigate(`/cart`)
    } catch (error) {
      alert('장바구니 담기에 실패했습니다.')
    }
  }

  //7-1 주문하기
  const handleAddToOrder = async (productId) => {
    try {
      const { data } = await axios.post(
        '/api/orders/buy-now',
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      // orderId 받아서 쿼리로 넘김
      navigate(
        `/order?mode=buy-now&productId=${productId}&quantity=${quantity}&orderId=${data.id}`,
      )
    } catch (error) {
      alert('주문 신청이 실패했습니다.')
    }
  }

  // 8. 에러/로딩 UI는 기존 그대로
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-200 mx-auto animate-pulse"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            상품 정보를 불러오는 중...
          </h2>
          <p className="text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }
  if (currentView === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <svg
              className="w-12 h-12 text-red-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-25"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            상품을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              다시 시도
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 9. 메인 상세 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">돌아가기</span>
          </button>

          {localStorage.getItem('token') && (
            <button
              onClick={() => navigate('/mypage')}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>마이페이지</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* 뱃지 */}
              <div className="absolute top-6 left-6 flex flex-col space-y-2">
                {product.isNew && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
                {product.isSale && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    SALE
                  </span>
                )}
              </div>
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-8">
            {/* 카테고리 */}
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
              {product.category}
            </div>
            {/* 상품명 */}
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            {/* 평점 및 리뷰 */}
            {/* <div className="flex items-center space-x-6 p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(product.rating)}</div>
                <span className="text-lg font-bold text-gray-900">
                  {product.rating}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="font-medium">({product.reviews}개 리뷰)</span>
              </div>
            </div> */}
            {/* 가격 */}
            <div className="space-y-3 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}원
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}원
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  % 할인
                </div>
              )}
            </div>
            {/* 상품 설명 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                상품 설명
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* 재고 정보 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">
                재고 현황
              </span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  product.stock > 10
                    ? 'bg-green-100 text-green-700'
                    : product.stock > 0
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
              </span>
            </div>
            {/* 수량 선택 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  수량 선택
                </span>
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors font-bold text-lg"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 border-x-2 border-gray-200 min-w-[4rem] text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors font-bold text-lg"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {/* 구매 버튼 */}
            <div className="space-y-4">
              <button
                onClick={() => handleAddToCart(product.id, quantity)}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none shadow-xl flex items-center justify-center space-x-3"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>{product.stock > 0 ? '장바구니에 담기' : '품절'}</span>
              </button>
              {product.stock > 0 && (
                <button
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-gray-900 hover:to-black transition-all transform hover:scale-105 shadow-xl"
                  onClick={() => handleAddToOrder(product.id, quantity)}
                >
                  바로 구매하기
                </button>
              )}
            </div>
            {/* 배송 및 혜택 정보 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                배송 & 혜택
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">무료배송</div>
                  <div className="text-xs text-gray-500">5만원 이상 구매시</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">7일 무료 교환/반품</div>
                  <div className="text-xs text-gray-500">단순변심도 OK</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">정품 보장</div>
                  <div className="text-xs text-gray-500">100% 정품만 판매</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
