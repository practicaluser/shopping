import React from 'react'
// { useState }

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  // BarChart3,
  Settings,
  Package2,
  X,
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'products', label: '상품관리', icon: Package },
  { id: 'orders', label: '주문관리', icon: ShoppingCart },
  { id: 'users', label: '회원관리', icon: Users },
  // { id: 'analytics', label: '통계분석', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: Settings },
]

const AdminSidebar = ({ isOpen, onClose, currentPage, setCurrentPage }) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
    )}
    <div
      className={`
      fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <Package2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin</h2>
            <p className="text-xs text-gray-500">관리 시스템</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  </>
)

export default AdminSidebar
