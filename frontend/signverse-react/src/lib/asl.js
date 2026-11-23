/* ASL fingerspelling alphabet: how to make each letter + a simplified drawing recipe.
 * Drawing recipe (used by components/AslHand.jsx):
 *   f   = [index, middle, ring, pinky]: 'u' up · 'd' folded down · 'h' hooked
 *   t   = thumb: 'out' · 'up' · 'across' · 'tuck' · 'between' · 'none'
 *   a   = optional finger tilt angles (spread / crossed fingers)
 *   rot = turn the whole hand (sideways / pointing down)
 *   ring= draw a ring/arc: 'o' full circle · 'c' open C · 'd' (D) · 'f' (F)
 *   move= 'J' | 'Z' (letters you draw in the air)                         */
export const LETTERS = [
  { ch: 'A', tip: 'Make a fist with your thumb resting along the side of your index finger, pointing up.', s: { f: 'dddd', t: 'up' } },
  { ch: 'B', tip: 'Hold your hand flat with the fingers together pointing up and fold your thumb across your palm.', s: { f: 'uuuu', t: 'across' } },
  { ch: 'C', tip: 'Curve your fingers and thumb into the shape of the letter C.', s: { ring: 'c' } },
  { ch: 'D', tip: 'Point your index finger up. Curl the other fingers so they touch your thumb, making a small circle.', s: { f: 'uddd', t: 'none', ring: 'd' } },
  { ch: 'E', tip: 'Bend all four fingers down and curl them, with your thumb tucked underneath the fingertips.', s: { f: 'hhhh', t: 'tuck' } },
  { ch: 'F', tip: 'Touch your thumb and index finger together to make a circle. Keep the other three fingers up.', s: { f: 'duuu', t: 'none', ring: 'f' } },
  { ch: 'G', tip: 'Point your index finger and thumb sideways, parallel, like a small pinch. The other fingers stay closed.', s: { f: 'uddd', t: 'out', rot: -90 } },
  { ch: 'H', tip: 'Point your index and middle fingers together sideways. Tuck your thumb in.', s: { f: 'uudd', t: 'tuck', rot: -90 } },
  { ch: 'I', tip: 'Make a fist and lift only your little finger straight up.', s: { f: 'dddu', t: 'across' } },
  { ch: 'J', tip: 'Make the letter I, then draw a J in the air with your little finger.', s: { f: 'dddu', t: 'across', move: 'J' } },
  { ch: 'K', tip: 'Raise your index and middle fingers in a V and place your thumb between them, touching the middle finger.', s: { f: 'uudd', t: 'between', a: [-9, 9, 0, 0] } },
  { ch: 'L', tip: 'Point your index finger up and your thumb out to the side to make an L.', s: { f: 'uddd', t: 'out' } },
  { ch: 'M', tip: 'Tuck your thumb under your first three fingers (index, middle, ring), which fold over it.', s: { f: 'dddd', t: 'tuck', over: 3 } },
  { ch: 'N', tip: 'Tuck your thumb under your first two fingers (index and middle), which fold over it.', s: { f: 'dddd', t: 'tuck', over: 2 } },
  { ch: 'O', tip: 'Curve all your fingertips down to touch your thumb so your hand makes an O.', s: { ring: 'o' } },
  { ch: 'P', tip: 'Make a K, then turn your hand so the fingers point down and the palm faces away.', s: { f: 'uudd', t: 'between', a: [-9, 9, 0, 0], rot: 165 } },
  { ch: 'Q', tip: 'Make a G, then turn your hand so your index finger and thumb point down.', s: { f: 'uddd', t: 'out', rot: 180 } },
  { ch: 'R', tip: 'Cross your middle finger over your index finger. Keep the other fingers closed.', s: { f: 'uudd', t: 'across', a: [7, -7, 0, 0] } },
  { ch: 'S', tip: 'Make a fist with your thumb wrapped across the front of your fingers.', s: { f: 'dddd', t: 'across' } },
  { ch: 'T', tip: 'Make a fist and tuck your thumb between your index and middle fingers.', s: { f: 'dddd', t: 'between' } },
  { ch: 'U', tip: 'Raise your index and middle fingers together. Your thumb holds the other two fingers down.', s: { f: 'uudd', t: 'across' } },
  { ch: 'V', tip: 'Raise your index and middle fingers and spread them apart in a V. Your thumb holds the other two down.', s: { f: 'uudd', t: 'across', a: [-11, 11, 0, 0] } },
  { ch: 'W', tip: 'Raise your index, middle and ring fingers and spread them. Your thumb holds your little finger down.', s: { f: 'uuud', t: 'across', a: [-13, 0, 13, 0] } },
  { ch: 'X', tip: 'Make a fist and bend your index finger into a hook.', s: { f: 'hddd', t: 'across' } },
  { ch: 'Y', tip: 'Stick out your thumb and little finger and fold the other three fingers in.', s: { f: 'dddu', t: 'out' } },
  { ch: 'Z', tip: 'Point your index finger and draw the letter Z in the air.', s: { f: 'uddd', t: 'across', move: 'Z' } }
];
