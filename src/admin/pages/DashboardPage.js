import React, { useEffect, useState } from 'react'
import {
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  Bell,
  Package,
  // TrendingUp,
  // TrendingDown,
} from 'lucide-react'
import axios from '../api/axios'

const AdminDashboard = () => {
  // State
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // 인증 헤더 (토큰)
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  })

  // 데이터 불러오기
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // 1. 통계
        const statsRes = await axios.get('/api/admin/today-stats', {
          headers: getAuthHeaders(),
        })
        setStats(statsRes.data)

        // 2. 최근 주문
        const ordersRes = await axios.get('/api/orders/admin?size=10', {
          headers: getAuthHeaders(),
        })
        setRecentOrders(
          (ordersRes.data || []).map((order) => ({
            id: order.id,
            customer: order.customerName || order.username || '알수없음',
            amount: `₩${order.totalPrice?.toLocaleString() || '0'}`,
            status: order.statusKor || order.status, // 백엔드에 statusKor 있으면 한글
            statusColor:
              order.status === 'DELIVERING'
                ? 'bg-blue-100 text-blue-800'
                : order.status === 'COMPLETED'
                ? 'bg-gray-100 text-gray-800'
                : order.status === 'PAID'
                ? 'bg-green-100 text-green-800'
                : order.status === 'ORDERED'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800',
            time: order.orderDate || order.createdAt || '',
          })),
        )

        // 3. 알림 (예시: 없으면 직접 만들거나 생략)
        // try {
        //   const notifRes = await axios.get('/api/admin/notifications', {
        //     headers: getAuthHeaders(),
        //   })
        //   console.log(notifRes.data)
        //   setNotifications(notifRes.data || [])
        // } catch (e) {
        //   setNotifications([])
        // }
      } catch (e) {
        alert('대시보드 데이터 조회 실패')
        setStats(null)
        setRecentOrders([])
        setNotifications([])
      }
      setLoading(false)
    }
    fetchDashboardData()
    // eslint-disable-next-line
  }, [])

  // 로딩
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        대시보드 데이터 불러오는 중...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        대시보드 데이터가 없습니다.
      </div>
    )
  }

  // 통계 카드 구성
  const statCards = [
    {
      title: '오늘 주문',
      value: stats.todayOrderCount ?? '-',
      change: stats.orderChangeText ?? '', // +12% 등
      changeType: stats.orderChangeType ?? 'increase', // increase, decrease, warning
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: '오늘 매출',
      value: `₩${Number(stats.todaySales ?? 0).toLocaleString()}`,
      change: stats.salesChangeText ?? '', // +8.5%
      changeType: stats.salesChangeType ?? 'increase',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: '신규 회원',
      value: stats.todayNewUsers ?? '-',
      change: stats.userChangeText ?? '', // -2%
      changeType: stats.userChangeType ?? 'decrease',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: '재고 부족',
      value: stats.lowStockCount ?? '-',
      change: stats.lowStockChangeText ?? '+0',
      changeType: stats.lowStockChangeType ?? 'warning',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  const StatCard = ({ stat }) => {
    const Icon = stat.icon
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
          <div className={`${stat.color} rounded-full p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {/* {stat.changeType === 'increase' && (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          )}
          {stat.changeType === 'decrease' && (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )} */}
          {/* <span
            className={`text-sm font-medium ${
              stat.changeType === 'increase'
                ? 'text-green-600'
                : stat.changeType === 'decrease'
                ? 'text-red-600'
                : 'text-orange-600'
            }`}
          >
            {stat.change}
          </span> */}
          {/* <span className="text-sm text-gray-500 ml-1">전일 대비</span> */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최근 주문 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  최근 주문
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  전체 보기
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.statusColor}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 알림 박스 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                시스템 알림
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notifications.length === 0 && (
                  <div className="text-sm text-gray-500">알림이 없습니다.</div>
                )}
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'warning'
                          ? 'bg-orange-400'
                          : notification.type === 'success'
                          ? 'bg-green-400'
                          : 'bg-blue-400'
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium text-center">
                모든 알림 보기
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
