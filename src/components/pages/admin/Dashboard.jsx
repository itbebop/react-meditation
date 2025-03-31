import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@ui/Card";
import { CardContent } from "@ui/Card";
import { auth } from "../../../firebase/firebase_config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc as firestoreDoc,
  getDoc,
  where,
} from "firebase/firestore";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [alarms, setAlarms] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin");
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCollection = collection(db, "user");
        const userSnapshot = await getDocs(userCollection);
        setUserCount(userSnapshot.size);

        const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

        const alarmsQuery = query(
          collection(db, "alarms"),
          where("createdAt", ">=", startOfMonth),
          where("createdAt", "<=", endOfMonth),
          orderBy("createdAt", "desc")
        );
        const alarmsSnapshot = await getDocs(alarmsQuery);

        const alarmsData = await Promise.all(
          alarmsSnapshot.docs.map(async (docSnap) => {
            const alarmData = docSnap.data();
            let lectureInfo = { lectureId: "", title: "" };

            if (alarmData.lectureKey) {
              const lectureRef = firestoreDoc(
                db,
                "lectures",
                alarmData.lectureKey
              ); // Use renamed `firestoreDoc`
              const lectureDoc = await getDoc(lectureRef);
              if (lectureDoc.exists()) {
                lectureInfo = lectureDoc.data();
              }
            }

            return {
              id: docSnap.id,
              ...alarmData,
              ...lectureInfo,
              createdAt: alarmData.createdAt?.toDate(),
            };
          })
        );

        setAlarms(alarmsData);
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };

    fetchData();
  }, [db, selectedYear, selectedMonth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCardClick = () => {
    navigate("/dashboard/users");
  };

  if (!authChecked) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gray-100">
        <main className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={handleCardClick}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold">사용자</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  등록된 사용자 {userCount}명
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-full">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">최근 수강 신청 정보</h3>
                  <div>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="mr-2 p-1 border rounded"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}년
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="p-1 border rounded"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}월
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {alarms.length > 0 ? (
                    alarms.map((alarm) => (
                      <div
                        key={alarm.id}
                        className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              강의 ID: {alarm.lectureId}
                            </p>
                            <p className="font-medium">
                              강의 제목: {alarm.title}
                            </p>
                            <p className="font-medium">이름: {alarm.name}</p>
                            <p className="text-sm text-gray-600">
                              이메일: {alarm.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              전화번호: {alarm.phone}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {alarm.createdAt?.toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      등록된 신청 정보가 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
