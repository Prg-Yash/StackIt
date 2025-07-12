from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class SentenceSimilarity:
    def __init__(self):
        self.model = SentenceTransformer("sentence-transformers/average_word_embeddings_levy_dependency")

    def find_similar_sentences(self, reference, candidates, threshold=0.8):
        all_sentences = [reference] + candidates
        embeddings = self.model.encode(all_sentences)
        ref_embedding = embeddings[0].reshape(1, -1)
        candidate_embeddings = embeddings[1:]

        similarities = cosine_similarity(ref_embedding, candidate_embeddings)[0]
        return [
            {"sentence": candidates[i], "score": round(float(sim), 4)}
            for i, sim in enumerate(similarities) if sim >= threshold
        ]
