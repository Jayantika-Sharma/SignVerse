import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Media, useMediaVersion } from '../lib/media.js';

/* <video> bound to the shared camera stream (mirrored like a mirror). */
const CamVideo = forwardRef(function CamVideo({ className = '' }, outRef) {
  const ref = useRef(null);
  const v = useMediaVersion();
  useImperativeHandle(outRef, () => ref.current);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (Media.hasVideo()) { el.srcObject = null; el.srcObject = Media.stream; el.play().catch(() => {}); }
    else el.srcObject = null;
  }, [v]);
  return <video ref={ref} className={'camvideo ' + className} autoPlay playsInline muted />;
});
export default CamVideo;
