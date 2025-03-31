import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { db } from "../../firebase/firebase_config";
import { collection, getDocs, addDoc } from "firebase/firestore"; // addDoc 추가

const Registration = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  // 새로운 state 추가 (팝업 입력값 관리)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [currentLecture, setCurrentLecture] = useState(null); // 현재 강의 데이터 상태 추가

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      if (!currentLecture) {
        alert("강의 정보가 없습니다.");
        return;
      }

      // Firestore에 데이터 저장
      await addDoc(collection(db, "alarms"), {
        ...formData,
        createdAt: new Date(),
        lectureKey: currentLecture.id, // 강의 키
        lectureId: currentLecture.lectureId, // 강의 ID
        title: currentLecture.title, // 강의 제목
      });

      alert("신청 정보가 저장되었습니다!");
      setShowPopup(false); // 팝업 닫기
      setFormData({ email: "", name: "", phone: "" }); // 입력값 초기화
      setCurrentLecture(null); // 현재 강의 데이터 초기화
    } catch (error) {
      console.error("저장 실패:", error);
      alert("신청 정보 저장에 실패했습니다.");
    }
  };

  // Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lectures"));
        const lectureData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 수정된 부분: lectureId를 기준으로 정렬
        lectureData.sort((a, b) => {
          const numA = parseInt(a.lectureId.split("-")[1], 10); // LEC 뒤 숫자 추출
          const numB = parseInt(b.lectureId.split("-")[1], 10); // LEC 뒤 숫자 추출
          return numA - numB; // 오름차순 정렬
        });

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

  // 팝업 토글 함수 수정
  const handleTogglePopup = (lecture = null) => {
    setShowPopup(!showPopup);
    setCurrentLecture(lecture); // 강의 데이터를 저장
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
                  onClick={() => handleTogglePopup(lecture)} // lecture 객체 전달
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
            <h2 className="text-lg font-bold mb-4">강의 신청</h2>

            {/* 이메일 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="example@email.com"
              />
            </div>

            {/* 이름 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="홍길동"
              />
            </div>

            {/* 전화번호 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2">
              {/* 팝업 닫기 버튼 */}
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                onClick={() => {
                  setShowPopup(false);
                  setCurrentLectureKey(""); // 강의 키 초기화
                }}
              >
                닫기
              </button>

              <button
                className="px-4 py-2 bg-lightGreen text-white rounded-lg hover:bg-green-500 transition-all"
                onClick={handleSubmit}
              >
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
