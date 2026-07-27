import os
from groq import AsyncGroq

client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

# llama-3.3-70b-versatile is a solid default: strong instruction-following
# and JSON-mode support. Swap if your team wants to try a different Groq model.
MODEL = "llama-3.3-70b-versatile"

ANALYSIS_SYSTEM_PROMPT = """You are an assistant that helps engineering students understand \
technical documents and research papers. Given the full text of a document, produce a \
structured analysis as a single JSON object with EXACTLY these keys:

- "problem": what problem/motivation the document addresses (2-3 sentences, plain English)
- "method": what approach/method was used (2-3 sentences, plain English)
- "results": what was found or achieved (2-3 sentences, plain English)
- "limitations": weaknesses or open issues (2-3 sentences, plain English)
- "prerequisites": a list of 2-5 short strings, each a concept a reader should know \
before this document, e.g. ["Self-attention", "Gradient descent"]

Rewrite jargon in plain English wherever possible. Respond with ONLY the JSON object, \
no markdown fences, no commentary before or after it.
"""

QA_SYSTEM_PROMPT = """You are answering a question about a specific document, using ONLY \
the document text provided. If the answer isn't in the document, say so clearly rather \
than guessing. Keep answers concise (3-5 sentences) and in plain English."""


async def stream_analysis(document_text: str):
    """Streams the raw text of the model's response as it's generated.
    The frontend accumulates these chunks and parses the final JSON once
    the stream closes (see the /analyze route for how completion is detected).
    """
    truncated = document_text[:60000]

    stream = await client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": f"Document text:\n\n{truncated}"},
        ],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def stream_qa(document_text: str, question: str):
    truncated = document_text[:60000]

    stream = await client.chat.completions.create(
        model=MODEL,
        max_tokens=512,
        messages=[
            {"role": "system", "content": QA_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Document text:\n\n{truncated}\n\nQuestion: {question}",
            },
        ],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
