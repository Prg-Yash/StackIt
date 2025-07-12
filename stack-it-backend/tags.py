from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json

load_dotenv()

class TagResponse(BaseModel):
    tags: List[str]

    def non_empty_and_clean(cls, v):
        if not v.strip():
            raise ValueError("Empty tag found")
        return v.strip().lower()

llm = HuggingFaceEndpoint(
    repo_id="meta-llama/Llama-3.1-8B-Instruct",
    task="text-generation"
)

model = ChatHuggingFace(llm=llm)

prompt = PromptTemplate.from_template(
    "You are an assistant who extracts relevant tags from user questions."
    "Return tags as a JSON list of strings only.\n\nUser: {question}\n\nAnswer:"
)

parser = StrOutputParser()
chain = prompt | model | parser

def get_tags(question: str) -> List[str]:
    """
    Runs the chain, forces valid JSON, and returns a list of tags.
    Raises ValueError if the LLM output is malformed.
    """
    raw = chain.invoke({"question": question})

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Model output is not valid JSON: {raw}")

    validated = TagResponse(tags=data)  # will raise if invalid
    return validated.tags