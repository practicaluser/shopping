import React, { useState, useEffect } from 'react'
import axios from '../../api/axios'
import {
  User,
  Lock,
  ShoppingBag,
  ShoppingCart,
  UserX,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [userInfo, setUserInfo] = useState(null)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // ========== 실전 API 호출 ==========
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  // 1. 내 정보 불러오기
  const fetchUserInfo = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/auth/me', getAuthHeader())
      setUserInfo(data)
      setEditForm({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: '사용자 정보를 불러오는데 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  // 2. 내 정보 수정
  const updateUserInfo = async () => {
    setLoading(true)
    try {
      // PUT /api/users/me (예: {name, phone, email, address})
      await axios.put('/api/users/me', editForm, getAuthHeader())
      setUserInfo((prev) => ({ ...prev, ...editForm }))
      setIsEditing(false)
      setMessage({ type: 'success', text: '정보가 성공적으로 수정되었습니다.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data || '정보 수정에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  // 3. 비밀번호 변경
  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' })
      return
    }
    setLoading(true)
    console.log(passwordForm.oldPassword)
    try {
      await axios.put(
        '/api/users/password',
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        getAuthHeader(),
      )
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({
        type: 'success',
        text: '비밀번호가 성공적으로 변경되었습니다.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data || '비밀번호 변경에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  // 4. 회원 탈퇴
  const deleteAccount = async () => {
    setLoading(true)
    try {
      await axios.delete('/api/users/me', getAuthHeader())
      setMessage({
        type: 'success',
        text: '회원탈퇴가 완료되었습니다. 메인페이지로 이동합니다.',
      })
      setTimeout(() => {
        localStorage.removeItem('token')
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: '회원탈퇴에 실패했습니다.' })
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }

  // 5. 주문 내역 조회
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/orders', getAuthHeader())
      // 주문일자: createdAt, 상태: status, 금액: totalPrice, 상품목록: items
      setOrders(
        data.map((order) => ({
          id: order.id,
          date: order.createdAt?.substring(0, 10),
          amount: order.totalPrice,
          status: order.status,
          items: order.items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        })),
      )
    } catch (error) {
      setMessage({
        type: 'error',
        text: '주문 내역을 불러오는데 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    fetchOrders()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // ========== 렌더/화면 구성 ==========

  const menuItems = [
    { id: 'profile', label: '내 정보', icon: User },
    { id: 'password', label: '비밀번호 변경', icon: Lock },
    { id: 'orders', label: '주문 내역', icon: ShoppingBag },
    { id: 'cart', label: '장바구니', icon: ShoppingCart },
    { id: 'delete', label: '회원 탈퇴', icon: UserX },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'WAIT_PAYMENT':
        return 'text-yellow-600 bg-yellow-100'
      case '배송중':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">내 정보</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit3 size={16} /> 수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={updateUserInfo}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} /> 저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm(userInfo)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X size={16} /> 취소
                  </button>
                </div>
              )}
            </div>
            {userInfo && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <input
                    type="text"
                    value={userInfo.username}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editForm.name : userInfo.name}
                    onChange={(e) =>
                      isEditing &&
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰번호
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editForm.phone : userInfo.phone}
                    onChange={(e) =>
                      isEditing &&
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={isEditing ? editForm.email : userInfo.email}
                    onChange={(e) =>
                      isEditing &&
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editForm.address : userInfo.address}
                    onChange={(e) =>
                      isEditing &&
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        )
      case 'password':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              비밀번호 변경
            </h2>
            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg pr-12"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg pr-12"
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg pr-12"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={changePassword}
                disabled={
                  loading ||
                  !passwordForm.oldPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
              <p className="text-sm text-gray-500">
                비밀번호는 8자 이상이어야 합니다.
              </p>
            </div>
          </div>
        )
      case 'orders':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">주문 내역</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder === order.id ? null : order.id,
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          주문번호: {order.id}
                        </h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status === 'WAIT_PAYMENT'
                            ? '결제대기'
                            : order.status === 'PAID'
                            ? '결제완료'
                            : order.status}
                        </span>
                        <span className="font-bold text-lg">
                          {order.amount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    {selectedOrder === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-3">
                          주문 상품
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">
                                {item.name} x {item.quantity}
                              </span>
                              <span className="font-medium">
                                {item.price.toLocaleString()}원
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'cart':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <ShoppingCart size={48} className="mx-auto text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">장바구니</h2>
            <p className="text-gray-600 mb-6">
              장바구니에서 상품을 확인하고 주문을 진행하세요.
            </p>
            <button
              onClick={() => (window.location.href = '/cart')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              장바구니 바로가기
            </button>
          </div>
        )
      case 'delete':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">회원 탈퇴</h2>
            <div className="max-w-md">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">
                      회원 탈퇴 안내
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• 탈퇴 시 모든 개인정보가 삭제됩니다.</li>
                      <li>• 주문 내역 및 적립금이 모두 사라집니다.</li>
                      <li>• 탈퇴 후 같은 아이디로 재가입이 불가능합니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                회원 탈퇴하기
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메시지 알림 */}
      {message.text && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          {message.text}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={24} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800">
                  {userInfo?.name || '사용자'}
                </h3>
                <p className="text-sm text-gray-500">{userInfo?.email}</p>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
            {/* 홈으로 가기 버튼 */}
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ⬅ 홈으로 돌아가기
            </button>
          </div>
          {/* 메인 콘텐츠 */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                회원 탈퇴
              </h3>
              <p className="text-gray-600 mb-6">
                정말로 회원 탈퇴하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '탈퇴하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPage
