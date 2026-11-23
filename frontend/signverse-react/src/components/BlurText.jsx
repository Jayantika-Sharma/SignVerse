import { useEffect, useState } from 'react';

/* Words (or letters) fade in out of a blur, one after another. (React Bits "BlurText" style) */
export default function BlurText({ text, as: Tag = 'span', by = 'words', delay = 90, startDelay = 0, className = '' }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), 40 + startDelay);
    return () => clearTimeout(t);
  }, [text, startDelay]);
  const parts = by === 'letters' ? [...text] : text.split(' ');
  return (
    <Tag className={'blurtext ' + (on ? 'on ' : '') + className} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} className="bt-part" aria-hidden="true" style={{ transitionDelay: `${i * delay}ms` }}>
          {p === ' ' ? ' ' : p}{by === 'words' && i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
