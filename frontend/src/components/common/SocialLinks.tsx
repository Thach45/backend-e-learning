import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePublicSiteSettings } from '../../hooks/useSiteSettings';
import type { SocialKey } from '../../api/siteSettings';

const ICONS: Record<SocialKey, { label: string; icon: ReactNode }> = {
  facebookUrl: { label: 'Facebook', icon: <Facebook size={20} /> },
  instagramUrl: { label: 'Instagram', icon: <Instagram size={20} /> },
  twitterUrl: { label: 'X (Twitter)', icon: <Twitter size={20} /> },
  youtubeUrl: { label: 'YouTube', icon: <Youtube size={20} /> },
  linkedinUrl: { label: 'LinkedIn', icon: <Linkedin size={20} /> },
  // lucide không có biểu tượng TikTok/Zalo: dùng chữ viết tắt
  tiktokUrl: { label: 'TikTok', icon: <span className="text-xs font-bold">TikTok</span> },
  zaloUrl: { label: 'Zalo', icon: <span className="text-xs font-bold">Zalo</span> },
};

/** Chỉ hiện các mạng xã hội admin đã nhập link (cấu hình ở /admin/settings). Chưa có link nào thì không hiện gì. */
const SocialLinks = ({ className = 'flex gap-4' }: { className?: string }) => {
  const { data } = usePublicSiteSettings();
  const items = (Object.keys(ICONS) as SocialKey[]).filter((k) => data?.social?.[k]);
  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((key) => (
        <a
          key={key}
          href={data!.social[key]!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ICONS[key].label}
          title={ICONS[key].label}
          className="hover:text-white transition-colors flex items-center"
        >
          {ICONS[key].icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
