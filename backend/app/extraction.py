import pdfplumber
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF's raw bytes using pdfplumber.
    Works reasonably well on multi-column academic papers, which is
    the main format this tool needs to handle.
    """
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def extract_text(filename: str, file_bytes: bytes) -> str:
    """Dispatch based on file extension. Plain .txt is passed through directly."""
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower_name.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {filename}. Only .pdf and .txt are supported.")
