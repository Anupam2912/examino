from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import requests
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Face Recognition Attendance API Running..."

@app.route('/match-face', methods=['POST'])
def match_face():
    try:
        data = request.get_json()
        image_url = data.get("imageUrl")  # captured image
        reference_url = data.get("referenceUrl")  # reference image (from Firebase)

        # Load the images
        img1 = face_recognition.load_image_file(BytesIO(requests.get(image_url).content))
        img2 = face_recognition.load_image_file(BytesIO(requests.get(reference_url).content))

        # Encode faces
        face1 = face_recognition.face_encodings(img1)
        face2 = face_recognition.face_encodings(img2)

        if not face1 or not face2:
            return jsonify({"matched": False, "error": "No face found in one of the images"}), 400

        result = face_recognition.compare_faces([face2[0]], face1[0])[0]

        return jsonify({"matched": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
