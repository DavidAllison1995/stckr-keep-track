
import React from 'react';

interface NotoEmojiIconProps {
  emoji: string;
  className?: string;
  size?: number;
  alt?: string;
}

const NotoEmojiIcon = ({ emoji, className = "w-6 h-6", size = 24, alt }: NotoEmojiIconProps) => {
  // Convert emoji to Unicode codepoint for Noto Emoji CDN
  const getCodepoint = (emoji: string) => {
    return emoji.codePointAt(0)?.toString(16).toLowerCase().padStart(4, '0') || '';
  };

  const codepoint = getCodepoint(emoji);
  const notoEmojiUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.png`;

  return (
    <img
      src={notoEmojiUrl}
      alt={alt || `${emoji} icon`}
      className={className}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
};

export default NotoEmojiIcon;
