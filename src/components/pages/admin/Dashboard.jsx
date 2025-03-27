import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ui/Button";
import { Card } from "@ui/Card";
import { CardContent } from "@ui/Card";
import { Menu, Users, Settings, LogOut } from "lucide-react";
import { auth } from "../../../firebase/firebase_config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const db = getFirestore(); // Firestore 인스턴스 생성

  useEffect(() => {
    // Firebase 인증 상태 확인
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin");
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Firestore에서 사용자 수 가져오기
    const fetchUserCount = async () => {
      try {
        const userCollection = collection(db, "user"); // 'user' 컬렉션 참조
        const userSnapshot = await getDocs(userCollection); // 컬렉션의 모든 문서 가져오기
        setUserCount(userSnapshot.size); // 문서 개수 설정
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, [db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!authChecked) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // 2. 카드 클릭 핸들러 추가 (컴포넌트 내부)
  const handleCardClick = () => {
    console.log("Card clicked!");
    navigate("/dashboard/users");
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={handleCardClick}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold">Users</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {userCount} registered users
                </p>
              </CardContent>
            </Card>
          </div>
          {/* <Card>
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold">Revenue</h3>
              <p className="text-sm sm:text-base text-gray-600">
                $12,345 this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Active Sessions
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                56 active users
              </p>
            </CardContent>
          </Card> */}
        </main>
      </div>
    </div>
  );
}
