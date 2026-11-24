'use client';

import React, { useState } from 'react';
import {
  ParsedLink,
  parseTextWithLinks,
  extractUniqueLinks,
  LinkType,
} from '@/utils/linkParser';
import { ExternalLink, Globe } from 'lucide-react';

interface SmartDescriptionProps {
  content: string;
  className?: string;
  showQuickLinksBar?: boolean;
}

// 1. WhatsApp Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.39 1.3-1.92 1.38-.49.08-1.12.11-3.64-.93-3.21-1.33-5.27-4.58-5.43-4.8-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.34 1.11-2.66.29-.32.63-.4.84-.4.21 0 .42.01.61.02.2.01.47-.08.73.56.27.68.92 2.25 1 2.41.08.16.13.35.03.56-.11.21-.16.35-.32.53-.16.19-.34.42-.48.56-.16.16-.33.34-.14.66.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.6 1.61.32.16.51.13.7-.08.19-.21.82-.95 1.04-1.28.21-.32.43-.27.72-.16.29.11 1.84.87 2.16 1.03.32.16.53.24.61.38.08.13.08.79-.16 1.47z" />
  </svg>
);

// 2. Instagram Icon
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={`${className} flex-shrink-0`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// 3. Facebook Icon
const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// 4. YouTube Icon
const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// 5. X (Twitter) Icon
const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// 6. LinkedIn Icon
const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// 7. Telegram Icon
const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={`${className} fill-current flex-shrink-0`} viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
  </svg>
);

// Favicon with fallback Globe icon for regular websites
const WebsiteFavicon: React.FC<{ url: string; domain: string }> = ({ url, domain }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Globe className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />;
  }

  return (
    <img
      src={url}
      alt={domain}
      onError={() => setHasError(true)}
      className="w-3.5 h-3.5 rounded-xs flex-shrink-0 object-contain"
    />
  );
};

export const SmartLinkPill: React.FC<{ link: ParsedLink; isCompact?: boolean }> = ({
  link,
  isCompact = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // WhatsApp Button Render
  if (link.type === 'whatsapp') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`Open WhatsApp: ${link.subtitle || link.title}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-xl text-xs font-bold text-slate-950 bg-[#25D366] hover:bg-[#20ba5a] shadow-xs active:scale-95 transition align-baseline group"
      >
        <WhatsAppIcon className="w-4 h-4 fill-slate-950 flex-shrink-0" />
        <span className="font-bold tracking-tight">{link.title}</span>
        {link.subtitle && link.subtitle !== 'Direct WhatsApp' && (
          <span className="text-[11px] font-medium opacity-90 hidden sm:inline">
            ({link.subtitle})
          </span>
        )}
      </a>
    );
  }

  // Instagram Pill Render
  if (link.type === 'instagram') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`Instagram: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-[#E1306C] bg-pink-50 hover:bg-pink-100 border border-pink-200/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
        <span>{link.title}</span>
        {!isCompact && (
          <span className="text-[10px] text-pink-400 font-normal">Instagram</span>
        )}
        <ExternalLink className="w-3 h-3 text-pink-400 group-hover:text-pink-600 transition" />
      </a>
    );
  }

  // Facebook Pill Render
  if (link.type === 'facebook') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`Facebook: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-[#1877F2] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
        <span>{link.title}</span>
        {!isCompact && (
          <span className="text-[10px] text-blue-400 font-normal">Facebook</span>
        )}
        <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600 transition" />
      </a>
    );
  }

  // YouTube Pill Render
  if (link.type === 'youtube') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`YouTube: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-[#FF0000] bg-red-50 hover:bg-red-100 border border-red-200/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <YouTubeIcon className="w-3.5 h-3.5 text-[#FF0000]" />
        <span>{link.title}</span>
        {!isCompact && (
          <span className="text-[10px] text-red-400 font-normal">YouTube</span>
        )}
        <ExternalLink className="w-3 h-3 text-red-400 group-hover:text-red-600 transition" />
      </a>
    );
  }

  // Twitter / X Pill Render
  if (link.type === 'twitter') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`X / Twitter: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <XTwitterIcon className="w-3 h-3 text-slate-900" />
        <span>{link.title}</span>
        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition" />
      </a>
    );
  }

  // LinkedIn Pill Render
  if (link.type === 'linkedin') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`LinkedIn: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-[#0A66C2] bg-sky-50 hover:bg-sky-100 border border-sky-200/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
        <span>{link.title}</span>
        <ExternalLink className="w-3 h-3 text-sky-400 group-hover:text-sky-600 transition" />
      </a>
    );
  }

  // Telegram Pill Render
  if (link.type === 'telegram') {
    return (
      <a
        href={link.normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={`Telegram: ${link.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-[#229ED9] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 shadow-2xs active:scale-95 transition align-baseline group"
      >
        <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
        <span>{link.title}</span>
        <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:text-cyan-600 transition" />
      </a>
    );
  }

  // Default: General Website with Real Domain Favicon
  return (
    <a
      href={link.normalizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      title={`Visit website: ${link.normalizedUrl}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg text-xs font-semibold text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-300/80 shadow-2xs active:scale-95 transition align-baseline group"
    >
      <WebsiteFavicon url={link.faviconUrl} domain={link.domain} />
      <span className="underline decoration-emerald-400/50 underline-offset-2">
        {link.title}
      </span>
      <ExternalLink className="w-3 h-3 text-emerald-700/70 group-hover:text-emerald-900 transition" />
    </a>
  );
};

export const SmartDescription: React.FC<SmartDescriptionProps> = ({
  content,
  className = '',
  showQuickLinksBar = true,
}) => {
  if (!content) return null;

  const segments = parseTextWithLinks(content);
  const uniqueLinks = showQuickLinksBar ? extractUniqueLinks(content) : [];

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Inline Parsed Text */}
      <div className="leading-relaxed whitespace-pre-line font-normal text-slate-800 break-words">
        {segments.map((seg, idx) => {
          if (seg.type === 'text') {
            return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
          }
          return <SmartLinkPill key={idx} link={seg.link} />;
        })}
      </div>

      {/* Quick Links / Social Bar (Shown when multiple or high-value links are detected) */}
      {showQuickLinksBar && uniqueLinks.length > 0 && (
        <div className="pt-2 border-t border-border/70 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mr-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-700" />
            <span>Links &amp; Socials:</span>
          </span>
          {uniqueLinks.map((link, idx) => (
            <SmartLinkPill key={idx} link={link} isCompact={true} />
          ))}
        </div>
      )}
    </div>
  );
};
