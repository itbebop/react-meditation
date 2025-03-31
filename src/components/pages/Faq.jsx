import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // 화살표 아이콘
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase_config"; // Firestore 설정 파일

const Faq = () => {
  const [faqData, setFaqData] = useState([]); // FAQ 데이터 상태
  const [activeCategory, setActiveCategory] = useState(null); // 활성화된 카테고리 상태
  const [activeQuestion, setActiveQuestion] = useState(null); // 활성화된 질문 상태

  // Firestore에서 FAQ 데이터 로드
  const loadFaqs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "faqs"));
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());

      // 데이터를 카테고리별로 그룹화
      const groupedData = fetchedData.reduce((acc, faq) => {
        const category = faq.category || "기타"; // 카테고리가 없으면 "기타"로 설정
        if (!acc[category]) {
          acc[category] = { category, items: [] };
        }
        acc[category].items.push({
          question: faq.question,
          answer: faq.answer,
        });
        return acc;
      }, {});

      // 상태 업데이트 (객체를 배열로 변환)
      setFaqData(Object.values(groupedData));
      setActiveCategory(Object.keys(groupedData)[0]); // 첫 번째 카테고리 활성화
    } catch (error) {
      console.error("FAQ 데이터 로드 오류:", error);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  // 카테고리 토글 함수
  const toggleCategory = (category) => {
    setActiveCategory(category);
    setActiveQuestion(null); // 카테고리 변경 시 질문 초기화
  };

  // 질문 토글 함수
  const toggleQuestion = (question) => {
    setActiveQuestion(activeQuestion === question ? null : question);
  };

  return (
    <div id="faq" className="px-4 py-16 mt-12 max-w-5xl mx-auto">
      {/* FAQ 제목과 설명 */}
      <div className="mb-10 max-w-screen-xl mx-auto md:px-4">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-800">FAQ</h1>
          <p className="mt-4 text-gray-600">
            자주 묻는 질문들입니다. 궁금한 사항을 알아보세요.
          </p>
        </div>
      </div>

      {/* FAQ 메뉴와 내용 */}
      <div className="flex justify-center gap-14">
        {/* 왼쪽 메뉴 */}
        <div className="w-1/4">
          {faqData.map((category) => (
            <button
              key={category.category}
              className={`block text-left py-2 mb-2 rounded text-base font-medium whitespace-nowrap ${
                activeCategory === category.category
                  ? "text-lightGreen"
                  : "text-gray-800 hover:text-neutralGreen"
              }`}
              onClick={() => toggleCategory(category.category)}
            >
              {category.category}
            </button>
          ))}
        </div>

        {/* 오른쪽 FAQ 내용 */}
        <div className="w-2/3">
          {faqData.map(
            (category) =>
              activeCategory === category.category && (
                <div key={category.category}>
                  <ul>
                    {category.items.map((item) => (
                      <li key={item.question} className="mb-4">
                        {/* 질문 부분 */}
                        <button
                          className="w-full text-left py-2 px-4 flex gap-2 items-center hover:bg-gray-50 rounded"
                          onClick={() => toggleQuestion(item.question)}
                        >
                          <span>{item.question}</span>
                          {activeQuestion === item.question ? (
                            <FaChevronUp className="text-gray-500 ml-auto" />
                          ) : (
                            <FaChevronDown className="text-gray-500 ml-auto" />
                          )}
                        </button>

                        {/* 답변 부분 */}
                        {activeQuestion === item.question && (
                          <div className="mt-2 px-4 py-2 bg-gray-50 border rounded">
                            {item.answer.split("\n").map((line, index) => (
                              <p key={index}>
                                {line}
                                <br />
                              </p>
                            ))}
                          </div>
                        )}

                        {/* 구분선 */}
                        <div className="border-b border-gray-200 mt-4"></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default Faq;
