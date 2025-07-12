from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
load_dotenv()

llm = HuggingFaceEndpoint(
    repo_id="meta-llama/Llama-3.1-8B-Instruct",
    task="text-generation"
)

model = ChatHuggingFace(
    llm=llm
)

prompt = PromptTemplate.from_template(
    "You are a helpful assistant and expert. You have to help the user to solve their queries. "
    "If you don't know the answer simply say \"I don't know\". "
    "Finally try to keep the answer crispy and to the point.\n\nUser: {question}\n\nAnswer:"
)

parser = StrOutputParser()

chain = prompt | model | parser

def ask_bot(question: str) -> str:
    """
    Calls the assistant chain with a user question and returns a clean answer.
    """
    if not question.strip():
        raise ValueError("Empty question")

    result = chain.invoke({"question": question})
    return result.strip()


