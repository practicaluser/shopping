import React, { useState, useEffect } from 'react'
import axios from '../../api/axios'
import {
  // ShoppingCart,
  CreditCard,
  // Truck,
  MapPin,
  // User,
  // Phone,
  // Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Package,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const mode = searchParams.get('mode') === 'buy-now' ? 'buy-now' : 'cart'
  const productId = searchParams.get('productId')
  const orderId = searchParams.get('orderId')
  const quantityParam = parseInt(searchParams.get('quantity') || '1', 10)
  const [showAlert, setShowAlert] = useState(false)

  // 상태 관리
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found in localStorage')
          return
        }

        const { data } = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log(data)
        setShippingInfo({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
        })
      } catch (e) {
        console.error('Failed to fetch user info:', e)
      }
    }
    fetchUserInfo()
  }, [])

  const handleConfirmYes = async () => {
    try {
      const token = localStorage.getItem('token')

      // 바로구매 모드일 때만 따로 장바구니에 추가
      if (mode === 'buy-now' && productId) {
        await axios.post(
          '/api/cart',
          {
            productId: Number(productId),
            quantity: quantityParam, // 사용자가 선택한 수량 (state/param에서 가져온 값)
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      }
      // 성공 후 뒤로 가기 or 원하는 페이지 이동
      navigate('/cart')
    } catch (error) {
      alert('장바구니에 담기에 실패했습니다.')
    }
  }

  const handleConfirmNo = async () => {
    await axios.delete(`/api/orders/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    navigate('/')
  }

  // 주문 상품 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        let items = []
        const token = localStorage.getItem('token')
        if (mode === 'buy-now' && productId) {
          const { data } = await axios.get(`/api/products/${productId}`)
          items = [
            {
              id: data.id,
              name: data.name,
              image: data.image,
              price: data.price,
              originalPrice: data.originalPrice,
              discount: data.originalPrice
                ? data.originalPrice - data.price
                : 0,
              quantity: quantityParam,
              stock: data.stock,
            },
          ]
          setOrderItems(items)
        } else {
          const { data } = await axios.get(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          console.log('✅ 주문 데이터:', data)

          if (!data.items || !Array.isArray(data.items)) {
            throw new Error('응답에 items가 없습니다.')
          }

          setOrderItems(
            data.items.map((item) => ({
              id: item.productId,
              name: item.productName,
              image: item.productImage,
              price: item.price,
              originalPrice: item.originalPrice,
              discount: item.originalPrice
                ? item.originalPrice - item.price
                : 0,
              quantity: item.quantity,
              stock: item.stock,
            })),
          )
        }
      } catch (e) {
        console.error('❌ 주문 데이터 로딩 실패:', e)
        if (e.response) {
          console.error('응답 코드:', e.response.status)
          console.error('응답 본문:', e.response.data)
        }
        setError('주문할 상품 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line
  }, [mode, productId, quantityParam])

  // 가격 계산
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0,
  )
  const totalDiscount = orderItems.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0,
  )
  const shippingFee = subtotal >= 50000 ? 0 : 3000
  const totalPrice = subtotal + shippingFee - totalDiscount

  // 주문 처리
  const handleOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      let apiUrl = '',
        reqBody = null
      const headers = { Authorization: `Bearer ${token}` }

      apiUrl = '/api/payments'
      reqBody = {
        orderId: orderId,
        productId: orderItems[0].id,
        quantity: orderItems[0].quantity,
      }

      // if (mode === 'buy-now') {
      //   apiUrl = '/api/payments'
      //   reqBody = {
      //     productId: orderItems[0].id,
      //     quantity: orderItems[0].quantity,
      //   }
      // } else {
      //   apiUrl = '/api/payments'
      //   reqBody = null
      // }

      // 주소가 없는 경우 예외 처리
      // if (!shippingInfo.address || shippingInfo.address.trim() === '') {
      //   setError('주소가 입력되지 않았습니다. 주소를 입력해 주세요.')
      //   setLoading(false)
      //   return
      // }

      // 사용자 정보 업데이트 (주소 포함)
      await axios.put(
        '/api/users/me',
        {
          name: shippingInfo.name,
          address: shippingInfo.address,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const response = await axios.post(apiUrl, reqBody, { headers })
      setOrderResult(response.data)
      setOrderComplete(true)
    } catch (err) {
      setError('주문 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 주문 완료 UI
  if (orderComplete && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              주문이 완료되었습니다!
            </h1>
            <p className="text-gray-600 mb-8">
              주문번호:{' '}
              <span className="font-semibold text-blue-600">
                #{orderResult.id}
              </span>
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">주문 상품</h3>
              {orderResult.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mb-3 last:mb-0"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">{item.quantity}개</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                주문내역 보기
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 주문서 화면
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowAlert(true)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">주문/결제</h1>
              <div className="flex-1" />
              <div className="text-sm text-gray-500">
                {mode === 'buy-now' ? '바로구매' : '장바구니 주문'}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 주문 상품 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">주문 상품</h2>
                  <span className="text-sm text-gray-500">
                    ({orderItems.length}개)
                  </span>
                </div>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            {item.price.toLocaleString()}원
                          </span>
                          {item.discount > 0 && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                {item.originalPrice?.toLocaleString()}원
                              </span>
                              <span className="text-sm text-red-600 font-semibold">
                                -{item.discount.toLocaleString()}원
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            수량: {item.quantity}개
                          </span>
                          <span className="font-bold text-lg text-gray-900">
                            {(item.price * item.quantity).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 배송 정보 ... (기존 코드 활용, 생략 가능) */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    배송지 정보
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      받는 분
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        setShippingInfo((info) => ({
                          ...info,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-3 border rounded-xl"
                      placeholder="이름"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      주소
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo((info) => ({
                          ...info,
                          address: e.target.value,
                        }))
                      }
                      className="w-full p-3 border rounded-xl"
                      placeholder="주소"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      연락처
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo((info) => ({
                          ...info,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full p-3 border rounded-xl"
                      placeholder="연락처"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo((info) => ({
                          ...info,
                          email: e.target.value,
                        }))
                      }
                      className="w-full p-3 border rounded-xl"
                      placeholder="이메일"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* 결제 정보 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">결제 정보</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-semibold">
                      {subtotal.toLocaleString()}원
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">할인 금액</span>
                      <span className="font-semibold text-red-600">
                        -{totalDiscount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">배송비</span>
                    <span className="font-semibold">
                      {shippingFee === 0
                        ? '무료'
                        : `${shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">
                      총 결제 금액
                    </span>
                    <span className="font-bold text-blue-600 text-xl">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleOrder}
                  disabled={loading || orderItems.length === 0}
                  className="w-full mt-6 bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      주문 처리중...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {totalPrice.toLocaleString()}원 결제하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AlertDialog 모달 */}
      <AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8 w-80">
            <AlertDialog.Title className="text-lg font-bold mb-4">
              주문 정보를 장바구니에 복원하시겠습니까?
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-6 text-gray-700">
              예를 누르면 주문 정보가 장바구니로 복원됩니다. <br />
              아니요를 누르면 장바구니에 저장된 정보가 삭제됩니다.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">
                취소
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                onClick={handleConfirmYes}
              >
                예
              </AlertDialog.Action>
              <AlertDialog.Action
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                onClick={handleConfirmNo}
              >
                아니요
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}

export default CheckoutPage
