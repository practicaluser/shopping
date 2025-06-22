import React, { useState } from 'react'
import {
  ShoppingBag,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Sparkles,
  IdCard,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  // 유효성 검사 함수들
  const validateUsername = (username) => /^[a-zA-Z0-9]{4,20}$/.test(username)
  const validatePassword = (password) =>
    password.length >= 8 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(password)
  const validatePhone = (phone) =>
    /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(phone.replace(/[^0-9]/g, ''))
  const validateName = (name) =>
    name.length >= 2 && /^[가-힣a-zA-Z\s]+$/.test(name)

  const handleInputChange = (e) => {
    setServerError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 회원가입 처리
  const handleRegister = async () => {
    // (1) 프론트에서 최소한의 필수 검사만 진행
    if (
      !validateUsername(formData.username) ||
      !validatePassword(formData.password) ||
      formData.password !== formData.passwordConfirm ||
      !validateName(formData.name) ||
      !validatePhone(formData.phone)
    ) {
      setServerError('입력 값을 다시 확인하세요.')
      return
    }

    setIsLoading(true)
    setServerError('')
    setSuccess(false)

    try {
      // (2) 실제 API 호출
      const response = await axios.post('/api/auth/register', formData)

      if (response.ok) {
        setSuccess(true)
        setServerError('')
        setFormData({
          username: '',
          password: '',
          passwordConfirm: '',
          name: '',
          phone: '',
        })
        // TODO: 로그인 페이지 이동 등
      } else {
        const errorMessage = await response.text()
        setServerError(errorMessage || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      setServerError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>

      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
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
              새로운 스타일 여정을 시작하세요
              <Sparkles className="w-4 h-4" />
            </p>
          </div>

          {/* 회원가입 폼 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              회원가입
            </h2>

            {/* 서버 에러 메시지 */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {serverError}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                회원가입이 완료되었습니다! 로그인해주세요.
              </div>
            )}

            <div className="space-y-5">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">
                  아이디 *
                </label>
                <div className="relative group">
                  <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-6 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder="user"
                  />
                </div>

                {/* 비밀번호 입력 */}
                <div>
                  <label className="text-sm font-medium text-white/90">
                    비밀번호 *
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-14 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="8자 이상, 영문+숫자"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 비밀번호 확인 입력 */}
                <div>
                  <label className="text-sm font-medium text-white/90">
                    비밀번호 확인 *
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-14 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 이름 입력 */}
                <div>
                  <label className="text-sm font-medium text-white/90">
                    이름 *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="홍길동"
                    />
                  </div>
                </div>

                {/* 휴대폰 번호 입력 */}
                <div>
                  <label className="text-sm font-medium text-white/90">
                    휴대폰 번호 *
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                {/* 회원가입 버튼 */}
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    !isLoading
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02]'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span className="text-lg">회원가입</span>
                    </>
                  )}
                </button>
              </div>

              {/* 로그인 링크 */}
              <div className="mt-6 text-center">
                <p className="text-white/70">
                  이미 계정이 있으신가요?{' '}
                  <Link
                    to="/login"
                    className="text-purple-300 hover:text-purple-200 font-semibold transition-colors hover:underline"
                  >
                    로그인하기
                  </Link>
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
    </div>
  )
}

export default Register
