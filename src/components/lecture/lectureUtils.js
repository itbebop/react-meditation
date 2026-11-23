// 강의(lectures) 정렬·ID 관련 공용 함수
//
// 순서: `order`(숫자) 필드가 있으면 그것을, 없으면 lectureId("LEC-3")의 숫자를 정렬 기준으로 씁니다.
//  - 예전 데이터에는 order가 없으므로 기존과 같은 순서(lectureId 숫자 순)로 보입니다.
//  - 관리자 화면에서 순서를 저장하면 모든 강의에 order(0,1,2…)가 기록됩니다.
//  - lectureId는 순서와 상관없이 고정됩니다. (예전에는 순서를 바꾸면 lectureId를 다시 매겨서
//    이미지 경로 registration/<lectureId>/imageFile 이 다른 강의와 겹치는 문제가 있었음)

// "LEC-12" -> 12, 형식이 다르거나 없으면 Infinity(맨 뒤)
export function lectureIdNumber(lectureId) {
  const m = /^LEC-(\d+)$/.exec(String(lectureId ?? "").trim());
  return m ? Number(m[1]) : Infinity;
}

export function sortKey(lecture) {
  return typeof lecture.order === "number" && Number.isFinite(lecture.order)
    ? lecture.order
    : lectureIdNumber(lecture.lectureId);
}

export function compareLectures(a, b) {
  const ka = sortKey(a);
  const kb = sortKey(b);
  if (ka !== kb) return ka < kb ? -1 : 1;
  const ia = lectureIdNumber(a.lectureId);
  const ib = lectureIdNumber(b.lectureId);
  if (ia !== ib) return ia < ib ? -1 : 1;
  return String(a.title ?? "").localeCompare(String(b.title ?? ""), "ko");
}

export function sortLectures(lectures) {
  return [...lectures].sort(compareLectures);
}

// 새 강의 ID: 기존 가장 큰 번호 + 1 (강의 개수로 만들면 삭제 후 추가 시 번호가 겹침)
export function nextLectureId(lectures) {
  const max = lectures.reduce((m, l) => {
    const n = lectureIdNumber(l.lectureId);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `LEC-${max + 1}`;
}

// 새 강의를 맨 뒤에 두기 위한 order 값
export function nextOrder(lectures) {
  const max = lectures.reduce((m, l) => {
    const k = sortKey(l);
    return Number.isFinite(k) ? Math.max(m, k) : m;
  }, -1);
  return max + 1;
}

// 반응형 클래스(md:, lg:, 2xl: 등)를 빼서 모바일 화면 모양을 강제로 보여줄 때 사용
export function mobileOnly(className, forceMobile) {
  if (!forceMobile) return className;
  return className
    .split(/\s+/)
    .filter((c) => c && !/^(sm|md|lg|xl|2xl):/.test(c))
    .join(" ");
}
