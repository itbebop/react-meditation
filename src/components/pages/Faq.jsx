import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // 화살표 아이콘

const Faq = () => {
  // FAQ 데이터
  const faqData = [
    {
      category: "수강 / 학습",
      items: [
        {
          question: "How will I manage my business with you?",
          answer:
            "You can manage your business through our platform by following the guidelines provided.",
        },
        {
          question:
            "Is the content on this website available in other languages?",
          answer:
            "Yes, we support multiple languages for better accessibility.",
        },
        {
          question: "What does it mean to be a part of our booking platform?",
          answer:
            "Being part of our booking platform allows you to reach a wider audience and streamline your operations.",
        },
        {
          question: "What if I have more questions?",
          answer:
            "Feel free to contact our support team for further assistance.",
        },
      ],
    },
    {
      category: "결제 / 환블",
      items: [
        {
          question: "How can I improve guest satisfaction?",
          answer:
            "Provide clear communication and excellent service to improve guest satisfaction.",
        },
        {
          question: "What tools are available for guest management?",
          answer:
            "Our platform offers tools like messaging and guest reviews to help manage relations effectively.",
        },
      ],
    },
    {
      category: "One Key™",
      items: [
        {
          question: "What is One Key™?",
          answer:
            "One Key™ is our loyalty program that rewards guests for their bookings.",
        },
        {
          question: "How does One Key™ benefit me?",
          answer:
            "It attracts loyal customers who are more likely to book again through your listings.",
        },
      ],
    },
    {
      category: "Property listing",
      items: [
        {
          question: "How do I list my property?",
          answer:
            "Follow the step-by-step guide on our platform to create a property listing.",
        },
        {
          question: "Can I update my property details later?",
          answer:
            "Yes, you can edit your property details anytime through the dashboard.",
        },
      ],
    },
    {
      category: "Reservations and rates",
      items: [
        {
          question: "How do I set competitive rates?",
          answer:
            "Use our pricing tools to analyze market trends and set competitive rates.",
        },
        {
          question: "Can I manage cancellations?",
          answer:
            "Yes, you can manage cancellation policies and handle refunds directly from your account.",
        },
      ],
    },
  ];

  // 초기 상태 설정 (About us 선택)
  const [activeCategory, setActiveCategory] = useState("About us");
  const [activeQuestion, setActiveQuestion] = useState(null);

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
    <div id="faq" className="px-8 py-16 mt-10">
      {/* FAQ 제목과 설명 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">FAQs</h1>
        <p className="mt-4 text-gray-600">
          Have questions? Here you'll find the answers most valued by our
          partners, along with access to step-by-step instructions and support.
        </p>
      </div>

      {/* FAQ 메뉴와 내용 */}
      <div className="flex justify-center gap-16">
        {/* 왼쪽 메뉴 */}
        <div className="w-1/4">
          {faqData.map((category) => (
            <button
              key={category.category}
              className={`block text-left py-2 px-4 mb-2 rounded text-lg font-medium ${
                activeCategory === category.category
                  ? "text-blue-500"
                  : "text-gray-800 hover:text-blue-400"
              }`}
              onClick={() => toggleCategory(category.category)}
            >
              {category.category}
            </button>
          ))}
        </div>

        {/* 오른쪽 FAQ 내용 */}
        <div className="w-3/4">
          {faqData.map(
            (category) =>
              activeCategory === category.category && (
                <div key={category.category}>
                  <h2 className="text-xl font-semibold mb-4">
                    {category.category}
                  </h2>
                  <ul>
                    {category.items.map((item) => (
                      <li key={item.question} className="mb-4">
                        {/* 질문 부분 (배경색 없음) */}
                        <button
                          className="block w-full text-left py-2 px-4 flex justify-between items-center hover:bg-gray-50 rounded"
                          onClick={() => toggleQuestion(item.question)}
                        >
                          <span>{item.question}</span>
                          {/* 화살표 아이콘 */}
                          {activeQuestion === item.question ? (
                            <FaChevronUp className="text-gray-500" />
                          ) : (
                            <FaChevronDown className="text-gray-500" />
                          )}
                        </button>

                        {/* 답변 부분 */}
                        {activeQuestion === item.question && (
                          <div className="mt-2 px-4 py-2 bg-gray-50 border rounded">
                            <p>{item.answer}</p>
                          </div>
                        )}
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
