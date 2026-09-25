/** Đường dẫn để mở khi bấm vào một thông báo (hiện chỉ có thông báo của kênh email). */
export function notificationLink(item: { data?: unknown }, isAdmin: boolean): string | null {
  const d = item.data as { kind?: string; campaignId?: string } | null | undefined;
  if (d?.kind === 'email-campaign' && d.campaignId) {
    return isAdmin ? `/admin/email-campaigns/${d.campaignId}` : `/instructor/announcements/${d.campaignId}`;
  }
  return null;
}
