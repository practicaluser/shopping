import React, { useState, useEffect } from 'react'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Heart,
  Truck,
  Shield,
} from 'lucide-react'
import axios from 'axios'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useNavigate } from 'react-router-dom'
// , useLocation

// 장바구니 아이템 타입(TypeScript 참고)
// const emptyCartItem = {
//   id: 0,
//   productId: 0,
//   productName: '',
//   productImage: '',
//   quantity: 0,
//   stock: 0,
//   price: 0,
//   originalPrice: null,
// }

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('loading') // loading | error | empty | success
  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [itemToDelete, setItemToDelete] = useState(null)
  // const location = useLocation()
  // const searchParams = new URLSearchParams(location.search)
  // const productId = searchParams.get('productId')

  const navigate = useNavigate()

  // 페이지 이동 (useNavigate 권장)
  const handleGoBack = () => window.history.back()

  // 상품상세 이동
  const handleGoToProduct = (productId) => {
    window.location.href = `/productdetail/${productId}` // 또는 useNavigate()
  }

  // 삭제 모달 오픈
  const handleDeleteRequest = (itemId, productName) => {
    setItemToDelete({ id: itemId, productName })
  }

  // 삭제 확정시
  const confirmRemoveItem = async () => {
    if (!itemToDelete) return
    const { id: itemId } = itemToDelete
    try {
      setUpdatingItems((prev) => new Set([...prev, itemId]))
      await axios.delete(`/api/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      if (cartItems.length === 1) setCurrentView('empty')
      setItemToDelete(null)
    } catch (error) {
      alert('상품 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleCartOrder = async () => {
    try {
      // 1. 주문 생성 (장바구니 전체)
      const { data } = await axios.post(
        '/api/orders',
        null, // body 필요 없음 (백엔드에서 유저의 장바구니 전체 주문)
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      // 2. orderId 받아서 결제 페이지로 이동
      navigate(`/order?mode=cart&orderId=${data.id}`)
    } catch (error) {
      alert('주문 신청이 실패했습니다.')
    }
  }

  // 최초 마운트 시 장바구니 불러오기
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true)
        setError(null)
        setCurrentView('loading')
        const res = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.data || res.data.length === 0) {
          setCartItems([])
          setCurrentView('empty')
        } else {
          setCartItems(res.data)
          setCurrentView('success')
        }
      } catch (err) {
        setError(err.response?.data || err.message || '네트워크 오류')
        setCurrentView('error')
      } finally {
        setLoading(false)
      }
    }
    fetchCartData()
  }, [])

  // 가격 포맷
  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)

  // 수량 조정
  const updateQuantity = async (itemId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return
    try {
      setUpdatingItems((prev) => new Set([...prev, itemId]))
      await axios.put(
        `/api/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      )
    } catch (error) {
      alert('수량 변경에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  // 총액/수량/할인
  const calculateTotal = () =>
    cartItems.reduce((t, i) => t + i.price * i.quantity, 0)
  const calculateTotalQuantity = () =>
    cartItems.reduce((t, i) => t + i.quantity, 0)
  const calculateTotalDiscount = () =>
    cartItems.reduce(
      (t, i) =>
        t + (i.originalPrice ? (i.originalPrice - i.price) * i.quantity : 0),
      0,
    )

  // 에러, 로딩, 빈 화면 처리
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="relative mb-6">
            <ShoppingBag className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-25"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            장바구니를 불러오는 중...
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
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            장바구니를 불러올 수 없습니다
          </h2>
          {/* <p className="text-gray-600 mb-8">{error}</p> */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            다시 시도
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            홈으로 가기
          </button>
        </div>
      </div>
    )
  }

  if (currentView === 'empty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-all mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              돌아가기
            </button>
            <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
          </div>
          {/* 빈 메시지 */}
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-600 mb-8">
              원하는 상품을 장바구니에 담아보세요!
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 메인 장바구니 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-all mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              돌아가기
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
              <p className="text-gray-600 mt-1">
                {calculateTotalQuantity()}개 상품
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
              총 {formatPrice(calculateTotal())}원
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* 상품 이미지 */}
                  <div
                    className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleGoToProduct(item.productId)}
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* 상품 정보 */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleGoToProduct(item.productId)}
                        >
                          {item.productName}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(item.price)}원
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}원
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteRequest(item.id, item.productName)
                        }
                        disabled={updatingItems.has(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {/* 수량 조절 및 합계 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">수량:</span>
                        <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.stock,
                              )
                            }
                            disabled={
                              item.quantity <= 1 || updatingItems.has(item.id)
                            }
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                            {updatingItems.has(item.id) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.stock,
                              )
                            }
                            disabled={
                              item.quantity >= item.stock ||
                              updatingItems.has(item.id)
                            }
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          (재고: {item.stock}개)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(item.price * item.quantity)}원
                        </div>
                        {item.originalPrice && (
                          <div className="text-sm text-red-500">
                            {formatPrice(
                              (item.originalPrice - item.price) * item.quantity,
                            )}
                            원 할인
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="space-y-6">
            {/* 주문 금액 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                주문 요약
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>상품금액</span>
                  <span>
                    {formatPrice(calculateTotal() + calculateTotalDiscount())}원
                  </span>
                </div>
                {calculateTotalDiscount() > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>할인금액</span>
                    <span>-{formatPrice(calculateTotalDiscount())}원</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>배송비</span>
                  <span className="text-green-600">무료</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>총 결제금액</span>
                  <span className="text-blue-600">
                    {formatPrice(calculateTotal())}원
                  </span>
                </div>
              </div>
            </div>

            {/* 구매하기 버튼 */}
            <button
              onClick={() => handleCartOrder()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{formatPrice(calculateTotal())}원 결제하기</span>
            </button>

            {/* 혜택 정보 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                배송 & 혜택
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>무료배송 (전 상품)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Shield className="w-5 h-5 text-green-600" />
                <span>7일 무료 교환/반품</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Heart className="w-5 h-5 text-red-500" />
                <span>정품 보장</span>
              </div>
            </div>

            {/* 계속 쇼핑하기 */}
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
      {/* 삭제 모달 */}
      <AlertDialog.Root
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8 w-80">
            <AlertDialog.Title className="text-lg font-bold mb-4">
              상품 삭제 확인
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-6 text-gray-700">
              '{itemToDelete?.productName}'을(를) 장바구니에서 제거하시겠습니까?
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">
                취소
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                onClick={confirmRemoveItem}
              >
                삭제
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}

export default ShoppingCart
