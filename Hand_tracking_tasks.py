import os
import time
import urllib.request

import cv2 as cv
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hand_landmarker.task")

SWAP_HANDEDNESS = True

HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),          # thumb
    (0, 5), (5, 6), (6, 7), (7, 8),          # index
    (5, 9), (9, 10), (10, 11), (11, 12),     # middle
    (9, 13), (13, 14), (14, 15), (15, 16),   # ring
    (13, 17), (17, 18), (18, 19), (19, 20),  # pinky
    (0, 17),                                 # palm edge
]


def ensure_model():
    if os.path.exists(MODEL_PATH):
        return
    print("Downloading hand_landmarker.task ...")
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Downloaded to", MODEL_PATH)
    except Exception as e:
        raise SystemExit(
            f"Could not download the model ({e}).\n"
            f"Download it manually from:\n{MODEL_URL}\n"
            f"and save it as:\n{MODEL_PATH}"
        )


def resolve_handedness(label):
    """Apply the SWAP_HANDEDNESS toggle to a raw 'Left'/'Right' label."""
    if not SWAP_HANDEDNESS:
        return label
    return "Right" if label == "Left" else "Left"


def draw_panel(frame, label, pts, w):
    """Left hand's coordinates on the left of the screen, right hand's on the right."""
    x0 = 10 if label == "Left" else w - 165
    cv.putText(frame, f"{label} hand", (x0, 100),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    for i, (px, py) in enumerate(pts):
        cv.putText(frame, f"{i:2d}: ({px}, {py})", (x0, 120 + i * 16),
                   cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)


ensure_model()

options = vision.HandLandmarkerOptions(
    base_options=mp_python.BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=vision.RunningMode.VIDEO,
    num_hands=2,
    min_hand_detection_confidence=0.6,
    min_tracking_confidence=0.5,
)
detector = vision.HandLandmarker.create_from_options(options)

capture = cv.VideoCapture(0)
if not capture.isOpened():
    raise SystemExit("Could not open webcam")

start = time.time()
last_ts = -1

while True:
    ok, frame = capture.read()
    if not ok:
        print("Could not read a frame")
        break

    frame = cv.flip(frame, 1)  # mirror view (also gives correct handedness input)
    h, w, _ = frame.shape

    rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    # Timestamps must be strictly increasing (milliseconds)
    ts = int((time.time() - start) * 1000)
    if ts <= last_ts:
        ts = last_ts + 1
    last_ts = ts

    result = detector.detect_for_video(mp_image, ts)

    for idx, landmarks in enumerate(result.hand_landmarks):
        raw_label = result.handedness[idx][0].category_name  # "Left" / "Right"
        label = resolve_handedness(raw_label)

        # Convert normalized coords (0-1) to pixel coords
        pts = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]

        # Skeleton lines
        for a, b in HAND_CONNECTIONS:
            cv.line(frame, pts[a], pts[b], (0, 255, 0), 2)

        # Points + numbers
        for i, (px, py) in enumerate(pts):
            cv.circle(frame, (px, py), 4, (255, 0, 0), cv.FILLED)
            cv.putText(frame, str(i), (px + 5, py - 5),
                       cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

        # All 21 point coordinates: left hand on the left, right hand on the right
        draw_panel(frame, label, pts, w)
        print(f"{label} hand | all points: {pts}")

    cv.imshow("Hand Tracking", frame)
    if cv.waitKey(1) & 0xFF == ord("d"):
        break

capture.release()
detector.close()
cv.destroyAllWindows()
