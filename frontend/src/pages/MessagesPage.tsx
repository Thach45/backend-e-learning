import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ban, Loader2, Plus, Send } from 'lucide-react';
import { messagesApi, type Person } from '../api/messages';
import { useSEO } from '../hooks/useSEO';

const errMsg = (e: any) => e?.response?.data?.message ?? 'Không gửi được.';
const Avatar = ({ p }: { p: Person }) => p.avatar ? <img src={p.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">{p.name.charAt(0).toUpperCase()}</div>;

const MessagesPage = () => {
  useSEO({ title: 'Tin nhắn' });
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [picking, setPicking] = useState(false);
  const toParam = params.get('to');
  const bottom = useRef<HTMLDivElement>(null);

  const convos = useQuery({ queryKey: ['messages', 'list'], queryFn: messagesApi.list, refetchInterval: 30_000 });
  const contacts = useQuery({ queryKey: ['messages', 'contacts'], queryFn: () => messagesApi.contacts(), enabled: picking || !!toParam });
  const thread = useQuery({ queryKey: ['messages', 'thread', selected], queryFn: () => messagesApi.messages(selected as string), enabled: !!selected, refetchInterval: 15_000 });
  const current = convos.data?.find((c) => c.id === selected);
  // ?to=<userId>: đi tới cuộc trò chuyện sẵn có hoặc mở khung soạn tin mới
  const existingWithTo = toParam ? convos.data?.find((c) => c.other.id === toParam) : undefined;
  const newTarget: Person | undefined = toParam && !existingWithTo ? [...(contacts.data?.instructors ?? []), ...(contacts.data?.students ?? [])].find((p) => p.id === toParam) : undefined;

  useEffect(() => { if (existingWithTo) { setSelected(existingWithTo.id); setParams({}, { replace: true }); } }, [existingWithTo, setParams]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [thread.data?.messages.length, selected]);
  // Mở cuộc trò chuyện có tin chưa đọc thì đánh dấu đã đọc
  useEffect(() => {
    if (selected && (current?.unread ?? 0) > 0) messagesApi.markRead(selected).then(() => { qc.invalidateQueries({ queryKey: ['messages', 'list'] }); qc.invalidateQueries({ queryKey: ['messages', 'unread'] }); });
  }, [selected, current?.unread, thread.data, qc]);

  const done = () => { setDraft(''); qc.invalidateQueries({ queryKey: ['messages'] }); };
  const send = useMutation({ mutationFn: () => messagesApi.send(selected as string, draft.trim()), onSuccess: done, onError: (e) => toast.error(errMsg(e)) });
  const start = useMutation({
    mutationFn: (to: string) => messagesApi.start(to, draft.trim()),
    onSuccess: (r) => { done(); setSelected(r.conversationId); setPicking(false); setParams({}, { replace: true }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const block = useMutation({ mutationFn: (b: boolean) => messagesApi.block(selected as string, b), onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }), onError: (e) => toast.error(errMsg(e)) });
  const [composeTo, setComposeTo] = useState<Person | null>(null);
  const target = newTarget ?? composeTo;

  const canSend = draft.trim().length > 0 && !send.isPending && !start.isPending;
  const submit = () => { if (!canSend) return; if (selected && !target) send.mutate(); else if (target) start.mutate(target.id); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tin nhắn</h1>
        <button onClick={() => { setPicking((p) => !p); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><Plus size={16} /> Tin nhắn mới</button>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[520px]">
        <aside className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[70vh]">
          {picking && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1 bg-slate-50 dark:bg-slate-950">
              <p className="text-xs font-semibold text-slate-500">Chọn người nhận</p>
              {contacts.isLoading ? <Loader2 className="animate-spin" size={16} /> : [...(contacts.data?.instructors ?? []).map((p) => ({ p, role: 'Giảng viên' })), ...(contacts.data?.students ?? []).map((p) => ({ p, role: 'Học viên' }))].map(({ p, role }) => (
                <button key={`${role}-${p.id}`} onClick={() => { const ex = convos.data?.find((c) => c.other.id === p.id); if (ex) setSelected(ex.id), setComposeTo(null); else { setComposeTo(p); setSelected(null); } setPicking(false); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-left text-sm"><Avatar p={p} /><span className="flex-1 truncate">{p.name}</span><span className="text-xs text-slate-400">{role}</span></button>
              ))}
              {contacts.data && contacts.data.instructors.length + contacts.data.students.length === 0 && <p className="text-xs text-slate-400">Bạn chỉ nhắn được cho giảng viên của khoá đã ghi danh hoặc học viên của mình.</p>}
            </div>
          )}
          {convos.isLoading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : convos.data?.map((c) => (
            <button key={c.id} onClick={() => { setSelected(c.id); setComposeTo(null); }} className={`w-full flex items-center gap-3 p-3 text-left border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 ${selected === c.id ? 'bg-indigo-50 dark:bg-slate-800' : ''}`}>
              <Avatar p={c.other} />
              <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{c.other.name}</p><p className="text-xs text-slate-500 truncate">{c.lastMessage ? `${c.lastMessage.mine ? 'Bạn: ' : ''}${c.lastMessage.preview}` : ''}</p></div>
              {c.unread > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>}
            </button>
          ))}
          {convos.data?.length === 0 && !picking && <p className="p-6 text-sm text-slate-400 text-center">Chưa có cuộc trò chuyện nào.</p>}
        </aside>

        <section className="flex flex-col min-h-[420px]">
          {!selected && !target ? <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Chọn một cuộc trò chuyện hoặc bắt đầu tin nhắn mới.</div> : (
            <>
              <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                {(current?.other ?? target) && <Avatar p={(current?.other ?? target) as Person} />}
                <p className="font-semibold flex-1">{(current?.other ?? target)?.name}</p>
                {current && <button onClick={() => block.mutate(!current.blockedByMe)} disabled={current.blocked && !current.blockedByMe} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 disabled:opacity-40"><Ban size={14} /> {current.blockedByMe ? 'Bỏ chặn' : 'Chặn'}</button>}
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[52vh]">
                {selected && thread.isLoading && <Loader2 className="animate-spin mx-auto" />}
                {selected && thread.data?.hasMore && <p className="text-center text-xs text-slate-400">Chỉ hiện 30 tin gần nhất.</p>}
                {selected && thread.data?.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${m.mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
                      {m.body}
                      <div className={`text-[10px] mt-1 ${m.mine ? 'text-indigo-200' : 'text-slate-400'}`}>{new Date(m.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              {current?.blocked ? <p className="p-4 text-center text-sm text-slate-400 border-t border-slate-200 dark:border-slate-800">{current.blockedByMe ? 'Bạn đã chặn cuộc trò chuyện này.' : 'Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.'}</p> : (
                <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-800">
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={1} maxLength={2000} placeholder="Nhập tin nhắn (Enter để gửi)" className="flex-1 resize-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm" />
                  <button disabled={!canSend} className="px-4 rounded-xl bg-indigo-600 text-white disabled:opacity-50" aria-label="Gửi"><Send size={16} /></button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
