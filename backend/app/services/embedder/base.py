from abc import ABC, abstractmethod

class BaseEmbedder(ABC):
    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        pass
    
    @abstractmethod
    def dimension(self) -> int:
        pass
    
    @abstractmethod
    def name(self)->str:
        pass