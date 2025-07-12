from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F
import torch

class ToxicityDetector:
    def __init__(self):
        model_name = "unitary/toxic-bert"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.labels = ["toxicity", "severe_toxicity", "obscene", "identity_attack", "insult", "threat", "sexual_explicit"]

    def analyze(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
            scores = F.sigmoid(outputs.logits)[0].tolist()
        return dict(zip(self.labels, scores))
