#!/usr/bin/env python3
"""
Text-to-Speech conversion for farmer chatbot responses
Supports multiple languages including Hindi, Punjabi, and English
"""

import json
import sys
import os
import tempfile
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    print("⚠️ pyttsx3 not available. Install with: pip install pyttsx3")

try:
    from gtts import gTTS
    import pygame
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    print("⚠️ gTTS not available. Install with: pip install gtts pygame")

try:
    import edge_tts
    import asyncio
    EDGE_TTS_AVAILABLE = True
except ImportError:
    EDGE_TTS_AVAILABLE = False
    print("⚠️ edge-tts not available. Install with: pip install edge-tts")

class TextToSpeechConverter:
    """
    Advanced text-to-speech converter with multiple language support
    """
    
    def __init__(self):
        self.language_codes = {
            'en': 'en',
            'hi': 'hi',
            'pa': 'pa',
            'ur': 'ur'
        }
        
        self.gtts_language_codes = {
            'en': 'en',
            'hi': 'hi',
            'pa': 'pa',
            'ur': 'ur'
        }
        
        self.edge_tts_voices = {
            'en': 'en-US-JennyNeural',
            'hi': 'hi-IN-SwaraNeural',
            'pa': 'pa-IN-GaganNeural',
            'ur': 'ur-PK-AsadNeural'
        }
        
        # Initialize pyttsx3 if available
        self.tts_engine = None
        if PYTTSX3_AVAILABLE:
            try:
                self.tts_engine = pyttsx3.init()
                self._configure_pyttsx3_engine()
            except Exception as e:
                print(f"⚠️ Could not initialize pyttsx3: {e}")
                self.tts_engine = None
    
    def _configure_pyttsx3_engine(self):
        """
        Configure pyttsx3 TTS engine settings
        """
        if self.tts_engine:
            # Set speech rate (words per minute)
            self.tts_engine.setProperty('rate', 150)
            
            # Set volume (0.0 to 1.0)
            self.tts_engine.setProperty('volume', 0.8)
            
            # Try to set a good voice
            voices = self.tts_engine.getProperty('voices')
            if voices:
                # Prefer female voice if available
                for voice in voices:
                    if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                        self.tts_engine.setProperty('voice', voice.id)
                        break
                else:
                    # Use first available voice
                    self.tts_engine.setProperty('voice', voices[0].id)
    
    def convert_text_to_speech(self, text, language='en', output_dir=None):
        """
        Convert text to speech using multiple methods
        """
        if not text or not text.strip():
            return self._error_response("No text provided")
        
        # Clean text for better speech synthesis
        cleaned_text = self._clean_text_for_speech(text)
        
        # Set output directory
        if not output_dir:
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'audio')
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Try multiple TTS methods
        methods = []
        
        if EDGE_TTS_AVAILABLE:
            methods.append(('edge_tts', self._edge_tts_synthesis))
        
        if GTTS_AVAILABLE:
            methods.append(('gtts', self._gtts_synthesis))
        
        if PYTTSX3_AVAILABLE and self.tts_engine:
            methods.append(('pyttsx3', self._pyttsx3_synthesis))
        
        # Try each method until one succeeds
        for method_name, method_func in methods:
            try:
                print(f"🔊 Trying {method_name} synthesis...")
                result = method_func(cleaned_text, language, output_dir)
                if result['success']:
                    result['method'] = method_name
                    result['original_text'] = text
                    result['cleaned_text'] = cleaned_text
                    return result
                else:
                    print(f"⚠️ {method_name} failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ {method_name} error: {str(e)}")
                continue
        
        # If all methods fail
        return self._error_response("All text-to-speech methods failed")
    
    def _edge_tts_synthesis(self, text, language, output_dir):
        """
        Use Microsoft Edge TTS for speech synthesis
        """
        try:
            # Get appropriate voice for language
            voice = self.edge_tts_voices.get(language, 'en-US-JennyNeural')
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"speech_edge_{timestamp}.mp3"
            output_path = os.path.join(output_dir, filename)
            
            # Run async TTS synthesis
            asyncio.run(self._async_edge_tts(text, voice, output_path))
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                return {
                    'success': True,
                    'audioUrl': f'/uploads/audio/{filename}',
                    'audioPath': output_path,
                    'voice': voice,
                    'duration': self._estimate_duration(text),
                    'file_size': os.path.getsize(output_path)
                }
            else:
                return {
                    'success': False,
                    'error': 'Edge TTS synthesis failed - no audio generated'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Edge TTS synthesis failed: {str(e)}'
            }
    
    async def _async_edge_tts(self, text, voice, output_path):
        """
        Async function for Edge TTS synthesis
        """
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
    
    def _gtts_synthesis(self, text, language, output_dir):
        """
        Use Google Text-to-Speech for speech synthesis
        """
        try:
            # Get language code for gTTS
            gtts_lang = self.gtts_language_codes.get(language, 'en')
            
            # Create gTTS object
            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"speech_gtts_{timestamp}.mp3"
            output_path = os.path.join(output_dir, filename)
            
            # Save to file
            tts.save(output_path)
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                return {
                    'success': True,
                    'audioUrl': f'/uploads/audio/{filename}',
                    'audioPath': output_path,
                    'language': gtts_lang,
                    'duration': self._estimate_duration(text),
                    'file_size': os.path.getsize(output_path)
                }
            else:
                return {
                    'success': False,
                    'error': 'gTTS synthesis failed - no audio generated'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'gTTS synthesis failed: {str(e)}'
            }
    
    def _pyttsx3_synthesis(self, text, language, output_dir):
        """
        Use pyttsx3 for offline speech synthesis
        """
        try:
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"speech_pyttsx3_{timestamp}.wav"
            output_path = os.path.join(output_dir, filename)
            
            # Configure engine for language (limited support)
            if language != 'en':
                # pyttsx3 has limited language support
                print(f"⚠️ pyttsx3 may not fully support language: {language}")
            
            # Save to file
            self.tts_engine.save_to_file(text, output_path)
            self.tts_engine.runAndWait()
            
            # Wait a moment for file to be written
            import time
            time.sleep(0.5)
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                return {
                    'success': True,
                    'audioUrl': f'/uploads/audio/{filename}',
                    'audioPath': output_path,
                    'duration': self._estimate_duration(text),
                    'file_size': os.path.getsize(output_path)
                }
            else:
                return {
                    'success': False,
                    'error': 'pyttsx3 synthesis failed - no audio generated'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'pyttsx3 synthesis failed: {str(e)}'
            }
    
    def _clean_text_for_speech(self, text):
        """
        Clean text to make it more suitable for speech synthesis
        """
        # Remove markdown formatting
        import re
        
        # Remove markdown bold/italic
        text = re.sub(r'\*\*(.*?)\*\*', r'\\1', text)
        text = re.sub(r'\*(.*?)\*', r'\\1', text)
        
        # Remove markdown headers
        text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
        
        # Replace newlines with periods for better speech flow
        text = re.sub(r'\n+', '. ', text)
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Remove emojis and special characters that don't speak well
        text = re.sub(r'[🌾🔍💡📚🎯📊📷🎤✅❌⚠️🚀]', '', text)
        
        # Replace common abbreviations
        replacements = {
            'e.g.': 'for example',
            'i.e.': 'that is',
            'etc.': 'etcetera',
            'vs.': 'versus',
            'Mr.': 'Mister',
            'Mrs.': 'Missus',
            'Dr.': 'Doctor',
            '%': ' percent',
            '&': ' and ',
            '@': ' at '
        }
        
        for abbrev, replacement in replacements.items():
            text = text.replace(abbrev, replacement)
        
        return text.strip()
    
    def _estimate_duration(self, text):
        """
        Estimate audio duration based on text length
        """
        # Rough estimate: average speaking rate is ~150 words per minute
        words = len(text.split())
        duration_minutes = words / 150.0
        duration_seconds = duration_minutes * 60
        return max(1.0, duration_seconds)  # Minimum 1 second
    
    def _error_response(self, error_message):
        """
        Generate error response
        """
        return {
            'success': False,
            'error': error_message,
            'audioUrl': '',
            'audioPath': ''
        }

def main():
    """
    Main function to process text-to-speech requests
    """
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        text = request_data.get('text', '')
        language = request_data.get('language', 'en')
        
        if not text or not text.strip():
            print(json.dumps({
                'success': False,
                'error': 'No text provided',
                'audioUrl': '',
                'audioPath': ''
            }))
            return
        
        # Initialize converter and process text
        converter = TextToSpeechConverter()
        result = converter.convert_text_to_speech(text, language)
        
        # Add processing metadata
        if result.get('success'):
            result['processed_at'] = datetime.now().isoformat()
            result['text_length'] = len(text)
            result['word_count'] = len(text.split())
        
        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Output error response
        error_response = {
            'success': False,
            'error': f'Text-to-speech conversion failed: {str(e)}',
            'audioUrl': '',
            'audioPath': ''
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()