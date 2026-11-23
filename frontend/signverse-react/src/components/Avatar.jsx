/* Cute placeholder shown when the camera is off. */
export default function Avatar({ label = 'Camera is off' }) {
  return (
    <div className="avatar-ph">
      <div className="cute">
        <span className="z z1">z</span><span className="z z2">z</span><span className="z z3">Z</span>
        <i className="spark s1" /><i className="spark s2" />
        <div className="cute-char">
          <div className="ear l" /><div className="ear r" />
          <div className="cute-head">
            <div className="eye l" /><div className="eye r" />
            <div className="cheek l" /><div className="cheek r" />
            <div className="mouth" />
          </div>
          <div className="cute-body"><div className="cute-heart" /></div>
        </div>
        <span className="cute-label">{label}</span>
      </div>
    </div>
  );
}
