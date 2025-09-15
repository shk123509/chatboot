#!/usr/bin/env python3
"""
Complete Farmer RAG System Setup Script
Handles all steps: Dataset generation, chunking, vectorization, and system setup
"""

import os
import sys
import json
import subprocess
from datetime import datetime

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing required dependencies...")
    
    packages = [
        'sentence-transformers',
        'faiss-cpu',
        'numpy',
        'torch'  # For sentence-transformers
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    print("✅ All dependencies installed successfully!")
    return True

def create_directory_structure():
    """Create necessary directories"""
    print("📁 Creating directory structure...")
    
    directories = [
        'data',
        'data/rag_system',
        'models'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")
    
    print("✅ Directory structure created!")

def run_step(step_name, function, *args, **kwargs):
    """Run a setup step with error handling"""
    print(f"\n{'='*60}")
    print(f"🔄 Step: {step_name}")
    print(f"{'='*60}")
    
    try:
        result = function(*args, **kwargs)
        print(f"✅ {step_name} completed successfully!")
        return result
    except Exception as e:
        print(f"❌ {step_name} failed: {e}")
        return None

def main():
    """Main setup function"""
    print("🌾 Farmer RAG System - Complete Setup")
    print("🚀 This will setup a complete RAG system for farmer problem-solving")
    print("📋 Steps: Generate Dataset → Chunking → Vectorization → RAG Setup")
    print("="*80)
    
    # Step 1: Install dependencies
    print("\n🔧 Step 1: Installing Dependencies")
    print("-"*50)
    if not install_dependencies():
        print("❌ Dependency installation failed. Please install manually:")
        print("pip install sentence-transformers faiss-cpu numpy torch")
        return
    
    # Step 2: Create directories
    print("\n📁 Step 2: Creating Directory Structure") 
    print("-"*50)
    create_directory_structure()
    
    # Step 3: Generate dataset
    print("\n🌾 Step 3: Generating Farmer Problems Dataset")
    print("-"*50)
    from farmer_problems_generator import generate_problems_and_solutions, save_to_file
    
    problems_data = generate_problems_and_solutions()
    save_to_file(problems_data, "farmer_problems_dataset.json")
    
    print(f"✅ Generated {len(problems_data)} problems and solutions")
    
    # Step 4: Setup RAG system
    print("\n🔧 Step 4: Setting Up RAG System")
    print("-"*50)
    from farmer_rag_system import FarmerRAGSystem
    
    # Initialize RAG system
    rag_system = FarmerRAGSystem()
    
    # Load data
    rag_system.load_problems_data("farmer_problems_dataset.json")
    
    # Process and chunk data
    chunks = rag_system.process_and_chunk_data()
    print(f"✅ Created {len(chunks)} text chunks")
    
    # Create embeddings
    embeddings = rag_system.create_embeddings()
    if embeddings is not None:
        print(f"✅ Generated embeddings with shape: {embeddings.shape}")
        
        # Build vector index
        rag_system.build_vector_index(embeddings)
        print("✅ Built vector search index")
        
        # Save system
        rag_system.save_system("rag_system")
        print("✅ RAG system saved to disk")
        
        # Test system
        print("\n🧪 Step 5: Testing RAG System")
        print("-"*50)
        
        test_queries = [
            "My rice is not growing properly",
            "How to control pests in tomato?",
            "Soil is too dry",
            "Yellowing leaves problem"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\nTest {i}: {query}")
            result = rag_system.generate_response(query, top_k=2)
            print(f"Confidence: {result['confidence']:.3f}")
            print(f"Response: {result['response'][:200]}...")
        
        print("\n🎉 RAG System Setup Completed Successfully!")
        print("="*80)
        
        # Generate summary report
        summary = {
            "setup_date": datetime.now().isoformat(),
            "total_problems": len(problems_data),
            "total_chunks": len(chunks),
            "embedding_dimension": embeddings.shape[1] if embeddings is not None else 0,
            "model_name": rag_system.model_name,
            "status": "completed",
            "files_created": [
                "farmer_problems_dataset.json",
                "rag_system/chunks_data.json",
                "rag_system/vector_index.faiss",
                "rag_system/metadata.json"
            ]
        }
        
        with open("setup_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        print("\n📊 Setup Summary:")
        print(f"📈 Total Problems: {summary['total_problems']}")
        print(f"🔧 Total Chunks: {summary['total_chunks']}")
        print(f"🤖 Model: {summary['model_name']}")
        print(f"📁 Files Created: {len(summary['files_created'])}")
        print(f"💾 Summary saved to: setup_summary.json")
        
        print("\n🚀 Next Steps:")
        print("1. Start your Express server: cd Backend && npm start")
        print("2. Test RAG API endpoints:")
        print("   - GET  /api/rag/status")
        print("   - POST /api/rag/query")
        print("   - GET  /api/rag/categories")
        print("3. Integrate with your frontend application")
        
    else:
        print("❌ Failed to create embeddings. Check dependencies.")

if __name__ == "__main__":
    main()