from transformers import BartTokenizer, BartForConditionalGeneration

class BartSummarizer:
    def __init__(self):
        self.tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
        self.model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")

    def summarize(self, text):
        inputs = self.tokenizer([text], max_length=1024, return_tensors="pt", truncation=True)
        summary_ids = self.model.generate(
            inputs["input_ids"],
            max_length=200,
            min_length=30,
            num_beams=5,
            length_penalty=2.0,
            early_stopping=True
        )
        return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
