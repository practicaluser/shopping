import React, { useState, useEffect } from 'react'
import { Search, Eye, X, AlertTriangle } from 'lucide-react'
// Check
import axios from 'axios'

// Mock 데이터 - 실제 환경에서는 API로 대체
// const mockOrders = [
//   {
//     id: 'ORD-2024-001',
//     orderDate: '2024-06-09',
//     customerName: '김철수',
//     phone: '010-1234-5678',
//     productSummary: '스마트폰 케이스 외 2건',
//     totalAmount: 89000,
//     status: '결제완료',
//     items: [
//       { name: '스마트폰 케이스', quantity: 1, price: 25000 },
//       { name: '무선 이어폰', quantity: 1, price: 64000 },
//     ],
//   },

//   {
//     id: 'ORD-2024-004',
//     orderDate: '2024-06-06',
//     customerName: '최지은',
//     phone: '010-7777-8888',
//     productSummary: '태블릿 거치대',
//     totalAmount: 28000,
//     status: '취소',
//     items: [{ name: '태블릿 거치대', quantity: 1, price: 28000 }],
//   },
//   {
//     id: 'ORD-2024-005',
//     orderDate: '2024-06-05',
//     customerName: '정승호',
//     phone: '010-3333-4444',
//     productSummary: 'USB 케이블 세트',
//     totalAmount: 15000,
//     status: '결제완료',
//     items: [{ name: 'USB 케이블 세트', quantity: 1, price: 15000 }],
//   },
// ]

const OrdersPage = () => {
  // 상태 관리
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [searchField, setSearchField] = useState('전체')

  const ordersPerPage = 10 // 페이지당 주문 수

  useEffect(() => {
    // 주문 목록 조회 API로 교체
    const fetchOrders = async () => {
      const token = localStorage.getItem('adminToken')
      console.log('adminToken:', localStorage.getItem('adminToken'))
      if (!token) {
        alert('토큰이 없습니다. 관리자 로그인을 먼저 확인하세요.')
        return
      }

      try {
        const res = await axios.get('/api/orders/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log(res)

        // 주문 데이터 전체에 amount 추가!
        const calculatedOrders = res.data.map((order) => ({
          ...order,
          amount: order.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
          ),
        }))

        setOrders(calculatedOrders)
        setFilteredOrders(calculatedOrders)
      } catch (err) {
        alert('주문 목록을 불러오지 못했습니다.')
      }
    }

    fetchOrders()
  }, [])

  // 상태 필터 옵션
  const statusOptions = ['전체', '결제완료', '주문대기', '취소']
  // '배송중', '배송완료',

  // 상태별 색상 매핑
  const getStatusColor = (status) => {
    const colors = {
      결제완료: 'bg-blue-100 text-blue-800',
      배송중: 'bg-yellow-100 text-yellow-800',
      배송완료: 'bg-green-100 text-green-800',
      취소: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // 주문 필터링 및 검색
  useEffect(() => {
    let filtered = orders

    // 상태 필터
    if (selectedStatus !== '전체') {
      filtered = filtered.filter((order) => order.status === selectedStatus)
    }

    // 검색 필터
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase()
      const numericSearch = parseInt(searchTerm, 10)
      const isNumeric = !isNaN(numericSearch)
      const cleanPhone = (phone) => phone?.replace(/-/g, '')

      filtered = filtered.filter((order) => {
        switch (searchField) {
          case '주문번호':
            return isNumeric && order.id === numericSearch

          case '주문자명':
            return (
              order.customerName &&
              order.customerName.toLowerCase().includes(normalizedSearch)
            )

          case '연락처':
            return cleanPhone(order.phone)?.includes(
              searchTerm.replace(/-/g, ''),
            )

          case '전체':
          default:
            return (
              (isNumeric && order.id === numericSearch) ||
              (order.customerName &&
                order.customerName.toLowerCase().includes(normalizedSearch)) ||
              cleanPhone(order.phone)?.includes(searchTerm.replace(/-/g, ''))
            )
        }
      })
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [orders, selectedStatus, searchTerm, searchField])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage,
  )

  // 주문 상세 보기
  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  // 주문 취소 처리
  const handleCancelOrder = (order) => {
    setOrderToCancel(order)
    setShowCancelModal(true)
  }

  // 주문 취소 확인
  const confirmCancelOrder = () => {
    setOrders(
      orders.map((order) =>
        order.id === orderToCancel.id ? { ...order, status: '취소' } : order,
      ),
    )
    setShowCancelModal(false)
    setOrderToCancel(null)
  }

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">주문 관리</h1>
          <p className="text-gray-600">
            전체 주문을 조회하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* 상태 필터 버튼 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* 검색 바 */}
          <div className="flex gap-2 items-center mb-4">
            {/* 드롭다운을 왼쪽에 배치 */}
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="py-3 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="전체">전체</option>
              <option value="주문번호">주문번호</option>
              <option value="주문자명">주문자명</option>
              <option value="연락처">연락처</option>
            </select>

            {/* 입력창을 오른쪽에 배치 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 주문 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {currentOrders.length > 0 ? (
            <>
              {/* 데스크톱 테이블 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문번호
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문상품
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제금액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {order.productSummary}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatAmount(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetail(order)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              상세
                            </button>
                            {order.status !== '취소' &&
                              order.status !== '배송완료' && (
                                <button
                                  onClick={() => handleCancelOrder(order)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  취소
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 뷰 */}
              <div className="md:hidden">
                {currentOrders.map((order) => (
                  <div key={order.id} className="border-b border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {order.orderDate}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-900 font-medium">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {order.productSummary}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatAmount(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </button>
                      {order.status !== '취소' &&
                        order.status !== '배송완료' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <X className="w-4 h-4 mr-1" />
                            주문취소
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      총 {filteredOrders.length}개 주문 중{' '}
                      {(currentPage - 1) * ordersPerPage + 1}-
                      {Math.min(
                        currentPage * ordersPerPage,
                        filteredOrders.length,
                      )}
                      개 표시
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === index + 1
                              ? 'text-blue-600 bg-blue-50 border-blue-500'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          } border`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // 빈 상태
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                주문이 없습니다
              </h3>
              <p className="text-gray-500">
                검색 조건을 변경하거나 필터를 재설정해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 주문 상세 모달 */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                주문 상세 정보
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주문번호
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주문일
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.orderDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주문자
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    연락처
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주문 상태
                  </label>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    총 결제금액
                  </label>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {formatAmount(selectedOrder.amount)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문 상품
                </label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          상품명
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          수량
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          금액
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {formatAmount(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 주문 취소 확인 모달 */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                주문 취소 확인
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                주문번호: {orderToCancel.id}
                <br />이 주문을 정말 취소하시겠습니까?
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  아니오
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  예, 취소합니다
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
