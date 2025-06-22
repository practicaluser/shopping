// src/admin/pages/ProductsPage.js
import React, { useState, useEffect } from 'react'
import { Package, X, Search, Image as ImageIcon } from 'lucide-react'
import axios from '../../api/axios'

const ProductsPage = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '상의',
    price: '',
    originalPrice: '',
    stock: '',
    status: '판매중',
    image: null,
    isNew: false,
    isSale: false,
  })

  const [products, setProducts] = useState([])

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
  const itemsPerPage = 5
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null) // 수정 대상 상품 객체

  // 상품 목록 불러오기 함수
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products')
      console.log(res.data)
      const withStatus = res.data.map((item) => ({
        ...item,
        status: item.status || '판매중',
      }))
      setProducts(withStatus)
    } catch (err) {
      alert('상품 목록을 불러오지 못했습니다.')
    }
  }
  useEffect(() => {
    fetchProducts()
  }, [])

  // 상품 등록 처리
  const handleAddProduct = async () => {
    // 필수값 검사
    if (
      !newProduct.name ||
      !newProduct.category ||
      newProduct.price === '' ||
      newProduct.stock === '' ||
      !newProduct.status ||
      !newProduct.image
    ) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    setError('')
    try {
      // POST로 백엔드에 상품 등록 요청
      await axios.post('/api/products', {
        ...newProduct,
        price: Number(newProduct.price || newProduct.originalPrice),
        stock: Number(newProduct.stock),
        originalPrice: Number(newProduct.originalPrice || 0),
        isNew: newProduct.isNew,
        isSale: newProduct.isSale,
      })

      setShowAddModal(false)
      setNewProduct({
        name: '',
        category: '상의',
        price: '',
        stock: '',
        status: '판매중',
        image: '',
      })
      setImagePreview(null)
      fetchProducts() // 등록 후 목록 새로고침
    } catch (err) {
      setError('등록에 실패했습니다. (입력값/권한/서버 확인)')
    }
  }

  // 필터링된 상품 목록
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filters.category === 'all' || product.category === filters.category
    const matchesStatus =
      filters.status === 'all' || product.status === filters.status
    const matchesSearch =
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.id.toString().includes(filters.search)

    return matchesCategory && matchesStatus && matchesSearch
  })

  // 페이지네이션
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  const handleDelete = async (id) => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      await axios.put(`/api/products/delete/${id}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // 필요 시
        },
      })

      // 삭제 성공 시 상태 업데이트
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id),
      )
      alert('상품이 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('상품 삭제에 실패했습니다.')
    }
  }

  const handleStatusChange = (id, newStatus) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, status: newStatus } : product,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">상품관리</h2>
          <p className="text-gray-600 mt-1">등록된 상품을 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Package className="w-5 h-5" />
          <span>상품 등록</span>
        </button>
      </div>
      {/* 필터 및 검색 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* 카테고리 필터 */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 카테고리</option>
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="아우터">아우터</option>
              <option value="신발">신발</option>
              <option value="액세서리">액세서리</option>
            </select>

            {/* 판매상태 필터 */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="판매중">판매중</option>
              <option value="품절">품절</option>
              <option value="판매중지">판매중지</option>
            </select>

            {/* 검색 */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="상품명 검색..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            총 {filteredProducts.length}개 상품
          </div>
        </div>
      </div>
      {/* 상품 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이미지
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  재고
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 이미지 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  </td>
                  {/* 상품명/코드 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        상품코드: #{product.id}
                      </div>
                    </div>
                  </td>
                  {/* 카테고리 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  {/* 가격 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₩{product.price.toLocaleString()}
                  </td>
                  {/* 재고 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 10
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}개
                      </span>
                      {product.stock < 10 && product.stock > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          부족
                        </span>
                      )}
                    </div>
                  </td>
                  {/* 상태 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={product.status}
                      onChange={(e) =>
                        handleStatusChange(product.id, e.target.value)
                      }
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-offset-2 ${
                        product.status === '판매중'
                          ? 'bg-green-100 text-green-800 focus:ring-green-500'
                          : product.status === '품절'
                          ? 'bg-red-100 text-red-800 focus:ring-red-500'
                          : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                      }`}
                    >
                      <option value="판매중">판매중</option>
                      <option value="품절">품절</option>
                      <option value="판매중지">판매중지</option>
                    </select>
                  </td>
                  {/* 등록일 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  {/* 관리 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditProduct(product)
                          setShowEditModal(true)
                          setError('')
                        }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 빈 상태 */}
        {currentProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-500">다른 검색어를 입력해보세요</p>
          </div>
        )}
      </div>
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === index + 1
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
      {/* 상품 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">새 상품 등록</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                  setImagePreview(null)
                  setNewProduct({
                    name: '',
                    category: '상의',
                    price: '',
                    stock: '',
                    status: '판매중',
                    image: null,
                    originalPrice: '',
                    isNew: false,
                    isSale: false,
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* 이미지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 이미지
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition">
                    {newProduct.image ? (
                      <img
                        src={newProduct.image}
                        alt="미리보기"
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src =
                            'https://via.placeholder.com/96x96?text=No+Image'
                        }}
                      />
                    ) : (
                      <span className="flex flex-col items-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">이미지 등록</span>
                      </span>
                    )}
                  </label>
                  {newProduct.image && (
                    <button
                      className="text-xs text-gray-400 underline ml-2"
                      onClick={() =>
                        setNewProduct({ ...newProduct, image: '' })
                      }
                      type="button"
                    >
                      이미지 삭제
                    </button>
                  )}
                  <input
                    type="text"
                    className="ml-2 px-2 py-1 border rounded text-sm focus:outline-none"
                    placeholder="이미지 URL 입력"
                    value={newProduct.image || ''}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* 상품명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="상품명을 입력하세요"
                />
              </div>
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="상의">상의</option>
                  <option value="하의">하의</option>
                  <option value="아우터">아우터</option>
                  <option value="신발">신발</option>
                  <option value="액세서리">액세서리</option>
                </select>
              </div>
              {/* 재고 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  재고
                </label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {/* 원래 가격 (originalPrice) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정가 (Original Price)
                </label>
                <input
                  type="number"
                  value={newProduct.originalPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      originalPrice: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {/* 체크박스 - isNew & isSale */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!newProduct.isNew}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, isNew: e.target.checked })
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">신상품</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!newProduct.isSale}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, isSale: e.target.checked })
                    }
                    className="form-checkbox h-5 w-5 text-purple-600"
                  />
                  <span className="text-sm text-gray-700">세일 상품</span>
                </label>
              </div>
              {/* 세일 상품 체크시 현재가(Price) 노출 */}
              {newProduct.isSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재가 (Price)
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="세일가를 입력하세요"
                  />
                </div>
              )}
              {/* 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={newProduct.status}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="판매중">판매중</option>
                  <option value="품절">품절</option>
                  <option value="판매중지">판매중지</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                  setImagePreview(null)
                  setNewProduct({
                    name: '',
                    category: '상의',
                    price: '',
                    stock: '',
                    status: '판매중',
                    image: null,
                    originalPrice: '',
                    isNew: false,
                    isSale: false,
                  })
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">상품 수정</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* 상품명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={editProduct.category}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="상의">상의</option>
                  <option value="하의">하의</option>
                  <option value="아우터">아우터</option>
                  <option value="신발">신발</option>
                  <option value="액세서리">액세서리</option>
                </select>
              </div>
              {/* 정가(Original Price) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정가 (Original Price)
                </label>
                <input
                  type="number"
                  value={editProduct.originalPrice || ''}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      originalPrice: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {/* 체크박스 - isNew & isSale */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!editProduct.isNew}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isNew: e.target.checked,
                      })
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">신상품</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!editProduct.isSale}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isSale: e.target.checked,
                      })
                    }
                    className="form-checkbox h-5 w-5 text-purple-600"
                  />
                  <span className="text-sm text-gray-700">세일 상품</span>
                </label>
              </div>
              {/* 세일 상품 체크시 현재가(Price) 노출 */}
              {editProduct.isSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재가 (Price)
                  </label>
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="세일가를 입력하세요"
                  />
                </div>
              )}
              {/* 재고 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  재고 *
                </label>
                <input
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, stock: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              {/* 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태 *
                </label>
                <select
                  value={editProduct.status}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="판매중">판매중</option>
                  <option value="품절">품절</option>
                  <option value="판매중지">판매중지</option>
                </select>
              </div>
              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL *
                </label>
                <input
                  type="text"
                  value={editProduct.image}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, image: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                {editProduct.image && (
                  <img
                    src={editProduct.image}
                    alt="미리보기"
                    className="w-24 h-24 object-cover mt-2 rounded-lg border"
                  />
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  // 필수값 검사
                  if (
                    !editProduct.name?.trim() ||
                    !editProduct.category?.trim() ||
                    // 세일 상품일 때만 가격 필수 체크
                    (editProduct.isSale
                      ? editProduct.price === '' ||
                        editProduct.price === null ||
                        editProduct.price === undefined
                      : false) ||
                    editProduct.stock === '' ||
                    editProduct.stock === null ||
                    editProduct.stock === undefined ||
                    !editProduct.status?.trim() ||
                    !editProduct.image?.trim()
                  ) {
                    setError('필수 항목을 모두 입력하세요.')
                    return
                  }
                  setError('')
                  try {
                    const reqBody = {
                      ...editProduct,
                      price: Number(
                        editProduct.price || editProduct.originalPrice,
                      ),
                      stock: Number(editProduct.stock),
                      originalPrice: editProduct.originalPrice
                        ? Number(editProduct.originalPrice)
                        : null,
                      isNew: newProduct.isNew,
                      isSale: newProduct.isSale,
                    }
                    await axios.put(
                      `/api/products/${editProduct.id}`,
                      reqBody,
                      { headers: { 'Content-Type': 'application/json' } },
                    )
                    setShowEditModal(false)
                    setEditProduct(null)
                    fetchProducts() // 목록 새로고침
                  } catch (err) {
                    setError('수정에 실패했습니다. (권한/서버/입력값 확인)')
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}
      ``
    </div>
  )
}

export default ProductsPage

// 상품 등록 모달에서 이미지 파일 변경 핸들러
// const handleImageChange = (e) => {
//   const file = e.target.files[0]
//   if (file) {
//     setNewProduct({ ...newProduct, image: file })
//     const reader = new FileReader()
//     reader.onloadend = () => {
//       setImagePreview(reader.result)
//     }
//     reader.readAsDataURL(file)
//   }
// }

//오류 탐지를 위한 코드 (상품명 카테고리 가격 재고 상태 이미지 URL 전부 다 적혀 있었고 수자 값도 0이 아닌데도 수정 버튼을 누르고, 수정하지 않고 수정 완료를 누르면 필수 항목을 모두 입력하세요. 라고 나온다)
// useEffect(() => {
//   if (showEditModal) {
//     console.log('수정대상:', editProduct)
//   }
// }, [showEditModal, editProduct])
