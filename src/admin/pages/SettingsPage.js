import React, { useState, useEffect } from 'react'
import {
  User,
  Settings,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import axios from 'axios'

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
})

const SettingsPage = () => {
  // 내 계정 상태
  const [accountData, setAccountData] = useState({
    name: '홍길동',
    email: 'admin@shop.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // 사이트명 상태
  const [siteName, setSiteName] = useState('마이쇼핑몰')
  const [newSiteName, setNewSiteName] = useState('마이쇼핑몰')

  // UI 상태
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // 에러 상태
  const [errors, setErrors] = useState({})

  // 메시지 자동 제거
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // 입력값 검증
  const validateAccount = () => {
    const newErrors = {}

    if (!accountData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }

    if (!accountData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    if (!accountData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }

    if (accountData.newPassword) {
      if (accountData.newPassword.length < 8) {
        newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.'
      }

      if (accountData.newPassword !== accountData.confirmPassword) {
        newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSiteName = () => {
    if (!newSiteName.trim()) {
      setMessage({ type: 'error', text: '사이트명을 입력해주세요.' })
      return false
    }
    return true
  }

  //내 계정 조회
  const fetchMyInformation = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/users/me', {
        headers: getAuthHeaders(),
      })
      // userId -> username, joinDate는 예시로 생성
      setAccountData((prev) => ({
        ...prev,
        name: res.data.name,
        email: res.data.email,
        // 필요하면 phone, address 등도 업데이트
      }))
    } catch (e) {
      console.error(e)
      alert('회원 목록 조회 실패: ' + (e.response?.data || e.message))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMyInformation()
    // eslint-disable-next-line
  }, [])

  // 계정 정보 변경 처리
  const handleAccountSubmit = async () => {
    if (!validateAccount()) return

    setLoading(true)

    try {
      // 실제 API 호출 (여기서는 시뮬레이션)
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          currentPassword: accountData.currentPassword,
          newPassword: accountData.newPassword,
        }),
      })

      // 가짜 API 응답 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (Math.random() > 0.3) {
        // 70% 성공률
        setMessage({
          type: 'success',
          text: '계정 정보가 성공적으로 변경되었습니다.',
        })
        setAccountData({
          ...accountData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        throw new Error('현재 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || '계정 정보 변경에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  // 사이트명 변경 처리
  const handleSiteNameSubmit = async () => {
    if (!newSiteName.trim()) {
      setMessage({ type: 'error', text: '사이트명을 입력해주세요.' })
      return
    }
    setLoading(true)
    try {
      await axios.put(
        '/api/settings/site-name',
        { siteName: newSiteName },
        { headers: getAuthHeaders() },
      )
      setSiteName(newSiteName)
      setMessage({ type: 'success', text: '사이트명이 변경되었습니다.' })
      // (선택) AdminHeader 새로고침 없이 반영하려면 Context 활용, 또는 이벤트 발행
    } catch (e) {
      setMessage({
        type: 'error',
        text: e.response?.data || '사이트명 변경 실패',
      })
    }
    setLoading(false)
  }

  // 최초 사이트명 불러오기
  useEffect(() => {
    axios.get('/api/settings/site-name').then((res) => {
      setSiteName(res.data)
      setNewSiteName(res.data)
    })
  }, [])

  // 입력값 변경 처리
  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            설정
          </h1>
          <p className="text-gray-600 mt-2">
            계정 정보와 사이트 설정을 관리하세요.
          </p>
        </div>

        {/* 메시지 알림 */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('account')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />내 계정
              </button>
              <button
                onClick={() => setActiveTab('site')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'site'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                사이트 설정
              </button>
            </nav>
          </div>
        </div>

        {/* 내 계정 설정 */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              내 계정 설정
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) =>
                      handleAccountChange('name', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="이름을 입력하세요"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) =>
                      handleAccountChange('email', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="이메일을 입력하세요"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호 *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={accountData.currentPassword}
                    onChange={(e) =>
                      handleAccountChange('currentPassword', e.target.value)
                    }
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.currentPassword
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 새 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={accountData.newPassword}
                      onChange={(e) =>
                        handleAccountChange('newPassword', e.target.value)
                      }
                      className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.newPassword
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="새 비밀번호 (8자 이상)"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={accountData.confirmPassword}
                      onChange={(e) =>
                        handleAccountChange('confirmPassword', e.target.value)
                      }
                      className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAccountSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? '저장 중...' : '계정 정보 저장'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사이트 설정 */}
        {activeTab === 'site' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              사이트 설정
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 사이트명
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {siteName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 사이트명 *
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="새로운 사이트명을 입력하세요"
                />
              </div>

              {/* 변경 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSiteNameSubmit}
                  disabled={loading || newSiteName === siteName}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? '변경 중...' : '사이트명 변경'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
