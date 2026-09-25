import { STATUS_LABELS, type CampaignStatus } from '../../api/emailCampaigns';

const StatusBadge = ({ status }: { status: CampaignStatus }) => (
  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_LABELS[status].cls}`}>{STATUS_LABELS[status].label}</span>
);
export default StatusBadge;
