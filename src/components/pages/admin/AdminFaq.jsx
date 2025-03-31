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
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // FAQ 추가 모드 상태
  const [newFaq, setNewFaq] = useState({
    faqId: "",
    category: "회원가입",
    question: "",
    answer: "",
  });

  // 카테고리 옵션
  const categories = ["회원가입", "결제", "강의신청", "계정관리", "기타"];

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

  useEffect(() => {
    loadFaqs();
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
    setEditingFaq(faq);
  };

  // FAQ 저장
  const handleSaveEdit = async () => {
    if (!editingFaq) return;

    try {
      const faqRef = doc(db, "faqs", editingFaq.id);
      await updateDoc(faqRef, editingFaq);
      setEditingFaq(null);
      loadFaqs();
    } catch (error) {
      console.error("FAQ 업데이트 오류:", error);
    }
  };

  // 새 FAQ 추가 핸들러
  const startAdding = () => {
    setIsAdding(true);
    setNewFaq({
      faqId: `TEMP-${Date.now()}`,
      category: "회원가입",
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

  return (
    <div className="p-6">
      {/* 상단 버튼 영역 */}
      <div className="flex justify-between items-center mb-6">
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
                  {faq.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {faq.question}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {faq.answer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {faq.createdAt?.toDate().toLocaleString() || "날짜 정보 없음"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(faq)}
                      className="flex items-center justify-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-all duration-300"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* 새로운 FAQ 추가 행 */}
            {isAdding && (
              <tr>
                <td></td>
                <td>
                  <input
                    value={newFaq.category}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, category: e.target.value })
                    }
                    placeholder="카테고리 입력"
                    className="border rounded p-1 w-full"
                  />
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
                    className="flex items-center justify-center bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-all duration-300"
                  >
                    <Save size={18} />
                  </button>
                  {/* 취소 버튼 */}
                  <button
                    onClick={cancelAdding}
                    className="flex items-center justify-center bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-all duration-300"
                  >
                    <X size={18} />
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
