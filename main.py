import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY environment variable is not set. Please set it in your .env file or environment.")

llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama3-70b-8192"
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory message store
messages = []

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(chat_req: ChatRequest):
    user_message = chat_req.message
    ai_response = llm.invoke(user_message)
    messages.append({
        'id': len(messages) + 1,
        'text': user_message,
        'sender': 'user'
    })
    messages.append({
        'id': len(messages) + 1,
        'text': ai_response,
        'sender': 'ai'
    })
    return { 'response': ai_response, 'messages': messages }

@app.get("/api/messages")
async def get_messages():
    return messages 