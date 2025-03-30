import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase_config";

const Registration = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lectures"));
        const lectureData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLectures(lectureData);
      } catch (error) {
        console.error("강의 데이터 가져오기 실패:", error);
      }
    };

    fetchLectures();
  }, []);

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedLectures = lectures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lectures.length / itemsPerPage);

  // 상세보기 토글 함수
  const handleToggleDetails = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // 팝업 토글 함수
  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return (
    <div id="registration" className="px-4 py-16 mt-12 bg-gray-50">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-12 max-w-screen-xl mx-auto md:px-28">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">수강 신청</h1>
          <p className="text-gray-600">
            원하는 강의를 선택하여 수강 신청하세요.
          </p>
        </div>
      </div>

      {/* 카드 컨테이너 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 max-w-screen-xl mx-auto md:px-28">
        {paginatedLectures.map((lecture, index) => (
          <div
            key={lecture.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="md:flex">
              {/* 카드 이미지 (왼쪽) */}
              {/* 카드 이미지 (왼쪽) */}
              <div className="flex-shrink-0 w-full h-52 md:w-72 md:h-52">
                <img
                  src={
                    lecture.imgUrl ||
                    `https://picsum.photos/id/101${index + 2}/800/600`
                  }
                  alt="Course"
                  className="w-full h-full object-cover rounded-l-lg"
                />
              </div>

              {/* 카드 내용 (오른쪽) */}
              <div className="md:w-3/4 p-6">
                <span
                  className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4"
                  style={{
                    backgroundColor: lecture.categoryColor || "#f59e0b",
                  }}
                >
                  {lecture.category}
                </span>
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {lecture.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 font-semibold">
                  {lecture.lecturer}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4 text-gray-900 font-medium text-sm">
                    <span className="flex items-center space-x-2">
                      <span>강의수</span>
                      <span className="text-gray-400">
                        {lecture.lectureNum}강
                      </span>
                    </span>
                    <span>|</span>
                    <span className="flex items-center space-x-2">
                      <span>이수시간</span>
                      <span className="text-gray-400">
                        {lecture.lectureTime}시간
                      </span>
                    </span>
                  </div>
                  {/* 상세보기 버튼 */}
                  <button
                    className="text-xs bg-neutralSilver flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
                    onClick={() => handleToggleDetails(index)}
                  >
                    {expandedCard === index ? "접기" : "보기"}
                    {expandedCard === index ? (
                      <FaChevronUp className="ml-2 text-gray-600" />
                    ) : (
                      <FaChevronDown className="ml-2 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 상세 정보 컨테이너 */}
            {expandedCard === index && (
              <div className="bg-gray-100 p-4 rounded-lg mt-4 mx-6 mb-6">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {lecture.detail}
                </p>

                {/* 신청하기 버튼 */}
                <button
                  className="w-full mt-4 bg-lightGreen text-white font-bold py-2 rounded-lg hover:bg-green-500 transition-all duration-300"
                  onClick={handleTogglePopup}
                >
                  신청하기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 팝업 (신청 폼) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {/* 제목 */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">수강 신청</h2>

            {/* 안내 문구 */}
            <p className="text-sm text-gray-600 mb-6">
              기재해주신 연락처로 수강 절차를 안내드리겠습니다.
            </p>

            {/* 입력 폼 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="example@email.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="홍길동"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="tel"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                onClick={handleTogglePopup}
              >
                닫기
              </button>
              <button className="px-4 py-2 bg-lightGreen text-white rounded-lg hover:bg-green-500 transition-all">
                보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        <button
          className="text-gray-500 hover:text-neutralGreen transition-all duration-300"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`font-medium ${
              page === currentPage ? "text-neutralGreen" : "text-gray-500"
            } hover:text-neutralGreen transition-all duration-300`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="text-gray-500 hover:text-neutralGreen transition-all duration-300"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Registration;
