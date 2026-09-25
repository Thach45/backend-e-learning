import apiClient from './axios';

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

export type Assignment = {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string;
  dueAt: string | null;
  maxScore: number;
  allowLate: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MySubmissionLite = { status: SubmissionStatus; score: number | null; isLate: boolean; submittedAt: string } | null;
export type StudentAssignment = Assignment & { mySubmission: MySubmissionLite; course?: { id: string; title: string } };

export type Submission = {
  id: string;
  assignmentId: string;
  userId: string;
  textContent: string | null;
  fileUrl: string | null;
  fileName: string | null;
  status: SubmissionStatus;
  isLate: boolean;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  submittedAt: string;
};

export type InstructorAssignment = Assignment & { submissionCount: number; pendingCount: number; gradedCount: number };
export type AssignmentInput = {
  title: string;
  description: string;
  dueAt?: string | null;
  maxScore?: number;
  allowLate?: boolean;
  isPublished?: boolean;
};

export const SUBMISSION_LABELS: Record<SubmissionStatus, { label: string; cls: string }> = {
  SUBMITTED: { label: 'Đã nộp, chờ chấm', cls: 'bg-amber-100 text-amber-800' },
  GRADED: { label: 'Đã chấm', cls: 'bg-emerald-100 text-emerald-800' },
  RETURNED: { label: 'Cần sửa lại', cls: 'bg-red-100 text-red-700' },
};

export const assignmentsApi = {
  // Giảng viên
  listForInstructor: async (courseId: string): Promise<InstructorAssignment[]> =>
    (await apiClient.get(`/instructor/courses/${courseId}/assignments`)).data.data,
  create: async (courseId: string, body: AssignmentInput): Promise<Assignment> =>
    (await apiClient.post(`/instructor/courses/${courseId}/assignments`, body)).data.data,
  update: async (id: string, body: Partial<AssignmentInput>): Promise<Assignment> =>
    (await apiClient.put(`/instructor/assignments/${id}`, body)).data.data,
  remove: async (id: string) => { await apiClient.delete(`/instructor/assignments/${id}`); },
  listSubmissions: async (id: string, params?: { status?: SubmissionStatus; page?: number; limit?: number }) =>
    (await apiClient.get(`/instructor/assignments/${id}/submissions`, { params })).data.data as {
      assignment: Assignment;
      data: Array<Submission & { user: { id: string; name: string; avatar: string | null } }>;
      total: number;
      page: number;
      totalPages: number;
    },
  grade: async (submissionId: string, body: { score?: number; feedback?: string | null; returnForRevision?: boolean }): Promise<Submission> =>
    (await apiClient.put(`/instructor/submissions/${submissionId}/grade`, body)).data.data,

  // Học viên
  myAssignments: async (): Promise<StudentAssignment[]> => (await apiClient.get('/my-assignments')).data.data,
  getOne: async (id: string): Promise<Assignment & { mySubmission: Submission | null }> => (await apiClient.get(`/assignments/${id}`)).data.data,
  submit: async (id: string, body: { textContent?: string | null; fileUrl?: string | null; fileName?: string | null }): Promise<Submission> =>
    (await apiClient.put(`/assignments/${id}/submission`, body)).data.data,
  uploadFile: async (file: File): Promise<{ url: string; originalFilename: string }> => {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/upload/file', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
  },
};
