import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supportApi, type TicketCategory, type TicketPriority, type TicketStatus } from '../api/support';

const errMsg = (e: unknown, fallback: string) => {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(m) ? m.join(', ') : m) || fallback;
};

export const useFaqs = (q?: string) => useQuery({ queryKey: ['faqs', q], queryFn: () => supportApi.faqs(q), staleTime: 60_000 });
export const useMyTickets = (params?: { page?: number; status?: TicketStatus }) => useQuery({ queryKey: ['my-tickets', params], queryFn: () => supportApi.listMine(params) });
export const useTicket = (id: string) =>
  useQuery({ queryKey: ['ticket', id], queryFn: () => supportApi.get(id), enabled: !!id, refetchInterval: 20_000 });
export const useAdminTickets = (params?: { page?: number; status?: TicketStatus; category?: TicketCategory; assigned?: string; search?: string }) =>
  useQuery({ queryKey: ['admin-tickets', params], queryFn: () => supportApi.listAdmin(params), refetchInterval: 20_000 });

const useTicketMutation = <TArg, TRes>(fn: (a: TArg) => Promise<TRes>, ok?: string, fail = 'Thao tác thất bại.') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket'] });
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      if (ok) toast.success(ok);
    },
    onError: (e) => toast.error(errMsg(e, fail)),
  });
};

export const useCreateTicket = () => useTicketMutation((b: { subject: string; category: TicketCategory; body: string }) => supportApi.create(b), 'Đã gửi yêu cầu hỗ trợ.', 'Không thể gửi yêu cầu.');
export const usePostTicketMessage = () => useTicketMutation(({ id, body }: { id: string; body: string }) => supportApi.post(id, body), undefined, 'Không thể gửi tin nhắn.');
export const useCloseTicket = () => useTicketMutation((id: string) => supportApi.close(id), 'Đã đóng yêu cầu.', 'Không thể đóng yêu cầu.');
export const useReplyTicket = () => useTicketMutation(({ id, body }: { id: string; body: string }) => supportApi.reply(id, body), 'Đã gửi phản hồi.', 'Không thể gửi phản hồi.');
export const useUpdateTicket = () =>
  useTicketMutation(({ id, body }: { id: string; body: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null } }) => supportApi.update(id, body), 'Đã cập nhật.', 'Không thể cập nhật.');

export const useFaqAdmin = () => useQuery({ queryKey: ['faq-admin'], queryFn: supportApi.faqAdmin });
const useFaqMutation = <TArg, TRes>(fn: (a: TArg) => Promise<TRes>, ok: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faq-admin'] });
      qc.invalidateQueries({ queryKey: ['faqs'] });
      toast.success(ok);
    },
    onError: (e) => toast.error(errMsg(e, 'Thao tác thất bại.')),
  });
};
export const useCreateFaqCategory = () => useFaqMutation((b: { name: string; orderIndex?: number }) => supportApi.createCategory(b), 'Đã tạo danh mục.');
export const useUpdateFaqCategory = () => useFaqMutation(({ id, body }: { id: string; body: { name?: string; orderIndex?: number } }) => supportApi.updateCategory(id, body), 'Đã lưu danh mục.');
export const useDeleteFaqCategory = () => useFaqMutation((id: string) => supportApi.deleteCategory(id), 'Đã xoá danh mục.');
export const useCreateFaqItem = () => useFaqMutation((b: { categoryId: string; question: string; answer: string; isPublished?: boolean }) => supportApi.createItem(b), 'Đã thêm câu hỏi.');
export const useUpdateFaqItem = () => useFaqMutation(({ id, body }: { id: string; body: Partial<{ categoryId: string; question: string; answer: string; isPublished: boolean; orderIndex: number }> }) => supportApi.updateItem(id, body), 'Đã lưu câu hỏi.');
export const useDeleteFaqItem = () => useFaqMutation((id: string) => supportApi.deleteItem(id), 'Đã xoá câu hỏi.');
