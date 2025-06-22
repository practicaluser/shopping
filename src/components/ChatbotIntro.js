import React, { useState } from 'react'
import {
  MessageCircle,
  ShoppingBag,
  // Code,
  AlertTriangle,
  // Layers,
  // Users,
  // Target,
  // TrendingUp,
  // FileText,
  Sparkles,
  Send,
} from 'lucide-react'
import axios from 'axios'
// import  {useEffect } from 'react'

const ChatbotIntro = () => {
  // 1. 주요 기능 리스트
  const features = [
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: '쇼핑몰의 주요 기능 설명',
      description: '상품 관리, 주문 처리, 결제 시스템 등',
    },
    // {
    //   icon: <Code className="w-5 h-5" />,
    //   title: '구현 과정 (React, Spring 활용)',
    //   description: '프론트엔드와 백엔드 개발 과정',
    // },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: '발생한 오류 및 해결 방법',
      description: '개발 중 마주한 문제와 해결 과정',
    },
    // {
    //   icon: <Layers className="w-5 h-5" />,
    //   title: '기술 선택 이유 / 아키텍처 설명',
    //   description: '기술 스택과 시스템 구조 설계',
    // },
    // {
    //   icon: <Users className="w-5 h-5" />,
    //   title: '프로젝트에서 맡은 역할과 기여도',
    //   description: '팀 내 역할과 개인 기여 부분',
    // },
    // {
    //   icon: <Target className="w-5 h-5" />,
    //   title: '가장 어려웠던 문제와 해결 방법',
    //   description: '핵심 도전 과제와 해결 전략',
    // },
    // {
    //   icon: <TrendingUp className="w-5 h-5" />,
    //   title: '이 프로젝트를 통해 성장한 점',
    //   description: '기술적 성장과 배운 점들',
    // },
    // {
    //   icon: <FileText className="w-5 h-5" />,
    //   title: '전체 개발 경험 요약',
    //   description: '프로젝트 전반적인 개발 경험',
    // },
  ]

  // 2. 입력값 및 전송 상태 관리
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // 입력값, 응답 상태 추가
  const [chatHistory, setChatHistory] = useState([]) // Q&A 기록

  // 3. 입력창 전송 함수
  const handleSend = async (questionText) => {
    const textToSend = questionText !== undefined ? questionText : input
    if (!textToSend.trim()) return
    setSending(true)

    // 질문 히스토리 업데이트
    const nextHistory = [...chatHistory, { type: 'question', text: textToSend }]
    const lastHistory = nextHistory.slice(-6)

    setChatHistory(nextHistory)

    try {
      const res = await axios.post('/api/chatbot', {
        question: textToSend,
        history: lastHistory,
      })
      setChatHistory((prev) => [
        ...prev,
        { type: 'answer', text: res.data.answer },
      ])
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        { type: 'answer', text: '⚠️ 답변을 불러오는 데 실패했습니다.' },
      ])
    }
    setInput('')
    setSending(false)
  }

  // 4. 엔터키 전송 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 5 React에서 카드 클릭 시 자동으로 질문 입력(  카드 클릭 핸들러 추가 예시)
  const handleFeatureClick = (featureTitle) => {
    let defaultQuestion = ''
    if (featureTitle.includes('주요 기능')) {
      defaultQuestion = '우리 쇼핑몰의 주요 기능을 자세히 설명해줘.'
    } else if (featureTitle.includes('오류') || featureTitle.includes('해결')) {
      defaultQuestion = '프로젝트에서 발생한 오류 및 해결 방법을 알려줘.'
    }
    setInput(defaultQuestion)
    handleSend(defaultQuestion)
  }

  // 스타일
  const AVATAR_BOT = 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' // 챗봇 아이콘
  const AVATAR_USER = 'https://cdn-icons-png.flaticon.com/512/921/921347.png' // 사용자 아이콘(남성 예시)

  const ChatBubble = ({ type, children }) => {
    const isUser = type === 'question'
    return (
      <div
        className={
          `flex items-end mb-4 ` + (isUser ? 'justify-end' : 'justify-start')
        }
      >
        {/* Avatar */}
        {!isUser && (
          <img
            src={AVATAR_BOT}
            alt="bot"
            className="w-8 h-8 rounded-full border-2 border-blue-400 shadow-sm mr-2 animate-fadeIn"
          />
        )}
        <div
          className={
            `relative max-w-[70%] px-5 py-3 rounded-2xl text-base ` +
            (isUser
              ? 'bg-blue-600 text-white rounded-br-none shadow-md animate-slideInRight'
              : 'bg-gradient-to-br from-purple-100 to-blue-50 text-gray-800 rounded-bl-none border border-blue-200 shadow-sm animate-slideInLeft')
          }
        >
          {/* 말풍선 꼬리 */}
          {!isUser && (
            <span className="absolute left-[-10px] top-3 w-4 h-4 bg-purple-100 rounded-tl-full rounded-bl-full rotate-45 border-l border-t border-blue-200"></span>
          )}
          {isUser && (
            <span className="absolute right-[-10px] top-3 w-4 h-4 bg-blue-600 rounded-tr-full rounded-br-full rotate-45"></span>
          )}

          {/* 내용 (줄바꿈 + 마크다운 강조) */}
          <div className="whitespace-pre-line">{children}</div>
        </div>
        {isUser && (
          <img
            src={AVATAR_USER}
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-gray-300 ml-2 shadow-sm animate-fadeIn"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              👋 안녕하세요!
            </h1>
            <p className="text-blue-100 text-center text-lg">
              이 쇼핑몰 프로젝트의 챗봇입니다
            </p>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  아래와 같은 내용을 물어볼 수 있어요
                </h2>
                <Sparkles className="w-6 h-6 text-purple-500 ml-2" />
              </div>
              <p className="text-gray-600">
                궁금한 점을 클릭하거나 자유롭게 질문해주세요!
              </p>
            </div>

            {/* 기능 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => handleFeatureClick(feature.title)} // 카드 클릭시 입력창에 자동 입력
                  className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-3 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      <div className="text-blue-600 group-hover:text-blue-700">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 안내 + 입력창 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="text-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  💬 궁금한 점을 아래 입력창에 자유롭게 입력해 주세요!
                </h3>
                <p className="text-sm text-gray-600">
                  프로젝트에 대한 모든 것을 상세히 알려드릴게요
                </p>
              </div>
              <form
                className="mt-6 flex items-center justify-center"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <input
                  type="text"
                  className="w-full max-w-lg px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none mr-2 text-base"
                  placeholder="여기에 질문을 입력하세요..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition disabled:opacity-60"
                  title="질문 전송"
                >
                  <Send className="w-5 h-5 mr-1" />
                  전송
                </button>
              </form>
              {/* Q&A 내역 */}
              <div className="mt-6 space-y-3 max-h-80 overflow-y-auto transition-all duration-300">
                {chatHistory.map((msg, i) => (
                  <ChatBubble type={msg.type} key={i}>
                    {msg.type === 'answer'
                      ? msg.text.split('\n').map((line, idx) => (
                          // 체크리스트/코드블록/볼드 등 간단 강조 처리
                          <div key={idx}>
                            {line.startsWith('* ') ? (
                              <span className="pl-2 before:content-['✔️'] before:mr-2 font-semibold text-green-700">
                                {line.replace(/^\* /, '')}
                              </span>
                            ) : line.startsWith('- ') ? (
                              <span className="pl-2 before:content-['•'] before:mr-2 text-blue-700">
                                {line.replace(/^- /, '')}
                              </span>
                            ) : line.startsWith('**') && line.endsWith('**') ? (
                              <b className="text-purple-700">
                                {line.replace(/\*\*/g, '')}
                              </b>
                            ) : line.startsWith('`') && line.endsWith('`') ? (
                              <code className="bg-gray-200 px-1 rounded text-xs text-gray-800">
                                {line.replace(/`/g, '')}
                              </code>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        ))
                      : msg.text}
                  </ChatBubble>
                ))}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>🛍️ E-Commerce Project</span>
              <span>•</span>
              <span>React + Spring Boot</span>
              <span>•</span>
              <span>Portfolio Chatbot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotIntro
