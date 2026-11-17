import { cn } from '../lib/utils';

const NATIVE: Record<string, string> = {
  kn: "ಕನ್ನಡ", 
  te: "తెలుగు", 
  ta: "தமிழ்", 
  ml: "മലയാളം",
  hi: "हिन्दी", 
  bn: "বাংলা", 
  mr: "मराठी", 
  gu: "ગુજરાતી", 
  en: "EN"
};

interface Props {
  code: string | null | undefined;
  size?: "sm" | "md";
  showNative?: boolean;
  className?: string;
}

export function LanguageBadge({ code, size = "sm", showNative = true, className }: Props) {
  // If no language code is provided, default to English
  const langCode = code?.toLowerCase() || 'en';
  
  // Use native script if available and requested, otherwise use the uppercase code
  const label = showNative && NATIVE[langCode] ? NATIVE[langCode] : langCode.toUpperCase();
  
  return (
    <span className={cn(
      "font-medium tracking-wide bg-black/60 dark:bg-black/80 text-white backdrop-blur-sm rounded-md shadow-sm",
      size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
      className
    )}>
      {label}
    </span>
  );
}