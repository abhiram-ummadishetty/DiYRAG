import fitz

class PDFLoader:
    def load(self, file_path: str) -> str:
        doc = fitz.open(file_path)
        texts = []

        for page in doc:
            page_text = page.get_text()

            # basic cleaning
            page_text = page_text.replace("\n", " ")
            page_text = " ".join(page_text.split())

            texts.append(page_text)

        return "\n".join(texts)