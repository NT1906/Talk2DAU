# Main chatbot-model Python Script
import os
import time
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# Load environment variables
load_dotenv()

# Set LangSmith environment variables
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_ENDPOINT"] = "https://api.smith.langchain.com"

# Handle LANGSMITH_API_KEY gracefully
langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
if langsmith_api_key:
    os.environ["LANGSMITH_API_KEY"] = langsmith_api_key

# Handle GROQ_API_KEY gracefully
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY environment variable is not set. Please set it in your .env file or environment.")

# Initialize FastAPI app
app = FastAPI(title="Talk2DAU Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://talk2dau-production.up.railway.app", "http://localhost:3000", "https://talk2-dau.vercel.app"],  # Allow both production and local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize LLM
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama3-70b-8192"
)

# Prompt template
prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the provided context.
<context>
{context}
</context>

Question: {input}
""")

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    processing_time: float

def process_documents():
    try:
        print("Processing documents...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        loader = PyPDFDirectoryLoader("files")
        docs = loader.load()
        
        if not docs:
            print("No documents found in the files directory")
            return None
            
        print(f"📁 Loaded {len(docs)} PDF files")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        final_documents = text_splitter.split_documents(docs)
        
        print(f"🔢 Total document chunks created: {len(final_documents)}")
        
        vectors = FAISS.from_documents(final_documents, embeddings)
        print("✅ Bot successfully started!")
        return vectors
    except Exception as e:
        print(f"❌ An error occurred during document processing: {e}")
        return None

# Global variable to store vectors
vectors = None

@app.on_event("startup")
async def startup_event():
    global vectors
    vectors = process_documents()
    if not vectors:
        raise RuntimeError("Failed to initialize document processing")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not vectors:
            raise HTTPException(status_code=500, detail="Document processing not initialized")
        
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = vectors.as_retriever(search_kwargs={"k": 10})
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        start = time.process_time()
        response = retrieval_chain.invoke({'input': request.message})
        end = time.process_time()
        
        if not response or 'answer' not in response:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        return ChatResponse(
            response=response['answer'],
            processing_time=end - start
        )
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reprocess", response_model=dict)
async def reprocess_documents():
    global vectors
    try:
        print("Starting document reprocessing...")
        vectors = process_documents()
        if not vectors:
            print("Failed to process documents - vectors is None")
            raise HTTPException(status_code=500, detail="Failed to process documents - no vectors generated")
        print("Documents processed successfully!")
        return {
            "status": "success", 
            "message": "Documents reprocessed successfully",
            "details": "The chatbot is now ready to answer questions"
        }
    except Exception as e:
        print(f"Error during reprocessing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process documents: {str(e)}")

def main():
    print("Welcome to Talk2DAU Chatbot!")
    print("Initializing...")
    
    vectors = process_documents()
    if not vectors:
        return
    
    while True:
        question = input("\nEnter your question (or 'quit' to exit): ")
        if question.lower() == 'quit':
            break
            
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = vectors.as_retriever(search_kwargs={"k": 10})
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        start = time.process_time()
        response = retrieval_chain.invoke({'input': question})
        end = time.process_time()
        
        print("\nAnswer:")
        print(response['answer'])
        print(f"\n⏱Response time: {end - start:.2f} seconds")
        
        print("\nNote: This Bot is not affiliated with Dhirubhai Ambani University.")
        print("For more information visit: https://www.daiict.ac.in")
        print("Misinformation can be generated!")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)