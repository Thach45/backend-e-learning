import { useEffect } from 'react';

const SITE_NAME = 'U Đê Mê';

type SEOOptions = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
};

const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
  let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonical = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

/** Đặt title/description/OG tags/canonical cho trang hiện tại. Chỉ cập nhật DOM, không cần thư viện ngoài. */
export const useSEO = ({ title, description, image, url }: SEOOptions) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:type', 'website');
    if (image) setMetaTag('property', 'og:image', image);

    const canonicalUrl = url || window.location.href;
    setMetaTag('property', 'og:url', canonicalUrl);
    setCanonical(canonicalUrl);
  }, [title, description, image, url]);
};
