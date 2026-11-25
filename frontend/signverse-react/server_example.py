"""
SignVerse – example Python server for connecting your OpenCV sign detection.

    pip install flask opencv-python numpy

DEVELOPING (two terminals):
    terminal 1:  python server_example.py          # your detector, on :5000
    terminal 2:  npm run dev                       # the website, on :5173  (forwards /api to :5000)
    open http://localhost:5173
,
PRODUCTION (one server):
    npm run build                                   # creates the dist/ folder
    python server_example.py
    open http://localhost:5000

Then in src/lib/signverse.js set   mode: 'http'   (or open the site with ?demo to preview captions).

The browser sends ~8 JPEG frames per second to POST /api/predict.
Put your existing OpenCV / model code inside detect_sign() below – that's the only thing to edit.
"""
import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_from_directory

DIST = os.path.join(os.path.dirname(__file__), "dist")
app = Flask(__name__, static_folder=DIST, static_url_path="")


def detect_sign(frame_bgr):
    """
    frame_bgr: numpy array (H, W, 3), a normal un-mirrored OpenCV BGR image
               (the same thing cap.read() gives you).
    Return a dict:
        caption     str    text for the detected sign, "" when nothing is detected
        confidence  float  0..1                      (optional)
        final       bool   False = partial result     (optional, default True)
        boxes       list   [{"x","y","w","h","label"}] normalised 0..1  (optional)
    """
    # ---- TODO: call your existing detection code here ----
    # e.g.  label, conf, box = my_model.predict(frame_bgr)
    #       h, w = frame_bgr.shape[:2]
    #       return {"caption": label, "confidence": conf,
    #               "boxes": [{"x": box[0]/w, "y": box[1]/h, "w": box[2]/w, "h": box[3]/h, "label": label}]}
    return {"caption": "", "confidence": 0.0, "boxes": []}


@app.post("/api/predict")
def predict():
    frame = cv2.imdecode(np.frombuffer(request.get_data(), np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"caption": ""}), 400
    return jsonify(detect_sign(frame))


@app.route("/")
def home():
    return send_from_directory(DIST, "index.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)
