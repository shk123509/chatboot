#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Query RAG System Integration
Connects the chatbot to the existing RAG system for intelligent responses
"""

import json
import sys
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set UTF-8 encoding for Windows console
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    sys.stdin = codecs.getreader('utf-8')(sys.stdin.detach())

# Import the existing RAG system
try:
    from farmer_rag_system import FarmerRAGSystem
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    print("⚠️ RAG system not available. Please run setup_rag_system.py first")

class ChatbotRAGInterface:
    """
    Interface between chatbot and RAG system
    """
    
    def __init__(self):
        self.rag_system = None
        self.system_ready = False
        
        if RAG_AVAILABLE:
            try:
                # Initialize RAG system
                self.rag_system = FarmerRAGSystem()
                
                # Try to load existing system
                rag_path = os.path.join(os.path.dirname(__file__), 'rag_system')
                if os.path.exists(rag_path):
                    self.rag_system.load_system(rag_path)
                    self.system_ready = True
                    print("✅ RAG system loaded successfully")
                else:
                    print("⚠️ RAG system not found. Please run setup_rag_system.py")
                    
            except Exception as e:
                print(f"❌ Failed to initialize RAG system: {e}")
                self.rag_system = None
        
    def query_rag(self, query, language='en', top_k=3):
        """
        Query the RAG system and return enhanced response
        """
        if not self.system_ready or not self.rag_system:
            return self._fallback_response(query, language)
        
        try:
            # Enhance query for better results
            enhanced_query = self._enhance_query(query, language)
            
            # Get RAG response
            response = self.rag_system.generate_response(enhanced_query, top_k=top_k)
            
            # Post-process response for chatbot
            processed_response = self._process_response(response, query, language)
            
            return processed_response
            
        except Exception as e:
            print(f"❌ RAG query failed: {e}")
            return self._fallback_response(query, language, error=str(e))
    
    def _enhance_query(self, query, language):
        """
        Enhance user query for better RAG results
        """
        # Add context based on language
        if language == 'hi':
            farming_context = "कृषि समस्या"
        elif language == 'pa':
            farming_context = "ਖੇਤੀ ਦੀ ਸਮੱਸਿਆ"
        elif language == 'ur':
            farming_context = "زراعت کا مسئلہ"
        else:
            farming_context = "farming problem"
        
        # Check if query already has farming context
        farming_keywords = [
            'crop', 'plant', 'seed', 'soil', 'irrigation', 'fertilizer',
            'pest', 'disease', 'harvest', 'farming', 'agriculture',
            'किसान', 'फसल', 'खेत', 'ਕਿਸਾਨ', 'ਫਸਲ', 'کسان', 'فصل'
        ]
        
        query_lower = query.lower()
        has_farming_context = any(keyword in query_lower for keyword in farming_keywords)
        
        if not has_farming_context:
            enhanced_query = f"{farming_context}: {query}"
        else:
            enhanced_query = query
        
        return enhanced_query
    
    def _process_response(self, rag_response, original_query, language):
        """
        Process RAG response for chatbot use
        """
        processed = {
            'query': original_query,
            'response': rag_response.get('response', 'I apologize, but I could not find relevant information.'),
            'confidence': rag_response.get('confidence', 0.0),
            'sources': rag_response.get('sources', []),
            'enhanced': False,
            'language': language,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add language-specific formatting
        if language != 'en':
            processed['response'] = self._add_language_context(processed['response'], language)
        
        # Enhance response if confidence is low
        if processed['confidence'] < 0.7:
            processed['response'] = self._enhance_low_confidence_response(
                processed['response'], 
                original_query, 
                language
            )
            processed['enhanced'] = True
        
        # Add conversational elements
        processed['response'] = self._make_conversational(processed['response'], language)
        
        return processed
    
    def _add_language_context(self, response, language):
        """
        Add language-specific context to response
        """
        if language == 'hi':
            greeting = "नमस्ते किसान भाई! "
            closing = "\n\nक्या यह जानकारी उपयोगी है? अधिक सहायता के लिए पूछें।"
        elif language == 'pa':
            greeting = "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਜੀ! "
            closing = "\n\nਕੀ ਇਹ ਜਾਣਕਾਰੀ ਲਾਭਦਾਇਕ ਹੈ? ਹੋਰ ਮਦਦ ਲਈ ਪੁੱਛੋ।"
        elif language == 'ur':
            greeting = "السلام علیکم کسان بھائی! "
            closing = "\n\nکیا یہ معلومات مفید ہیں؟ مزید مدد کے لیے پوچھیں۔"
        else:
            return response
        
        return greeting + response + closing
    
    def _enhance_low_confidence_response(self, response, query, language):
        """
        Enhance response when confidence is low
        """
        if language == 'hi':
            enhancement = f"\n\nमुझे आपके सवाल '{query}' के लिए सटीक जानकारी नहीं मिली। कृपया अधिक विस्तार से बताएं या दूसरे तरीके से पूछें।"
        elif language == 'pa':
            enhancement = f"\n\nਮੈਨੂੰ ਤੁਹਾਡੇ ਸਵਾਲ '{query}' ਲਈ ਸਹੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਹੋਰ ਵੇਰਵਾ ਦਿਓ।"
        elif language == 'ur':
            enhancement = f"\n\nمجھے آپ کے سوال '{query}' کے لیے درست معلومات نہیں ملیں۔ براہ کرم تفصیل سے بتائیں۔"
        else:
            enhancement = f"\n\nI couldn't find specific information for your question '{query}'. Please provide more details or try rephrasing your question."
        
        return response + enhancement
    
    def _make_conversational(self, response, language):
        """
        Make response more conversational
        """
        if language == 'hi':
            if not response.startswith(('नमस्ते', 'आपका', 'मैं')):
                response = "आपके सवाल के अनुसार: " + response
        elif language == 'pa':
            if not response.startswith(('ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਤੁਹਾਡੇ', 'ਮੈਂ')):
                response = "ਤੁਹਾਡੇ ਸਵਾਲ ਮੁਤਾਬਿਕ: " + response
        elif language == 'ur':
            if not response.startswith(('السلام', 'آپ کے', 'میں')):
                response = "آپ کے سوال کے مطابق: " + response
        else:
            if not response.startswith(('Based on', 'According to', 'I found', 'Here\'s')):
                response = "Based on your question: " + response
        
        return response
    
    def _fallback_response(self, query, language, error=None):
        """
        Fallback response when RAG system is not available
        """
        if language == 'hi':
            fallback = "क्षमा करें, मैं अभी आपका सवाल का सटीक उत्तर नहीं दे सकता। कृपया बाद में कोशिश करें।"
        elif language == 'pa':
            fallback = "ਮਾਫ ਕਰੋ, ਮੈਂ ਹੁਣ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਸਹੀ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
        elif language == 'ur':
            fallback = "معذرت، میں ابھی آپ کے سوال کا درست جواب نہیں دے سکتا۔ براہ کرم بعد میں کوشش کریں۔"
        else:
            fallback = "I apologize, but I'm currently unable to provide a specific answer to your question. Please try again later."
        
        if error:
            fallback += f" (Technical issue: {error})"
        
        return {
            'query': query,
            'response': fallback,
            'confidence': 0.0,
            'sources': [],
            'enhanced': False,
            'language': language,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """
    Main function to process RAG queries
    """
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        query = request_data.get('query', '').strip()
        language = request_data.get('language', 'en')
        top_k = request_data.get('topK', 3)
        
        if not query:
            print(json.dumps({
                'query': '',
                'response': 'No query provided',
                'confidence': 0.0,
                'sources': [],
                'error': 'Empty query'
            }))
            return
        
        # Initialize RAG interface and process query
        rag_interface = ChatbotRAGInterface()
        result = rag_interface.query_rag(query, language, top_k)
        
        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Output error response
        error_response = {
            'query': request_data.get('query', '') if 'request_data' in locals() else '',
            'response': f'RAG query processing failed: {str(e)}',
            'confidence': 0.0,
            'sources': [],
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()