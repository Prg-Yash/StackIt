# StackIt AI Backend

A basic Flask backend service to support StackIt features like bot Q\&A, tag generation, toxicity detection, and summarization.

## Getting Started

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python server.py
```

The server will start on `http://0.0.0.0:5000/` by default.

---

Ensure that `bot.py`, `tags.py`, `toxicity_detector.py`, and `bart_summarizer.py` are present in the same directory.
