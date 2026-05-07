from app.services.embedder.local_embedder import LocalEmbedder
from app.services.embedder.ollama_embedder import OllamaEmbedder


def get_embedder(name: str):

    if name == "local":
        return LocalEmbedder()

    elif name == "ollama":
        return OllamaEmbedder()

    raise ValueError(f"Unsupported embedder: {name}")