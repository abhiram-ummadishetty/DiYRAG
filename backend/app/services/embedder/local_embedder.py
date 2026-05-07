from sentence_transformers import SentenceTransformer

from app.services.embedder.base import BaseEmbedder


class LocalEmbedder(BaseEmbedder):

    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"
        self.model = SentenceTransformer(self.model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        return self.model.encode(texts).tolist()

    def dimension(self) -> int:
        return self.model.get_embedding_dimension() 

    def name(self) -> str:
        return self.model_name