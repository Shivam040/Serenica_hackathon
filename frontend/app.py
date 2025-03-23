import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import pytesseract
import fitz  # PyMuPDF for PDF text extraction
from PIL import Image
import os
from werkzeug.utils import secure_filename
from googletrans import Translator
import time
import easyocr

# Load environment variables (for API key)
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Set up Gemini AI
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Gemini API key is missing. Set GEMINI_API_KEY in the environment.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Set up Tesseract OCR (Update this path if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Translator for Hindi conversion
translator = Translator()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF using PyMuPDF."""
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()




reader = easyocr.Reader(["en"])  # Initialize OCR for English

def extract_text_from_image(image_path):
    """Extracts text from image using EasyOCR"""
    text = reader.readtext(image_path, detail=0)  # Extract text
    return "\n".join(text) if text else "No readable text found in image."



def analyze_medical_report(content):
    """Sends extracted text to Gemini AI for analysis."""
    prompt = (
        "Analyze this medical report concisely. Provide key findings, diagnoses, and recommendations with simple words in the place of medical terms so that a normal human being can understand it in the following format:\n\n"
        "# Key Findings:\n"
        "- (List important test results)\n\n"
        "# Diagnosis:\n"
        "(Clearly state any medical condition or absence of issues)\n\n"
        "# Recommendations:\n"
        "(Provide professional recommendations based on the findings)"
    )

    for attempt in range(MAX_RETRIES):
        try:
            response = model.generate_content(f"{prompt}\n\n{content}")
            return response.text if response.text else "No meaningful response received."
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                return f"Error: {str(e)}"


@app.route("/analyze", methods=["POST"])
def analyze_report():
    """Handles file uploads and analysis requests."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    # Ensure file is saved before proceeding
    if not os.path.exists(file_path):
        return jsonify({"error": "File was not saved correctly."}), 500

    try:
        if file.filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_path)
        else:
            extracted_text = extract_text_from_image(file_path)

        if not extracted_text.strip():
            return jsonify({"error": "No readable text found in file."}), 400

        # Analyze the extracted text using Gemini AI
        analysis_en = analyze_medical_report(extracted_text)

        # Translate the analysis into Hindi
        # analysis_hi = translator.translate(analysis_en, src="en", dest="hi").text

        async def translate_text(text, src_lang="en", dest_lang="hi"):
            return await translator.translate(text, src=src_lang, dest=dest_lang)
        
        analysis_hi = asyncio.run(translate_text(analysis_en))
        analysis_hi = analysis_hi.text



        print("Flask API Response:", {"analysis_en": analysis_en, "analysis_hi": analysis_hi})

        return jsonify({"analysis_en": analysis_en, "analysis_hi": analysis_hi})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Ensure file exists before trying to delete it
        if os.path.exists(file_path):
            os.remove(file_path)


if __name__ == "__main__":
    app.run(debug=True)
