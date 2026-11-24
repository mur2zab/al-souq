export type LinkType =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'telegram'
  | 'website';

export interface ParsedLink {
  rawUrl: string;
  normalizedUrl: string;
  type: LinkType;
  title: string;
  subtitle?: string;
  domain: string;
  faviconUrl: string;
  accountHandle?: string;
}

export type TextSegment =
  | { type: 'text'; content: string }
  | { type: 'link'; link: ParsedLink };

// Regex matching URLs: starting with http://, https://, or common prefixes like wa.me, www., instagram.com, etc.
const URL_REGEX =
  /(https?:\/\/[^\s<>"'`]+|(?:www\.|wa\.me\/|chat\.whatsapp\.com\/|instagram\.com\/|instagr\.am\/|facebook\.com\/|fb\.com\/|fb\.watch\/|youtube\.com\/|youtu\.be\/|twitter\.com\/|x\.com\/|linkedin\.com\/|t\.me\/)[^\s<>"'`]+)/gi;

/**
 * Strips trailing sentence punctuation from matched URLs so that e.g. "wa.me/919820011223." doesn't fail.
 */
function cleanMatchedUrl(raw: string): { url: string; trailing: string } {
  let url = raw;
  let trailing = '';

  while (url.length > 0 && /[.,;:!?)'"\]}>]$/.test(url)) {
    const lastChar = url.slice(-1);
    // If it's a closing parenthesis, but the URL opened one (e.g. Wikipedia URL), keep it
    if (
      lastChar === ')' &&
      (url.match(/\(/g) || []).length >= (url.match(/\)/g) || []).length
    ) {
      break;
    }
    trailing = lastChar + trailing;
    url = url.slice(0, -1);
  }

  return { url, trailing };
}

/**
 * Format raw phone strings into readable international format (+91 98200 11223)
 */
function formatPhoneNumber(numStr: string): string {
  const digits = numStr.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (numStr.startsWith('+')) {
    return numStr;
  }
  return `+${digits}`;
}

/**
 * Classifies a URL and extracts human-readable title, account handle, and domain favicon
 */
export function classifyLink(urlInput: string): ParsedLink {
  let normalizedUrl = urlInput.trim();
  if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith('whatsapp://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let domain = '';
  let pathname = '';
  let searchParams: URLSearchParams | null = null;

  try {
    const parsed = new URL(normalizedUrl);
    domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    pathname = parsed.pathname;
    searchParams = parsed.searchParams;
  } catch {
    domain = urlInput.split('/')[0].replace(/^www\./i, '').toLowerCase();
  }

  // Google Favicon service provider for high-res 32px favicons
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  // 1. WhatsApp
  if (
    domain === 'wa.me' ||
    domain.includes('whatsapp.com') ||
    normalizedUrl.startsWith('whatsapp://')
  ) {
    const waFavicon = 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=32';
    if (domain === 'chat.whatsapp.com' || pathname.startsWith('/chat/')) {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'whatsapp',
        title: 'Join WhatsApp Group',
        subtitle: 'Community Group',
        domain: 'whatsapp.com',
        faviconUrl: waFavicon,
      };
    }

    // Direct phone number in wa.me/NUMBER
    const phoneMatch = pathname.match(/^\/(\+?\d+)/);
    if (phoneMatch && phoneMatch[1]) {
      const formatted = formatPhoneNumber(phoneMatch[1]);
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'whatsapp',
        title: `Chat on WhatsApp`,
        subtitle: formatted,
        domain: 'whatsapp.com',
        faviconUrl: waFavicon,
      };
    }

    // Phone in query param ?phone=NUMBER
    const phoneParam = searchParams?.get('phone');
    if (phoneParam) {
      const formatted = formatPhoneNumber(phoneParam);
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'whatsapp',
        title: `Chat on WhatsApp`,
        subtitle: formatted,
        domain: 'whatsapp.com',
        faviconUrl: waFavicon,
      };
    }

    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'whatsapp',
      title: 'Chat on WhatsApp',
      subtitle: 'Direct WhatsApp',
      domain: 'whatsapp.com',
      faviconUrl: waFavicon,
    };
  }

  // 2. Instagram
  if (domain === 'instagram.com' || domain === 'instagr.am') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');

    if (segments[0] === 'p') {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'instagram',
        title: 'Instagram Post',
        subtitle: 'View on Instagram',
        domain: 'instagram.com',
        faviconUrl,
      };
    }
    if (segments[0] === 'reel' || segments[0] === 'reels') {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'instagram',
        title: 'Instagram Reel',
        subtitle: 'Watch Reel',
        domain: 'instagram.com',
        faviconUrl,
      };
    }
    if (segments[0] === 'stories') {
      const user = segments[1] ? `@${segments[1]}` : 'Story';
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'instagram',
        title: `Instagram Story (${user})`,
        subtitle: 'View Story',
        domain: 'instagram.com',
        faviconUrl,
      };
    }
    if (segments[0] && segments[0] !== 'explore' && segments[0] !== 'direct') {
      const handle = segments[0].replace(/^@/, '');
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'instagram',
        title: `@${handle}`,
        subtitle: 'Instagram Profile',
        domain: 'instagram.com',
        accountHandle: handle,
        faviconUrl,
      };
    }

    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'instagram',
      title: 'Instagram',
      subtitle: 'View on Instagram',
      domain: 'instagram.com',
      faviconUrl,
    };
  }

  // 3. Facebook
  if (domain === 'facebook.com' || domain === 'fb.com' || domain === 'fb.watch') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');

    if (segments[0] === 'groups') {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'facebook',
        title: segments[1] ? `Facebook Group: ${decodeURIComponent(segments[1])}` : 'Facebook Group',
        subtitle: 'Community Group',
        domain: 'facebook.com',
        faviconUrl,
      };
    }
    if (domain === 'fb.watch' || segments[0] === 'watch') {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'facebook',
        title: 'Facebook Video',
        subtitle: 'Watch Video',
        domain: 'facebook.com',
        faviconUrl,
      };
    }
    if (segments[0]) {
      const pageName = decodeURIComponent(segments[0]);
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'facebook',
        title: pageName.length > 25 ? `${pageName.slice(0, 22)}...` : pageName,
        subtitle: 'Facebook Page',
        domain: 'facebook.com',
        accountHandle: pageName,
        faviconUrl,
      };
    }

    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'facebook',
      title: 'Facebook Page',
      subtitle: 'View on Facebook',
      domain: 'facebook.com',
      faviconUrl,
    };
  }

  // 4. YouTube
  if (domain === 'youtube.com' || domain === 'youtu.be') {
    const ytFavicon = 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32';
    if (domain === 'youtu.be' || pathname.includes('/watch')) {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'youtube',
        title: 'Watch on YouTube',
        subtitle: 'Video',
        domain: 'youtube.com',
        faviconUrl: ytFavicon,
      };
    }
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    if (cleanPath.startsWith('@')) {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'youtube',
        title: `${cleanPath}`,
        subtitle: 'YouTube Channel',
        domain: 'youtube.com',
        accountHandle: cleanPath,
        faviconUrl: ytFavicon,
      };
    }
    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'youtube',
      title: 'YouTube Video',
      subtitle: 'Watch on YouTube',
      domain: 'youtube.com',
      faviconUrl: ytFavicon,
    };
  }

  // 5. Twitter / X
  if (domain === 'twitter.com' || domain === 'x.com') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');
    if (segments[1] === 'status') {
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'twitter',
        title: segments[0] ? `Post by @${segments[0]}` : 'Post on X',
        subtitle: 'View on X',
        domain: 'x.com',
        faviconUrl,
      };
    }
    if (segments[0]) {
      const handle = segments[0].replace(/^@/, '');
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'twitter',
        title: `@${handle}`,
        subtitle: 'Follow on X',
        domain: 'x.com',
        accountHandle: handle,
        faviconUrl,
      };
    }
    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'twitter',
      title: 'Follow on X',
      subtitle: 'X Profile',
      domain: 'x.com',
      faviconUrl,
    };
  }

  // 6. Telegram
  if (domain === 't.me' || domain === 'telegram.me') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');
    if (segments[0]) {
      const handle = segments[0].replace(/^@/, '');
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'telegram',
        title: `@${handle}`,
        subtitle: 'Telegram Channel',
        domain: 'telegram.org',
        accountHandle: handle,
        faviconUrl,
      };
    }
    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'telegram',
      title: 'Telegram Channel',
      subtitle: 'Join on Telegram',
      domain: 'telegram.org',
      faviconUrl,
    };
  }

  // 7. LinkedIn
  if (domain.includes('linkedin.com')) {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');
    if (segments[0] === 'in' && segments[1]) {
      const name = segments[1].replace(/-/g, ' ');
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'linkedin',
        title: name.length > 25 ? `${name.slice(0, 22)}...` : name,
        subtitle: 'LinkedIn Profile',
        domain: 'linkedin.com',
        accountHandle: segments[1],
        faviconUrl,
      };
    }
    if (segments[0] === 'company' && segments[1]) {
      const name = segments[1].replace(/-/g, ' ');
      return {
        rawUrl: urlInput,
        normalizedUrl,
        type: 'linkedin',
        title: `${name}`,
        subtitle: 'LinkedIn Company',
        domain: 'linkedin.com',
        accountHandle: segments[1],
        faviconUrl,
      };
    }
    return {
      rawUrl: urlInput,
      normalizedUrl,
      type: 'linkedin',
      title: 'LinkedIn',
      subtitle: 'View Profile',
      domain: 'linkedin.com',
      faviconUrl,
    };
  }

  // 8. General Website
  const cleanPath = pathname.length > 1 ? pathname : '';
  const displayTitle = cleanPath && cleanPath.length <= 15 ? `${domain}${cleanPath}` : domain;

  return {
    rawUrl: urlInput,
    normalizedUrl,
    type: 'website',
    title: displayTitle,
    subtitle: 'Website',
    domain,
    faviconUrl,
  };
}

/**
 * Parses full text into rich segments of plain text and categorized links.
 */
export function parseTextWithLinks(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Clone regex with sticky/global flags
  const regex = new RegExp(URL_REGEX.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const rawMatch = match[0];

    // Push text before this match
    if (matchStart > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchStart),
      });
    }

    // Clean matched URL of trailing punctuation
    const { url, trailing } = cleanMatchedUrl(rawMatch);

    if (url.length > 0) {
      const parsedLink = classifyLink(url);
      segments.push({
        type: 'link',
        link: parsedLink,
      });
    }

    // If there was trailing punctuation, add it as text
    if (trailing.length > 0) {
      segments.push({
        type: 'text',
        content: trailing,
      });
    }

    lastIndex = matchStart + rawMatch.length;
  }

  // Push remaining trailing text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Extracts unique links from text (useful for a summary/media bar)
 */
export function extractUniqueLinks(text: string): ParsedLink[] {
  const segments = parseTextWithLinks(text);
  const links: ParsedLink[] = [];
  const seen = new Set<string>();

  for (const seg of segments) {
    if (seg.type === 'link') {
      if (!seen.has(seg.link.normalizedUrl)) {
        seen.add(seg.link.normalizedUrl);
        links.push(seg.link);
      }
    }
  }

  return links;
}
