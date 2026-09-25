/** Đường dẫn để mở khi bấm vào một thông báo (hiện chỉ có thông báo của kênh email). */
export function notificationLink(item: { data?: unknown }, isAdmin: boolean): string | null {
  const d = item.data as { kind?: string; campaignId?: string; ticketId?: string; assignmentId?: string } | null | undefined;
  if (d?.kind === 'email-campaign' && d.campaignId) {
    return isAdmin ? `/admin/email-campaigns/${d.campaignId}` : `/instructor/announcements/${d.campaignId}`;
  }
  if (d?.kind === 'support-ticket' && d.ticketId) return isAdmin ? `/admin/support/${d.ticketId}` : `/support/tickets/${d.ticketId}`;
  if (d?.kind === 'assignment-submission' && d.assignmentId) return `/instructor/assignments/${d.assignmentId}/submissions`;
  if (d?.kind === 'assignment-graded') return '/my-assignments';
  if (d?.kind === 'message') return '/messages';
  return null;
}
