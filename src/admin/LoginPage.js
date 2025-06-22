import React, { useState } from 'react'
import { Package2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext' // ✅ AuthContext 연결

const LoginPage = () => {
  const { login } = useAuth() // ✅ login 함수 가져오기
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('[LoginPage] 로그인 시도:', credentials)

    setLoading(true)
    setError('')

    try {
      const result = await login(credentials) // ✅ AuthContext의 login() 호출
      console.log('[LoginPage] 로그인 결과:', result)

      if (result.success) {
        console.log('[LoginPage] 로그인 성공, /admin 이동')
        navigate('/admin')
      } else {
        setError(result.message || '로그인 실패')
      }
    } catch (err) {
      console.error('[LoginPage] 예외 발생:', err)
      setError('서버 오류로 로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="text-gray-600 mt-2">쇼핑몰 관리 시스템</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 ID
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>테스트 계정: admin / 1234</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
