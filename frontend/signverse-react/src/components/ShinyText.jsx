/* Text with a light sweep passing over it. (React Bits "ShinyText" style) */
export default function ShinyText({ text, speed = 3.5, className = '', children }) {
  return <span className={'shiny ' + className} style={{ '--shine-speed': speed + 's' }}>{text ?? children}</span>;
}
