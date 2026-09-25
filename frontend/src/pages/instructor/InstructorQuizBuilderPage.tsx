import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useInstructorQuiz, useUpsertQuiz, useDeleteQuiz } from '../../hooks/useQuizzes';
import type { Quiz } from '../../api/quizzes';

type EditableOption = { text: string; isCorrect: boolean };
type EditableQuestion = { text: string; options: EditableOption[] };

const emptyQuestion = (): EditableQuestion => ({
  text: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ],
});

const toEditableQuestions = (quiz: Quiz | null): EditableQuestion[] => {
  if (!quiz || quiz.questions.length === 0) return [emptyQuestion()];
  return quiz.questions.map((q) => ({
    text: q.text,
    options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
  }));
};

const QuizForm = ({ lessonId, quiz }: { lessonId: string; quiz: Quiz | null }) => {
  const navigate = useNavigate();
  const upsertMutation = useUpsertQuiz();
  const deleteMutation = useDeleteQuiz();

  const [title, setTitle] = useState(quiz?.title ?? '');
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70);
  const [questions, setQuestions] = useState<EditableQuestion[]>(() => toEditableQuestions(quiz));

  const updateQuestionText = (qIdx: number, text: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, text } : q)));
  };

  const updateOptionText = (qIdx: number, oIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, text } : o)) } : q,
      ),
    );
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) } : q,
      ),
    );
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q)),
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx || q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== oIdx);
        if (!options.some((o) => o.isCorrect)) options[0].isCorrect = true;
        return { ...q, options };
      }),
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (qIdx: number) => setQuestions((prev) => prev.filter((_, i) => i !== qIdx));

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }
    if (questions.some((q) => !q.text.trim() || q.options.some((o) => !o.text.trim()))) {
      toast.error('Vui lòng điền đầy đủ nội dung câu hỏi và các đáp án');
      return;
    }

    upsertMutation.mutate(
      {
        lessonId,
        body: {
          title: title.trim(),
          passingScore,
          questions: questions.map((q, idx) => ({
            text: q.text.trim(),
            orderIndex: idx,
            options: q.options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
          })),
        },
      },
      { onSuccess: () => toast.success('Đã lưu bài kiểm tra') },
    );
  };

  const handleDelete = () => {
    if (!confirm('Xóa bài kiểm tra này? Toàn bộ lịch sử làm bài của học viên cũng sẽ bị xóa.')) return;
    deleteMutation.mutate(
      { lessonId },
      {
        onSuccess: () => {
          toast.success('Đã xóa bài kiểm tra');
          setTitle('');
          setPassingScore(70);
          setQuestions([emptyQuestion()]);
        },
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Bài kiểm tra</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tạo bài kiểm tra trắc nghiệm tự động chấm điểm cho bài học</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 block">Tiêu đề bài kiểm tra</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra kiến thức chương 1"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 block">Điểm đạt tối thiểu (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-2">{qIdx + 1}.</span>
              <input
                value={q.text}
                onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                placeholder="Nội dung câu hỏi"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qIdx)} className="p-2 text-slate-400 hover:text-rose-600">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="pl-7 space-y-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={opt.isCorrect}
                    onChange={() => setCorrectOption(qIdx, oIdx)}
                    className="accent-emerald-600 flex-shrink-0"
                    title="Đáp án đúng"
                  />
                  <input
                    value={opt.text}
                    onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                    placeholder={`Đáp án ${oIdx + 1}`}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qIdx, oIdx)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addOption(qIdx)}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus size={14} /> Thêm đáp án
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Thêm câu hỏi
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={18} /> {upsertMutation.isPending ? 'Đang lưu...' : 'Lưu bài kiểm tra'}
        </button>
        {quiz && (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 disabled:opacity-50"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
};

const InstructorQuizBuilderPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data: quiz, isLoading } = useInstructorQuiz(lessonId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!lessonId) return null;

  return <QuizForm lessonId={lessonId} quiz={quiz ?? null} />;
};

export default InstructorQuizBuilderPage;
