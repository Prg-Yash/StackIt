from flask import Flask, request, jsonify
from bot import ask_bot
from tags import get_tags
from toxicity_detector import ToxicityDetector
from bart_summarizer import BartSummarizer
from similarity import SentenceSimilarity

# initialize the toxicity detector
toxicity_detector = ToxicityDetector()
# initialize the summarizer
summarizer = BartSummarizer()
# initialize the sentence similarity model
similarity_model = SentenceSimilarity()

# Flask App
app = Flask(__name__)

# route for asking bot for quick answers
@app.route("/ask-bot", methods=["POST"])
def ask():
    data = request.get_json(force=True, silent=True) or {}
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' in request"}), 400

    try:
        answer = ask_bot(question)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# route for generating tags from a question
@app.route("/generate-tags", methods=["POST"])
def generate_tags():
    data = request.get_json(force=True, silent=True) or {}
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' in request"}), 400

    try:
        tags = get_tags(question)
        return jsonify({"tags": tags})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# route for analyzing text for toxicity
@app.route("/toxic-analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True, silent=True)
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    scores = toxicity_detector.analyze(data["text"])

    flagged = (
        scores["toxicity"] > 0.70 
        or scores["insult"]  > 0.60
    )
    return jsonify({"scores": scores, "flagged": flagged})

# Route for text summarization
@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    summary = summarizer.summarize(data["text"])
    return jsonify({"summary": summary})

# Route for sentence similarity comparison  
@app.route("/similarity", methods=["POST"])
def similarity():
    data = request.get_json()
    if not data or "reference" not in data or "candidates" not in data:
        return jsonify({"error": "Missing 'reference' or 'candidates' in request."}), 400

    reference = data["reference"]
    candidates = data["candidates"]
    threshold = data.get("threshold", 0.80)

    matches = similarity_model.find_similar_sentences(reference, candidates, threshold)
    return jsonify({
        "reference": reference,
        "threshold": threshold,
        "matches": matches
    })
    
# Run app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)