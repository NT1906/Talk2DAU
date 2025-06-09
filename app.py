
import os
import time
from dotenv import load_dotenv

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
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_PROJECT"] = "DAIICT Chatbot"

# Retrieve Groq API key
groq_api_key = os.getenv("GROQ_API_KEY")


#Set Logo, Streamlit app title
col1, col2, col3 = st.columns([1, 2, 1])  # Middle column is wider to hold image
with col2:
    st.image("image.png", width=400)  # You can adjust width for size
st.title("Talk2DAU")

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

# Function to handle embedding and vector storage
def vector_embedding():
    try:
        with st.spinner("Processing documents..."):
            if "vectors" not in st.session_state:
                st.session_state.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                st.session_state.loader = PyPDFDirectoryLoader("files")
                st.session_state.docs = st.session_state.loader.load()

                st.write(f"📁 Loaded {len(st.session_state.docs)} PDF files")

                st.session_state.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                st.session_state.final_documents = st.session_state.text_splitter.split_documents(
                    st.session_state.docs
                )

                st.write(f"🔢 Total document chunks created: {len(st.session_state.final_documents)}")

                st.session_state.vectors = FAISS.from_documents(
                    st.session_state.final_documents,
                    st.session_state.embeddings
                )
                st.success("Bot successfully started!")
    except Exception as e:
        st.error(f"❌ An error occurred: {e}")

# Button to trigger embedding
if st.button("Start Bot"):
    vector_embedding()

# Question input
prompt1 = st.text_input("Please write your questions here in the text box.")

# Perform retrieval-based QA
if prompt1:
    if "vectors" not in st.session_state:
        st.warning("⚠️ Please click 'Start Button' first.")
    else:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever(search_kwargs={"k": 10})  # More chunks
        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        start = time.process_time()
        response = retrieval_chain.invoke({'input': prompt1})
        end = time.process_time()

        # Display answer
        st.subheader("Answer:")
        st.write(response['answer'])

        st.write(f"⏱Response time: {end - start:.2f} seconds")

        # Show source documents
        with st.expander("📚 Document Chunks Used"):
            relevant_docs = retriever.get_relevant_documents(prompt1)
            for i, doc in enumerate(relevant_docs):
                st.markdown(f"**Chunk {i+1} from {doc.metadata.get('source', 'unknown')}**")
                st.write(doc.page_content)
                st.markdown("---")

st.write()

st.write("Note: ")
st.write(" This Bot is not affiliated with Dhirubhai Ambani University.")
url = "https://www.daiict.ac.in"
text = "Website"

st.markdown(f"Misinformation can be generated! For more information visit -[{text}]({url})")