# DIYRAG

A local, visual, fully modular **Retrieval-Augmented Generation** playground. Upload PDFs, pick your chunker, embedder, retriever, and LLM — then watch the pipeline run step by step in your browser.

![Pipeline Visualizer](https://placehold.co/900x420/1e1e1c/85b7eb?text=RAG+Pipeline+Visualizer)

---

## Features

- **Animated pipeline visualizer** — see chunks, embeddings, vector store, retrieval, and LLM generation in real time
- **Fully swappable components** — change chunker, embedder, retriever, and LLM from the UI without touching code
- **LiteLLM powered** — use any LLM (OpenAI, Anthropic, Gemini, Ollama, and more) through a single interface
- **Local-first** — runs entirely on your machine, no cloud required
- **Modular backend** — adapter pattern makes adding new strategies a single file

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + Python 3.12 |
| Embeddings | sentence-transformers / Ollama |
| Vector store | FAISS |
| LLM routing | LiteLLM |
| Frontend | Vanilla HTML/CSS/JS (ES modules) |
| Package manager | uv |
| Task runner | just |

---

## Project Structure

```
DIYRAG/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── core/             # Pipeline orchestration
│   │   ├── services/
│   │   │   ├── document/     # PDF loading, cleaning, chunking
│   │   │   ├── embedder/     # Embedding adapters + factory
│   │   │   ├── llm/          # LLM adapters + factory (LiteLLM)
│   │   │   ├── retriever/    # Retriever adapters + factory
│   │   │   ├── vector_store/ # Vector store adapters + factory
│   │   │   └── utils/        # Logger, config
│   │   └── models/           # Pydantic schemas
│   ├── litellm_config.yaml
│   ├── pyproject.toml
│   └── .env
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── main.js
│       ├── pipeline.js
│       ├── renderers.js
│       ├── eventHandler.js
│       ├── uploader.js
│       ├── mockPipeline.js
│       └── utils.js
├── Justfile
└── README.md
```

---

## Prerequisites

- **Python 3.12+**
- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — Python package manager
- **[just](https://github.com/casey/just#installation)** — task runner
- **VS Code** with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension

Install `uv` and `just`:

```bash
# uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# just (macOS)
brew install just

# just (Linux)
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin
```

---

## Installation

**1. Clone the repo**

```bash
git clone https://github.com/your-username/DIYRAG.git
cd DIYRAG
```

**2. Install backend dependencies**

```bash
just setup
```

**3. Set up environment variables**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

You only need keys for the models you want to use. For local models via Ollama, no key is needed.

**4. Configure LiteLLM** *(optional — only if using the LLM proxy)*

Edit `backend/litellm_config.yaml` and add the models you want:

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: ollama-llama3
    litellm_params:
      model: ollama/llama3
      api_base: http://localhost:11434
```

---

## Running

**Start the backend:**

```bash
just backend
```

**Start the frontend:**

Open `frontend/index.html` in VS Code and click **Go Live** in the bottom status bar. The app will open at `http://localhost:5500`.

**Or start everything at once:**

```bash
just dev
```

**Start the LiteLLM proxy** *(optional)*:

```bash
just proxy
```

---

## Usage

1. Open the app in your browser at `http://localhost:5500`
2. Click **Configure RAG** (top right) to pick your chunker, embedder, retriever, and LLM
3. Upload one or more PDFs
4. Type a question and click **Run RAG**
5. Watch the pipeline animate step by step

---

## Available Options

### Chunker
| Value | Description |
|---|---|
| `fixed` | Splits text into fixed-size character chunks (default: 200) |
| `sentence` | Splits on sentence boundaries |

### Embedder
| Value | Description |
|---|---|
| `minilm` | `all-MiniLM-L6-v2` via sentence-transformers (local, no key needed) |
| `ollama` | `nomic-embed-text` via Ollama (requires Ollama running locally) |

### Retriever
| Value | Description |
|---|---|
| `faiss` | FAISS flat L2 vector search |

### LLM
| Value | Description |
|---|---|
| `gpt-4o-mini` | OpenAI GPT-4o mini |
| `gpt-4o` | OpenAI GPT-4o |
| `claude-sonnet` | Anthropic Claude Sonnet |
| `gemini-flash` | Google Gemini 1.5 Flash |
| `ollama-llama3` | Llama 3 via Ollama (local, no key needed) |

---

## Adding a New Component

The adapter pattern means adding a new chunker, embedder, retriever, or LLM is always the same three steps:

**Example — adding a new chunker:**

1. Create `backend/app/services/document/chunkers/paragraph.py`:

```python
from .base import BaseChunker

class ParagraphChunker(BaseChunker):
    def chunk(self, documents: list[str]) -> list[str]:
        chunks = []
        for doc in documents:
            chunks.extend([p.strip() for p in doc.split("\n\n") if p.strip()])
        return chunks
```

2. Register it in `chunker.py`:

```python
from .paragraph import ParagraphChunker

CHUNKERS = {
    "fixed":     FixedChunker,
    "sentence":  SentenceChunker,
    "paragraph": ParagraphChunker,   # ← add this
}
```

3. Add it to the dropdown in `frontend/index.html`:

```html
<option value="paragraph">Paragraph-aware</option>
```

No other files need to change.

---

## All Just Commands

```
just setup     # Install dependencies
just backend   # Start FastAPI on :8000
just frontend  # Open frontend in VS Code
just dev       # Start backend + remind to Go Live
just proxy     # Start LiteLLM proxy on :4000
just kill      # Kill port 8000
```

---

## License

Apache 2.0
