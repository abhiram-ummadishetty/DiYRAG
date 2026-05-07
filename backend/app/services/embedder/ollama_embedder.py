import requests

from app.services.embedder.base import BaseEmbedder


class OllamaEmbedder(BaseEmbedder):

    def __init__(
        self,
        model_name: str = "nomic-embed-text",
        base_url: str = "http://localhost:11434"
    ):
        self.model_name = model_name
        self.base_url = base_url

    def embed(self, texts: list[str]) -> list[list[float]]:

        embeddings = []

        for text in texts:

            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": self.model_name,
                    "prompt": text
                },
                timeout=60
            )

            response.raise_for_status()

            data = response.json()

            embeddings.append(data["embedding"])

        return embeddings

    def dimension(self) -> int:
        """
        nomic-embed-text produces 768-dimensional embeddings.
        """

        return 768

    def name(self) -> str:
        return self.model_name