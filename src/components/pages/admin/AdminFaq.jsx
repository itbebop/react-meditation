import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase_config";
import { Edit, Save, Plus, Trash2, X } from "lucide-react";

export default function AdminFaq() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]); // Firestore에서 가져온 카테고리
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // FAQ 추가 모드 상태
  const [newFaq, setNewFaq] = useState({
    faqId: "",
    category: "",
    question: "",
    answer: "",
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false); // 카테고리 추가 모드 상태
  const [newCategory, setNewCategory] = useState(""); // 새 카테고리 입력 상태
  const [selectedCategories, setSelectedCategories] = useState([]); // 선택된 카테고리 상태
  const [editingCategory, setEditingCategory] = useState(null); // 편집 중인 카테고리 데이터

  // FAQ 데이터 로드
  const loadFaqs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "faqs"));
      const faqData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFaqs(faqData);
    } catch (error) {
      console.error("FAQ 로드 오류:", error);
    }
  };

  // 카테고리 데이터 로드
  const loadCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "faqCategories"));
      const categoryData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoryData);
    } catch (error) {
      console.error("카테고리 로드 오류:", error);
    }
  };

  useEffect(() => {
    loadFaqs();
    loadCategories();
  }, []);

  // 체크박스 핸들러
  const handleCheckboxChange = (faqId) => {
    setSelectedFaqs((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId]
    );
  };

  // FAQ 수정 시작
  const handleEditClick = (faq) => {
    setEditingFaq({ ...faq }); // 클릭한 FAQ 데이터를 상태로 설정
  };

  // FAQ 저장
  const handleSaveEdit = async () => {
    if (!editingFaq) return;

    try {
      const faqRef = doc(db, "faqs", editingFaq.id);
      await updateDoc(faqRef, {
        category: editingFaq.category,
        question: editingFaq.question,
        answer: editingFaq.answer,
      });
      setEditingFaq(null); // 편집 모드 종료
      loadFaqs(); // Firestore 데이터 새로고침
    } catch (error) {
      console.error("FAQ 업데이트 오류:", error);
    }
  };

  // 취소 버튼 클릭 핸들러
  const cancelEditing = () => {
    setEditingFaq(null); // 편집 모드 종료
  };

  // 새 FAQ 추가 핸들러
  const startAdding = () => {
    setIsAdding(true);
    setNewFaq({
      faqId: `TEMP-${Date.now()}`,
      category: categories.length > 0 ? categories[0].name : "", // 첫 번째 카테고리 기본값 설정
      question: "",
      answer: "",
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewFaq(null);
  };

  const saveNewFaq = async () => {
    try {
      await addDoc(collection(db, "faqs"), {
        ...newFaq,
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      loadFaqs();
    } catch (error) {
      console.error("FAQ 추가 오류:", error);
    }
  };

  // 선택 FAQ 삭제
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedFaqs.map((faqId) => deleteDoc(doc(db, "faqs", faqId)))
      );
      setSelectedFaqs([]);
      loadFaqs();
    } catch (error) {
      console.error("FAQ 삭제 오류:", error);
    }
  };

  // 새 카테고리 추가 핸들러 시작/취소/저장
  const startAddingCategory = () => setIsAddingCategory(true);
  const cancelAddingCategory = () => {
    setIsAddingCategory(false);
    setNewCategory("");
  };

  const saveNewCategory = async () => {
    if (!newCategory.trim()) return; // 빈 값 방지

    try {
      const docRef = await addDoc(collection(db, "faqCategories"), {
        name: newCategory,
      });
      setCategories([...categories, { id: docRef.id, name: newCategory }]); // UI 업데이트
      cancelAddingCategory();
    } catch (error) {
      console.error("카테고리 추가 오류:", error);
    }
  };

  // 선택된 카테고리 삭제 핸들러
  const handleDeleteSelectedCategories = async () => {
    try {
      await Promise.all(
        selectedCategories.map((categoryId) =>
          deleteDoc(doc(db, "faqCategories", categoryId))
        )
      );
      setCategories(
        categories.filter((cat) => !selectedCategories.includes(cat.id))
      );
      setSelectedCategories([]);
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
    }
  };

  // 개별 카테고리 삭제 핸들러
  const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "faqCategories", categoryId));
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
    }
  };

  // 체크박스 핸들러
  const handleCategoryCheckboxChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  // 카테고리 수정 시작
  const handleEditCategory = (cat) => {
    setEditingCategory({ ...cat });
  };
  // 수정된 카테고리 저장
  const saveEditedCategory = async () => {
    if (!editingCategory) return;

    try {
      const categoryRef = doc(db, "faqCategories", editingCategory.id);
      await updateDoc(categoryRef, { name: editingCategory.name });
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? editingCategory : cat
        )
      );
      setEditingCategory(null); // 편집 모드 종료
    } catch (error) {
      console.error("카테고리 업데이트 오류:", error);
    }
  };
  // 카테고리 수정 취소
  const cancelEditingCategory = () => {
    setEditingCategory(null);
  };
  return (
    <div className="p-6">
      {/* Category 관리 섹션 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Category 관리</h2>
        {/* 상단 버튼 영역 */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <button
            onClick={
              isAddingCategory ? cancelAddingCategory : startAddingCategory
            }
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            {isAddingCategory ? (
              <>
                <X size={18} className="inline mr-2" />
                추가 취소
              </>
            ) : (
              <>
                <Plus size={18} className="inline mr-2" />
                카테고리 추가
              </>
            )}
          </button>
          <button
            onClick={handleDeleteSelectedCategories}
            className={`${
              selectedCategories.length === 0 ? "bg-gray-300" : "bg-red-500"
            } hover:bg-red-600 text-white font-bold py-2 px-4 rounded`}
            disabled={selectedCategories.length === 0}
          >
            <Trash2 size={18} className="inline mr-2" />
            선택 삭제
          </button>
        </div>

        {/* Category 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  선택
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리 이름
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryCheckboxChange(cat.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {editingCategory?.id === cat.id ? (
                      <input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingCategory?.id === cat.id ? (
                      <>
                        {/* 저장 버튼 */}
                        <button
                          onClick={saveEditedCategory}
                          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                        >
                          저장
                        </button>
                        {/* 취소 버튼 */}
                        <button
                          onClick={cancelEditingCategory}
                          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 ml-2"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
                        >
                          수정
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* 새로운 카테고리 추가 행 */}
              {isAddingCategory && (
                <tr>
                  <td></td>
                  <td>
                    <input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="카테고리 이름 입력"
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="flex gap-2 justify-center px-6 py-4 whitespace-nowrap">
                    {/* 저장 버튼 */}
                    <button
                      onClick={saveNewCategory}
                      className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                    >
                      저장
                    </button>
                    {/* 취소 버튼 */}
                    <button
                      onClick={cancelAddingCategory}
                      className="bg-red px-4 py-2 rounded-lg hover:bg-red transition-all duration-300"
                    >
                      취소
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상단 버튼 영역 */}
      <div className="flex justify-between items-center mb-6 mt-8">
        <h2 className="text-2xl font-bold">FAQ 관리</h2>
        <div>
          {/* FAQ 추가 버튼 */}
          <button
            onClick={isAdding ? cancelAdding : startAdding}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            {isAdding ? (
              <>
                <X size={18} className="inline mr-2" />
                추가 취소
              </>
            ) : (
              <>
                <Plus size={18} className="inline mr-2" />
                FAQ 추가
              </>
            )}
          </button>
          {/* 선택 삭제 버튼 */}
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            disabled={selectedFaqs.length === 0}
          >
            <Trash2 size={18} className="inline mr-2" />
            선택 삭제
          </button>
        </div>
      </div>

      {/* FAQ 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                선택
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                질문
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                답변
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 기존 FAQ 데이터 렌더링 */}
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={selectedFaqs.includes(faq.id)}
                    onChange={() => handleCheckboxChange(faq.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {editingFaq?.id === faq.id ? (
                    <select
                      value={editingFaq.category}
                      onChange={(e) =>
                        setEditingFaq({
                          ...editingFaq,
                          category: e.target.value,
                        })
                      }
                      className="border rounded p-1 w-full"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    faq.category
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {editingFaq?.id === faq.id ? (
                    <input
                      value={editingFaq.question}
                      onChange={(e) =>
                        setEditingFaq({
                          ...editingFaq,
                          question: e.target.value,
                        })
                      }
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    faq.question
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {editingFaq?.id === faq.id ? (
                    <textarea
                      value={editingFaq.answer}
                      onChange={(e) =>
                        setEditingFaq({
                          ...editingFaq,
                          answer: e.target.value,
                        })
                      }
                      className="border rounded p-1 w-full h-[80px]"
                    />
                  ) : (
                    faq.answer
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {faq.createdAt?.toDate().toLocaleString() || "날짜 정보 없음"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {editingFaq?.id === faq.id ? (
                    <>
                      {/* 저장 버튼 */}
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                      >
                        저장
                      </button>
                      {/* 취소 버튼 */}
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 수정 버튼 */}
                      <button
                        onClick={() => handleEditClick(faq)}
                        className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
                      >
                        수정
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {/* 새로운 FAQ 추가 행 */}
            {isAdding && (
              <tr>
                <td></td>
                <td>
                  <select
                    value={newFaq.category}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, category: e.target.value })
                    }
                    className="border rounded p-1 w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={newFaq.question}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, question: e.target.value })
                    }
                    placeholder="질문 입력"
                    className="border rounded p-1 w-full"
                  />
                </td>
                <td>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, answer: e.target.value })
                    }
                    placeholder="답변 입력"
                    className="border rounded p-1 w-full h-[80px]"
                  />
                </td>
                <td></td>
                <td className="flex gap-2 justify-center">
                  {/* 저장 버튼 */}
                  <button
                    onClick={saveNewFaq}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                  >
                    저장
                  </button>
                  {/* 취소 버튼 */}
                  <button
                    onClick={cancelAdding}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                  >
                    취소
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
