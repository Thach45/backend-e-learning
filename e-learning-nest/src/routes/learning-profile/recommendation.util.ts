export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface UserSignals {
  tagIds: Set<string>;
  /** Danh mục suy ra từ các thẻ người dùng quan tâm. */
  categoryIds: Set<string>;
  level: Level | null;
  language: string | null;
}

export interface CourseSignals {
  tagIds: string[];
  categoryId: string | null;
  level: Level;
  language: string;
}

export interface Match {
  score: number;
  matchedTagIds: string[];
  sameCategory: boolean;
  levelMatch: "exact" | "adjacent" | "none";
  sameLanguage: boolean;
}

const ORDER: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

/** Ngưỡng tối thiểu để được gợi ý: phải khớp ít nhất thẻ, danh mục hoặc trình độ (chỉ trùng ngôn ngữ thì chưa đủ). */
export const MIN_SCORE = 1.5;

/**
 * Chấm điểm độ phù hợp giữa người dùng và một khoá học bằng luật đơn giản (không AI):
 * mỗi thẻ trùng +3, cùng danh mục +2, đúng trình độ +1.5 (liền kề +0.5), cùng ngôn ngữ +1.
 */
export function scoreCourse(user: UserSignals, course: CourseSignals): Match {
  const matchedTagIds = course.tagIds.filter((id) => user.tagIds.has(id));
  const sameCategory = !!course.categoryId && user.categoryIds.has(course.categoryId);

  let levelMatch: Match["levelMatch"] = "none";
  if (user.level) {
    const diff = Math.abs(ORDER.indexOf(user.level) - ORDER.indexOf(course.level));
    levelMatch = diff === 0 ? "exact" : diff === 1 ? "adjacent" : "none";
  }
  const sameLanguage = !!user.language && user.language === course.language;

  const score =
    matchedTagIds.length * 3 +
    (sameCategory ? 2 : 0) +
    (levelMatch === "exact" ? 1.5 : levelMatch === "adjacent" ? 0.5 : 0) +
    (sameLanguage ? 1 : 0);

  return { score, matchedTagIds, sameCategory, levelMatch, sameLanguage };
}
