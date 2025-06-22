import React, { useState, useMemo, useEffect } from 'react'
import axios from '../../api/axios'
import { Search, Edit2, Trash2, X, Save, UserCheck, Users } from 'lucide-react'

// (더미 데이터는 제거. 실 데이터는 API에서 받아옴)

const MemberManagement = () => {
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [loading, setLoading] = useState(false)

  const itemsPerPage = 10

  // --- API 호출시 토큰 필요하면 localStorage/token 등에서 가져와 헤더에 첨부 ---
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  })

  // 1) 회원 목록 조회
  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/users', {
        headers: getAuthHeaders(),
      })
      // userId -> username, joinDate는 예시로 생성
      setMembers(
        res.data.map((u) => ({
          id: u.id,
          userId: u.username,
          name: u.name,
          phone: u.phone,
          email: u.email,
          address: u.address,
          role: u.role,
          joinDate: '2024-01-01', // 실제 데이터에 맞게
        })),
      )
    } catch (e) {
      console.error(e)
      alert('회원 목록 조회 실패: ' + (e.response?.data || e.message))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line
  }, [])

  // 2) 회원정보 및 권한 수정
  const handleSaveEdit = async () => {
    try {
      // (1) 권한이 변경된 경우 별도 API 호출
      if (selectedMember.role !== editFormData.role) {
        await axios.put(
          `/api/admin/users/${selectedMember.id}/role`,
          JSON.stringify(editFormData.role), // 백엔드가 @RequestBody String role이므로 쌍따옴표 필요
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
          },
        )
      }

      // (2) 이름/연락처/이메일/주소 정보 수정
      await axios.put(
        `/api/admin/users/${selectedMember.id}`,
        {
          name: editFormData.name,
          phone: editFormData.phone,
          email: editFormData.email,
          address: editFormData.address,
        },
        {
          headers: getAuthHeaders(),
        },
      )
      setShowEditModal(false)
      setSelectedMember(null)
      fetchMembers()
    } catch (e) {
      alert('회원 수정 실패')
    }
  }

  // 3) 삭제 실행
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/admin/users/${selectedMember.id}`, {
        headers: getAuthHeaders(),
      })
      setShowDeleteModal(false)
      setSelectedMember(null)
      localStorage.removeItem('token')
      fetchMembers()
    } catch (e) {
      alert('회원 삭제 실패')
    }
  }

  // 필터링 및 검색
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm)
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, searchTerm, roleFilter])

  // 페이지네이션
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // 통계
  const adminCount = members.filter((m) => m.role === 'ADMIN').length
  const userCount = members.filter((m) => m.role === 'USER').length

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              회원관리
            </h1>
            <div className="flex space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">
                  관리자: {adminCount}명
                </span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  일반회원: {userCount}명
                </span>
              </div>
            </div>
          </div>
          {/* 필터 & 검색 */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'ADMIN'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                관리자
              </button>
              <button
                onClick={() => setRoleFilter('USER')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'USER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                일반회원
              </button>
            </div>
            <div className="flex-1 md:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="아이디, 이름, 연락처로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        {/* 회원 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500">로딩중...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      아이디
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권한
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setEditFormData({ ...member })
                            setShowEditModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          수정
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setShowDeleteModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    총{' '}
                    <span className="font-medium">
                      {filteredMembers.length}
                    </span>
                    명 중{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    -
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredMembers.length,
                      )}
                    </span>
                    명 표시
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 수정 모달 --- */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  회원 정보 수정
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이디
                  </label>
                  <input
                    type="text"
                    value={editFormData.userId || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    권한
                  </label>
                  <select
                    value={editFormData.role || 'USER'}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USER">일반회원</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- 삭제 모달 --- */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  회원 삭제
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  정말로 '
                  <span className="font-medium">{selectedMember?.name}</span>'
                  회원을 삭제하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberManagement
