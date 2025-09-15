#!/usr/bin/env python3
"""
Farmer RAG (Retrieval-Augmented Generation) System
Complete RAG implementation with text processing, chunking, vectorization, and retrieval
"""

import json
import numpy as np
import re
import os
from typing import List, Dict, Tuple, Any
from datetime import datetime
import pickle
import warnings
warnings.filterwarnings('ignore')

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("⚠️ sentence-transformers and faiss not available. Installing...")
    import subprocess
    import sys
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "sentence-transformers", "faiss-cpu"])
        from sentence_transformers import SentenceTransformer
        import faiss
        SENTENCE_TRANSFORMERS_AVAILABLE = True
        print("✅ Successfully installed sentence-transformers and faiss")
    except Exception as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("Please install manually: pip install sentence-transformers faiss-cpu")
        SENTENCE_TRANSFORMERS_AVAILABLE = False

class FarmerRAGSystem:
    """
    Complete RAG system for farmer problem-solving
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize the RAG system"""
        self.model_name = model_name
        self.embedding_model = None
        self.vector_index = None
        self.chunks_data = []
        self.problems_data = []
        self.chunk_size = 200
        self.overlap_size = 50
        
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            print(f"🤖 Loading embedding model: {model_name}")
            self.embedding_model = SentenceTransformer(model_name)
            print("✅ Embedding model loaded successfully")
        else:
            print("❌ Cannot initialize embedding model - dependencies not available")
    
    def load_problems_data(self, json_file: str) -> None:
        """Load problems dataset from JSON file"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                self.problems_data = json.load(f)
            print(f"✅ Loaded {len(self.problems_data)} problems from {json_file}")
        except FileNotFoundError:
            print(f"❌ File not found: {json_file}")
            print("Please run farmer_problems_generator.py first to create the dataset")
        except Exception as e:
            print(f"❌ Error loading data: {e}")
    
    def chunk_text(self, text: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
        """
        Break text into overlapping chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                for i in range(end - 20, min(end + 20, len(text))):
                    if text[i] in '.!?':
                        end = i + 1
                        break
                
                # If no sentence boundary found, break at word boundary
                if end >= len(text) or (end < len(text) and not text[end].isspace()):
                    while end > start and not text[end].isspace():
                        end -= 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = max(start + 1, end - overlap)
            
            if start >= len(text):
                break
        
        return chunks
    
    def process_and_chunk_data(self) -> List[Dict]:
        """
        Process problems data and create chunks with metadata
        """
        print("🔄 Processing and chunking data...")
        chunks = []
        chunk_id = 0
        
        for problem_data in self.problems_data:
            # Combine problem and solution for comprehensive context
            full_text = f"{problem_data['problem']} {problem_data['solution']}"
            
            # Create chunks
            text_chunks = self.chunk_text(full_text, self.chunk_size, self.overlap_size)
            
            for chunk_text in text_chunks:
                chunk = {
                    'chunk_id': chunk_id,
                    'original_id': problem_data['id'],
                    'text': chunk_text,
                    'category': problem_data['category'],
                    'crop': problem_data['crop'],
                    'severity': problem_data.get('severity', 'medium'),
                    'season': problem_data.get('season', 'all'),
                    'region': problem_data.get('region', 'all'),
                    'problem': problem_data['problem'],
                    'solution': problem_data['solution'],
                    'chunk_type': 'problem_solution'
                }
                chunks.append(chunk)
                chunk_id += 1
        
        self.chunks_data = chunks
        print(f"✅ Created {len(chunks)} chunks from {len(self.problems_data)} problems")
        return chunks
    
    def create_embeddings(self) -> np.ndarray:
        """
        Create vector embeddings for all chunks
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            print("❌ Cannot create embeddings - sentence-transformers not available")
            return None
        
        if not self.chunks_data:
            print("❌ No chunks available. Run process_and_chunk_data() first")
            return None
        
        print("🔄 Creating embeddings for chunks...")
        
        # Extract text from chunks
        texts = [chunk['text'] for chunk in self.chunks_data]
        
        # Create embeddings
        embeddings = self.embedding_model.encode(
            texts, 
            batch_size=32, 
            show_progress_bar=True,
            convert_to_numpy=True
        )
        
        print(f"✅ Created embeddings with shape: {embeddings.shape}")
        return embeddings
    
    def build_vector_index(self, embeddings: np.ndarray) -> None:
        """
        Build FAISS vector index for similarity search
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            print("❌ Cannot build vector index - faiss not available")
            return
        
        if embeddings is None:
            print("❌ No embeddings provided")
            return
        
        print("🔄 Building vector index...")
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.vector_index = faiss.IndexFlatIP(dimension)  # Inner product similarity
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Add embeddings to index
        self.vector_index.add(embeddings)
        
        print(f"✅ Built vector index with {self.vector_index.ntotal} vectors")
    
    def query_to_vector(self, query: str) -> np.ndarray:
        """
        Convert query text to vector embedding
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            print("❌ Cannot convert query to vector - sentence-transformers not available")
            return None
        
        # Create embedding for query
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)
        
        # Normalize for cosine similarity
        faiss.normalize_L2(query_embedding)
        
        return query_embedding
    
    def search_similar_chunks(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search for similar chunks using vector similarity
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE or self.vector_index is None:
            print("❌ Vector search not available")
            return []
        
        # Convert query to vector
        query_vector = self.query_to_vector(query)
        if query_vector is None:
            return []
        
        # Search for similar vectors
        similarities, indices = self.vector_index.search(query_vector, top_k)
        
        # Get corresponding chunks
        results = []
        for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
            if idx < len(self.chunks_data):  # Valid index
                chunk = self.chunks_data[idx].copy()
                chunk['similarity_score'] = float(similarity)
                chunk['rank'] = i + 1
                results.append(chunk)
        
        return results
    
    def enhance_query(self, query: str) -> str:
        """
        Enhance user query with farming context
        """
        # Add farming context keywords
        farming_keywords = [
            "crop", "farming", "agriculture", "cultivation", "harvest",
            "soil", "irrigation", "fertilizer", "pest", "disease",
            "yield", "plant", "seed", "growth", "farmer"
        ]
        
        enhanced_query = query.lower()
        
        # Check if query contains farming terms
        has_farming_context = any(keyword in enhanced_query for keyword in farming_keywords)
        
        if not has_farming_context:
            enhanced_query = f"farming agriculture {query}"
        
        return enhanced_query
    
    def generate_response(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Generate response using RAG approach
        """
        # Enhance query
        enhanced_query = self.enhance_query(query)
        
        # Search for relevant chunks
        relevant_chunks = self.search_similar_chunks(enhanced_query, top_k)
        
        if not relevant_chunks:
            return {
                "query": query,
                "response": "I couldn't find specific information about your farming question. Please try rephrasing or provide more details.",
                "sources": [],
                "confidence": 0.0
            }
        
        # Extract unique solutions and problems
        solutions = []
        problems = []
        sources = []
        
        seen_solutions = set()
        for chunk in relevant_chunks:
            if chunk['solution'] not in seen_solutions:
                solutions.append(chunk['solution'])
                problems.append(chunk['problem'])
                sources.append({
                    'problem_id': chunk['original_id'],
                    'category': chunk['category'],
                    'crop': chunk['crop'],
                    'similarity': chunk['similarity_score'],
                    'problem': chunk['problem'],
                    'solution': chunk['solution']
                })
                seen_solutions.add(chunk['solution'])
        
        # Generate comprehensive response
        if len(solutions) == 1:
            response = f"Based on your query about '{query}', here's what I found:\n\n"
            response += f"**Problem:** {problems[0]}\n\n"
            response += f"**Solution:** {solutions[0]}\n\n"
            response += f"**Category:** {sources[0]['category'].replace('_', ' ').title()}\n"
            response += f"**Crop:** {sources[0]['crop'].title()}"
        else:
            response = f"Based on your query about '{query}', I found several relevant solutions:\n\n"
            for i, (problem, solution, source) in enumerate(zip(problems, solutions, sources), 1):
                response += f"**Solution {i}:**\n"
                response += f"Problem: {problem}\n"
                response += f"Solution: {solution}\n"
                response += f"Category: {source['category'].replace('_', ' ').title()}\n"
                if i < len(solutions):
                    response += "\n---\n\n"
        
        # Calculate confidence based on similarity scores
        avg_confidence = sum(chunk['similarity_score'] for chunk in relevant_chunks) / len(relevant_chunks)
        
        return {
            "query": query,
            "enhanced_query": enhanced_query,
            "response": response,
            "sources": sources,
            "confidence": float(avg_confidence),
            "num_sources": len(sources)
        }
    
    def save_system(self, save_dir: str = "rag_system") -> None:
        """
        Save the complete RAG system to disk
        """
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        
        print(f"💾 Saving RAG system to {save_dir}/...")
        
        # Save chunks data
        with open(f"{save_dir}/chunks_data.json", 'w', encoding='utf-8') as f:
            json.dump(self.chunks_data, f, indent=2, ensure_ascii=False)
        
        # Save vector index
        if self.vector_index is not None:
            faiss.write_index(self.vector_index, f"{save_dir}/vector_index.faiss")
        
        # Save system metadata
        metadata = {
            "model_name": self.model_name,
            "chunk_size": self.chunk_size,
            "overlap_size": self.overlap_size,
            "num_chunks": len(self.chunks_data),
            "num_problems": len(self.problems_data),
            "created_date": datetime.now().isoformat()
        }
        
        with open(f"{save_dir}/metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("✅ RAG system saved successfully")
    
    def load_system(self, save_dir: str = "rag_system") -> None:
        """
        Load a previously saved RAG system
        """
        print(f"📂 Loading RAG system from {save_dir}/...")
        
        try:
            # Load chunks data
            with open(f"{save_dir}/chunks_data.json", 'r', encoding='utf-8') as f:
                self.chunks_data = json.load(f)
            
            # Load vector index
            if SENTENCE_TRANSFORMERS_AVAILABLE and os.path.exists(f"{save_dir}/vector_index.faiss"):
                self.vector_index = faiss.read_index(f"{save_dir}/vector_index.faiss")
            
            # Load metadata
            with open(f"{save_dir}/metadata.json", 'r') as f:
                metadata = json.load(f)
                self.model_name = metadata.get("model_name", self.model_name)
                self.chunk_size = metadata.get("chunk_size", self.chunk_size)
                self.overlap_size = metadata.get("overlap_size", self.overlap_size)
            
            print("✅ RAG system loaded successfully")
            print(f"📊 Loaded {len(self.chunks_data)} chunks, Vector index: {self.vector_index is not None}")
            
        except Exception as e:
            print(f"❌ Error loading RAG system: {e}")

def main():
    """
    Main function to demonstrate the RAG system
    """
    print("🌾 Farmer RAG System - Complete Implementation")
    print("=" * 60)
    
    # Initialize RAG system
    rag_system = FarmerRAGSystem()
    
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        print("❌ Required dependencies not available. Please install:")
        print("pip install sentence-transformers faiss-cpu")
        return
    
    # Load problems data
    data_file = "farmer_problems_dataset.json"
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        print("Please run farmer_problems_generator.py first to create the dataset")
        return
    
    rag_system.load_problems_data(data_file)
    
    # Process and chunk data
    chunks = rag_system.process_and_chunk_data()
    
    # Create embeddings
    embeddings = rag_system.create_embeddings()
    
    if embeddings is not None:
        # Build vector index
        rag_system.build_vector_index(embeddings)
        
        # Save the system
        rag_system.save_system()
        
        print("\n" + "=" * 60)
        print("🎯 Testing RAG System with Sample Queries")
        print("=" * 60)
        
        # Test queries
        test_queries = [
            "My rice crop is not growing well",
            "How to deal with pest attacks on tomatoes",
            "Soil is too dry for wheat cultivation",
            "Yellowing leaves in my corn field",
            "Best irrigation method for vegetables",
            "Market prices are low for my crops"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🔍 Query {i}: {query}")
            print("-" * 50)
            
            result = rag_system.generate_response(query, top_k=2)
            
            print(f"Confidence: {result['confidence']:.3f}")
            print(f"Sources: {result['num_sources']}")
            print("\nResponse:")
            print(result['response'])
            
            if i < len(test_queries):
                print("\n" + "=" * 40)
        
        print(f"\n✅ RAG System setup completed successfully!")
        print(f"📁 System saved to: rag_system/")
        print(f"🔧 You can now use this system to answer farmer queries!")

if __name__ == "__main__":
    main()