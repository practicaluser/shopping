import React, { useState, useEffect } from 'react'
import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'

import axios from 'axios'

const AdminHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [siteName, setSiteName] = useState('쇼핑몰 관리자페이지')

  useEffect(() => {
    axios
      .get('/api/settings/site-name')
      .then((res) => setSiteName(res.data))
      .catch((err) => {
        console.error('사이트명 요청 에러', err, err.response)
        setSiteName('쇼핑몰 관리자페이지')
      })
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{siteName}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button> */}
          {/* <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button> */}
          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">관리자</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-600"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
