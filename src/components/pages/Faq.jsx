import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // 화살표 아이콘

const Faq = () => {
  // FAQ 데이터
  const faqData = [
    {
      category: "수강/학습",
      items: [
        {
          question: "학습하는데 시간이나 횟수 제한이 있나요?",
          answer:
            "수강기간 내 횟수 및 시간 제한 없이 자유롭게 학습할 수 있습니다.",
        },
        {
          question: "여러 명이 함께 이용할 수 있나요??",
          answer:
            "1개의 아이디를 공유하여 여러 명이 사용할 수 없습니다. \n\n 개인 명의로 가입 후 1인만 사용이 가능하며, 여러 명이 사용하는 것이 확인될 경우 학습 및 서비스 이용에 제한될 수 있습니다.",
        },
        {
          question:
            "결제 후 나중에 수강 해도 되나요? (수강 시작일을 지정할 수 있나요?)?",
          answer:
            "강의가 오픈된 시점부터 수강할 수 있습니다.\n\n수강 시작일은 지정할 수 없으며, 강의 오픈일 당일부터 수강 기간이 차감됩니다.",
        },
        {
          question:
            "학습 완료 처리가 안돼요. (배속기능을 통해 강의를 수강한 경우)",
          answer:
            '배속기능을 통해 강의를 수강 할 경우, 학습인정시간(총 콘텐츠 실행시간의 80%시간) 보다 강의가 일찍 종료 될 수 있습니다. \n 이는 학습인정시간 부족으로 학습이 불인정되므로, 학습인정 기간 내 강의를 재수강하여야 합니다.\n\n 배속기능을 이용하여 강의 수강 후 학습상태가 "학습 완료"로 변경된 것을 반드시 확인하시기 바랍니다. \n\n최대 1.2 배속까지 권장드리며, 여러번 반복해서 수강하실 경우 학습 시간이 누적되어 인정됩니다. \n\n반복해서 수강을 했음에도 "학습 완료"로 변경되지 않는다면,\n 보다 정확한 확인을 위해 해당 문제와 함께 내면소통연구소 홈페이지 아이디 및 성함을 기재하여 official@joohankim.org로 메일 보내주시면 확인 도와드리겠습니다.',
        }, // todo: 개행 처리, 따옴표 처리
      ],
    },
    {
      category: "결제 / 환불",
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

  // 초기 상태 설정 (첫 번째 카테고리 선택)
  const [activeCategory, setActiveCategory] = useState(faqData[0].category);
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
    <div id="faq" className="px-12 py-16 mt-10 max-w-5xl mx-auto">
      {/* FAQ 제목과 설명 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">FAQs</h1>
        <p className="mt-4 text-gray-600">
          자주 묻는 질문들입니다. <br />
          카테고리를 선택해서 해당하는 질문을 선택하세요.
        </p>
      </div>

      {/* FAQ 메뉴와 내용 */}
      <div className="flex justify-center gap-16">
        {/* 왼쪽 메뉴 */}
        <div className="w-1/3">
          {faqData.map((category) => (
            <button
              key={category.category}
              className={`block text-left py-2 px-4 mb-2 rounded text-base font-medium whitespace-nowrap ${
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
