import React, { useState } from 'react'
import {
  ShoppingBag,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  User,
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // 의도 ①: 비동기 처리 중 로딩 상태 표시
  // 의도 ②: 중복 클릭 방지 및 UX 향상
  // 회원가입, 결제, 데이터 전송 등 비동기 요청이 있는 모든 버튼에 널리 사용
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setIsLoading(true)
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      })
      localStorage.setItem('token', response.data)
      navigate('/')
      alert('로그인 성공!')
    } catch (error) {
      alert('로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>

      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 로고 및 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Style
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Shop
              </span>
            </h1>
            <p className="text-purple-200 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              당신만의 스타일을 찾아보세요
              <Sparkles className="w-4 h-4" />
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">
                  아이디
                </label>
                <div className="relative group">
                  {/* User 아이콘으로 변경 */}
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-6 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 outline-none text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder="user"
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">
                  비밀번호
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 outline-none text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder=" ••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 비밀번호 찾기 링크 */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-purple-300 hover:text-purple-200 font-medium transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              {/* 로그인 버튼 */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-lg">로그인</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* 소셜 로그인 */}
            {/* <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/70">
                    또는 다음으로 계속하기
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="ml-3 text-sm font-medium text-white group-hover:text-purple-200">
                    Facebook
                  </span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="ml-3 text-sm font-medium text-white group-hover:text-purple-200">
                    Google
                  </span>
                </button>
              </div>
            </div> */}

            {/* 회원가입 링크 */}
            <div className="mt-8 text-center">
              <p className="text-white/70">
                아직 계정이 없으신가요?{' '}
                <button className="text-purple-300 hover:text-purple-200 font-semibold transition-colors hover:underline">
                  회원가입하기
                </button>
              </p>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-center mt-8 text-sm text-white/50">
            <p>© 2025 StyleShop. 모든 권리 보유.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
