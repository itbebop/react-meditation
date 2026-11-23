import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  GripVertical,
  Star,
  ChevronUp,
  ChevronDown,
  RefreshCcw,
  Save,
} from "lucide-react";
import LectureEditPanel from "../../lecture/LectureEditPanel";
import {
  loadLectures,
  deleteLecture,
  saveOrderAndMain,
} from "../../../firebase/lectures";

const MAX_MAIN = 2;

/**
 * 수강 신청 강의 관리
 * - 왼쪽: 강의 목록 (순서 변경, 홈 메인 지정)
 * - 오른쪽: 선택한 강의의 수정 폼 + 공개 화면 미리보기
 * 순서·메인 변경은 목록 위의 "변경사항 저장"으로 한 번에 저장합니다.
 */
export default function AdminRegistration() {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [loadError, setLoadError] = useState("");
  const [lectures, setLectures] = useState([]); // 저장된 상태 (정렬됨)
  const [order, setOrder] = useState([]); // 화면의 순서 (id 배열)
  const [mainIds, setMainIds] = useState(new Set()); // 화면의 메인 지정
  const [selectedId, setSelectedId] = useState(null); // 강의 id | "new" | null
  const [panelVersion, setPanelVersion] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [listSaving, setListSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const applyLoaded = (data) => {
    setLectures(data);
    setOrder(data.map((l) => l.id));
    setMainIds(new Set(data.filter((l) => l.isMain).map((l) => l.id)));
  };

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      applyLoaded(await loadLectures());
      setStatus("ready");
    } catch (error) {
      console.error("강의 목록 불러오기 실패:", error);
      setLoadError(error.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const byId = useMemo(() => new Map(lectures.map((l) => [l.id, l])), [lectures]);
  const shown = order.map((id) => byId.get(id)).filter(Boolean);

  const savedOrder = lectures.map((l) => l.id);
  const savedMain = new Set(lectures.filter((l) => l.isMain).map((l) => l.id));
  const orderChanged = order.join() !== savedOrder.join();
  const mainChanged =
    mainIds.size !== savedMain.size || [...mainIds].some((id) => !savedMain.has(id));
  const listDirty = orderChanged || mainChanged;

  // 저장하지 않은 변경이 있으면 페이지를 떠날 때 경고
  useEffect(() => {
    if (!listDirty && !formDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [listDirty, formDirty]);

  const flash = (type, text) => setNotice({ type, text });

  const confirmLeaveForm = () =>
    !formDirty || window.confirm("수정 중인 내용이 저장되지 않았습니다. 버리고 이동할까요?");

  const select = (id) => {
    if (id === selectedId) return;
    if (!confirmLeaveForm()) return;
    setFormDirty(false);
    setSelectedId(id);
    setNotice({ type: "", text: "" });
  };

  // --- 순서 변경 ---
  const moveTo = (id, targetIndex) => {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      if (from < 0) return prev;
      const next = prev.filter((x) => x !== id);
      const to = Math.max(0, Math.min(targetIndex > from ? targetIndex - 1 : targetIndex, next.length));
      next.splice(to, 0, id);
      return next;
    });
  };
  const moveBy = (id, delta) => {
    const i = order.indexOf(id);
    const target = i + delta;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };

  // --- 메인 지정 ---
  const toggleMain = (id) => {
    setMainIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_MAIN) {
          flash("error", `홈 메인 강의는 최대 ${MAX_MAIN}개입니다. 다른 강의의 별을 먼저 해제하세요.`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const saveList = async () => {
    if (listSaving) return;
    setListSaving(true);
    try {
      await saveOrderAndMain(order, mainIds);
      setLectures((prev) => {
        const map = new Map(prev.map((l) => [l.id, l]));
        return order
          .map((id, index) => map.get(id) && { ...map.get(id), order: index, isMain: mainIds.has(id) })
          .filter(Boolean);
      });
      flash("ok", "순서와 메인 설정을 저장했습니다. 공개 화면에 바로 반영됩니다.");
    } catch (error) {
      console.error("순서·메인 저장 실패:", error);
      flash("error", `저장하지 못했습니다: ${error.message}`);
    } finally {
      setListSaving(false);
    }
  };

  const revertList = () => {
    setOrder(savedOrder);
    setMainIds(savedMain);
    setNotice({ type: "", text: "" });
  };

  // --- 강의 저장·삭제 (편집 패널에서 호출) ---
  const handleSaved = (saved, isNew) => {
    setLectures((prev) =>
      isNew ? [...prev, saved] : prev.map((l) => (l.id === saved.id ? { ...l, ...saved } : l))
    );
    if (isNew) setOrder((prev) => [...prev, saved.id]);
    setFormDirty(false);
    setSelectedId(saved.id);
    setPanelVersion((v) => v + 1);
    flash("ok", isNew ? `'${saved.title}' 강의를 추가했습니다.` : `'${saved.title}' 강의를 저장했습니다.`);
  };

  const handleDelete = async (lecture) => {
    const ok = window.confirm(
      `'${lecture.title}' 강의를 삭제할까요?\n\n삭제하면 되돌릴 수 없고 수강 신청 페이지에서 바로 사라집니다.\n(이 강의의 수강 신청 내역은 남아 있습니다)`
    );
    if (!ok) return;
    try {
      await deleteLecture(lecture.id);
      setLectures((prev) => prev.filter((l) => l.id !== lecture.id));
      setOrder((prev) => prev.filter((id) => id !== lecture.id));
      setMainIds((prev) => {
        const next = new Set(prev);
        next.delete(lecture.id);
        return next;
      });
      setFormDirty(false);
      setSelectedId(null);
      flash("ok", `'${lecture.title}' 강의를 삭제했습니다.`);
    } catch (error) {
      console.error("강의 삭제 실패:", error);
      flash("error", `삭제하지 못했습니다: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (!confirmLeaveForm()) return;
    setFormDirty(false);
    setSelectedId(null);
  };

  const selectedLecture = selectedId && selectedId !== "new" ? byId.get(selectedId) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold">강의 정보 관리</h2>
          <p className="text-sm text-gray-500">
            수강 신청 페이지와 홈 화면에 보이는 강의를 관리합니다. 강의를 누르면 오른쪽에서 수정할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => select("new")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          강의 추가
        </button>
      </div>

      {notice.text && (
        <div
          className={`mb-4 rounded px-4 py-2 text-sm ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">
        {/* 강의 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-700">강의 목록 ({shown.length}개)</p>
            <p className="text-xs text-gray-500">
              <GripVertical size={12} className="inline" /> 끌거나 화살표로 순서 변경 ·{" "}
              <Star size={12} className="inline" /> 홈 메인 강의 (최대 {MAX_MAIN}개, 현재 {mainIds.size}개)
            </p>
          </div>

          {listDirty && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm">
              <span className="text-amber-800">
                {[orderChanged && "순서", mainChanged && "메인"].filter(Boolean).join("·")} 변경이 저장되지 않았습니다.
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={revertList}
                  disabled={listSaving}
                  className="flex items-center gap-1 text-gray-700 border border-gray-300 bg-white rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                >
                  <RefreshCcw size={14} /> 되돌리기
                </button>
                <button
                  onClick={saveList}
                  disabled={listSaving}
                  className="flex items-center gap-1 text-white bg-blue-600 rounded px-3 py-1 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={14} /> {listSaving ? "저장 중…" : "변경사항 저장"}
                </button>
              </div>
            </div>
          )}

          {status === "loading" && <p className="p-6 text-sm text-gray-500">불러오는 중…</p>}
          {status === "error" && (
            <div className="p-6 text-sm text-red-600">
              강의 목록을 불러오지 못했습니다. ({loadError}){" "}
              <button className="underline" onClick={reload}>
                다시 시도
              </button>
            </div>
          )}
          {status === "ready" && shown.length === 0 && (
            <p className="p-6 text-sm text-gray-500">등록된 강의가 없습니다. "강의 추가"로 첫 강의를 만드세요.</p>
          )}

          <ul onDragLeave={() => setDropIndex(null)}>
            {shown.map((lecture, index) => {
              const isMain = mainIds.has(lecture.id);
              const active = selectedId === lecture.id;
              return (
                <li
                  key={lecture.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(lecture.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropIndex(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropIndex(e.clientY < rect.top + rect.height / 2 ? index : index + 1);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId != null && dropIndex != null) moveTo(dragId, dropIndex);
                    setDragId(null);
                    setDropIndex(null);
                  }}
                  className={`relative flex items-center gap-3 px-3 py-3 border-b last:border-b-0 ${
                    active ? "bg-blue-50" : "hover:bg-gray-50"
                  } ${dragId === lecture.id ? "opacity-40" : ""}`}
                >
                  {dropIndex === index && dragId && (
                    <span className="absolute left-0 right-0 top-0 h-0.5 bg-blue-500" />
                  )}
                  {dropIndex === index + 1 && dragId && index === shown.length - 1 && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-500" />
                  )}

                  <span className="cursor-grab text-gray-400" title="끌어서 순서 변경" aria-hidden="true">
                    <GripVertical size={18} />
                  </span>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      title="위로"
                      aria-label={`${lecture.title} 위로 이동`}
                      onClick={() => moveBy(lecture.id, -1)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      title="아래로"
                      aria-label={`${lecture.title} 아래로 이동`}
                      onClick={() => moveBy(lecture.id, 1)}
                      disabled={index === shown.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => select(lecture.id)}
                    className="flex flex-1 min-w-0 items-center gap-3 text-left"
                  >
                    {lecture.imgUrl ? (
                      <img src={lecture.imgUrl} alt="" className="h-12 w-16 flex-none rounded object-cover" />
                    ) : (
                      <span className="h-12 w-16 flex-none rounded bg-gray-100" />
                    )}
                    <span className="min-w-0">
                      <span
                        className="inline-block text-white text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: lecture.categoryColor || "#f59e0b" }}
                      >
                        {lecture.category || "카테고리 없음"}
                      </span>
                      <span className="block truncate font-medium text-gray-800">{lecture.title}</span>
                      <span className="block truncate text-xs text-gray-500">
                        {lecture.lecturer || "강사 미정"} · {lecture.lectureNum ?? 0}강 · {lecture.lectureTime ?? 0}시간 ·{" "}
                        {lecture.lectureId || "ID 없음"}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleMain(lecture.id)}
                    title={isMain ? "홈 메인에서 빼기" : "홈 메인으로 지정"}
                    aria-label={isMain ? `${lecture.title} 홈 메인에서 빼기` : `${lecture.title} 홈 메인으로 지정`}
                    aria-pressed={isMain}
                    className={`p-1 rounded hover:bg-amber-50 ${isMain ? "text-amber-500" : "text-gray-300"}`}
                  >
                    <Star size={20} fill={isMain ? "currentColor" : "none"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 수정 패널 */}
        <div className="xl:sticky xl:top-4">
          {selectedId ? (
            <LectureEditPanel
              key={`${selectedId}-${panelVersion}`}
              lecture={selectedLecture}
              allLectures={lectures}
              onSaved={handleSaved}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onDirtyChange={setFormDirty}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-gray-500">
              왼쪽 목록에서 강의를 고르면 여기서 수정하고 공개 화면 모양을 미리 볼 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
