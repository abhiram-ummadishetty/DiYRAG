import faiss
import numpy as np

class VectorStore:
    def __init__(self, dim):
        self.index = faiss.IndexFlatL2(dim)
        self.texts = []

    def add(self, embeddings, texts):
        vectors = np.array(embeddings).astype("float32")
        self.index.add(vectors)
        self.texts.extend(texts)

    def search(self, query_embedding, k=3):
        q = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(q, k)

        results = []
        for i, idx in enumerate(indices[0]):
            results.append({
                "text": self.texts[idx],
                "score": float(distances[0][i])
            })
        return results