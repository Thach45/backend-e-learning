import { MIN_SCORE, scoreCourse, type UserSignals } from './recommendation.util';

const user = (over: Partial<UserSignals> = {}): UserSignals => ({
  tagIds: new Set(['t-python', 't-sql']),
  categoryIds: new Set(['cat-it']),
  level: 'BEGINNER',
  language: 'vi',
  ...over,
});

describe('scoreCourse', () => {
  it('mỗi thẻ trùng +3, cùng danh mục +2, đúng trình độ +1.5, cùng ngôn ngữ +1', () => {
    const m = scoreCourse(user(), { tagIds: ['t-python', 't-sql', 't-x'], categoryId: 'cat-it', level: 'BEGINNER', language: 'vi' });
    expect(m.matchedTagIds).toEqual(['t-python', 't-sql']);
    expect(m.score).toBe(6 + 2 + 1.5 + 1);
    expect(m.levelMatch).toBe('exact');
  });

  it('trình độ liền kề chỉ +0.5, cách xa thì 0', () => {
    const c = { tagIds: [], categoryId: null, language: 'en' } as const;
    expect(scoreCourse(user(), { ...c, tagIds: [], level: 'INTERMEDIATE' }).score).toBe(0.5);
    expect(scoreCourse(user(), { ...c, tagIds: [], level: 'ADVANCED' }).score).toBe(0);
  });

  it('chỉ trùng ngôn ngữ thì chưa đủ ngưỡng gợi ý', () => {
    const m = scoreCourse(user({ level: null }), { tagIds: [], categoryId: null, level: 'ADVANCED', language: 'vi' });
    expect(m.score).toBe(1);
    expect(m.score).toBeLessThan(MIN_SCORE);
  });

  it('khoá không liên quan thì điểm 0', () => {
    const m = scoreCourse(user(), { tagIds: ['t-cooking'], categoryId: 'cat-food', level: 'ADVANCED', language: 'en' });
    expect(m.score).toBe(0);
  });

  it('người dùng chưa chọn trình độ hay ngôn ngữ thì không được cộng điểm những mục đó', () => {
    const m = scoreCourse(user({ level: null, language: null }), { tagIds: ['t-python'], categoryId: null, level: 'BEGINNER', language: 'vi' });
    expect(m.score).toBe(3);
  });
});
