
import React from 'react';

interface TwemojiIconProps {
  emoji: string;
  className?: string;
  size?: number;
  alt?: string;
}

const TwemojiIcon = ({ emoji, className = "w-6 h-6", size = 24, alt }: TwemojiIconProps) => {
  // Convert emoji to Unicode codepoint for Twemoji CDN
  const getCodepoint = (emoji: string) => {
    return emoji.codePointAt(0)?.toString(16).toLowerCase() || '';
  };

  const codepoint = getCodepoint(emoji);
  const twemojiUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoint}.svg`;

  return (
    <img
      src={twemojiUrl}
      alt={alt || `${emoji} icon`}
      className={className}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
};

export default TwemojiIcon;
