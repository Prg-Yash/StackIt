from flask import Flask, request, jsonify
from bot import ask_bot
from tags import get_tags

# Flask App
app = Flask(__name__)

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
    
@app.route("/generate-tags", methods=["POST"])
def generate_tags():
    data = request.get_json(force=True, silent=True) or {}
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' in request"}), 400

    try:
        tags = get_tags(question)
        return jsonify({"tags": tags})  # already a Python list
    except Exception as e:
        # In production you might log e instead of returning the string
        return jsonify({"error": str(e)}), 500

# Run app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)