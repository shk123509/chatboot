#!/usr/bin/env python3
"""
Speech-to-Text conversion for farmer voice messages
Supports multiple languages including Hindi, Punjabi, and English
"""

import json
import sys
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

try:
    import speech_recognition as sr
    import pydub
    from pydub import AudioSegment
    import tempfile
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("⚠️ Speech recognition libraries not available. Install with: pip install SpeechRecognition pydub")

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not available. Install with: pip install openai-whisper")

class SpeechToTextConverter:
    """
    Advanced speech-to-text converter with multiple language support
    """
    
    def __init__(self):
        self.language_codes = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'pa': 'pa-IN',
            'ur': 'ur-PK'
        }
        
        self.recognizer = None
        self.whisper_model = None
        
        if SPEECH_RECOGNITION_AVAILABLE:
            self.recognizer = sr.Recognizer()
            # Adjust for ambient noise
            self.recognizer.energy_threshold = 300
            self.recognizer.dynamic_energy_threshold = True
            self.recognizer.pause_threshold = 0.8
            self.recognizer.phrase_threshold = 0.3
        
        if WHISPER_AVAILABLE:
            try:
                self.whisper_model = whisper.load_model("base")
                print("✅ Whisper model loaded successfully")
            except Exception as e:
                print(f"⚠️ Could not load Whisper model: {e}")
                self.whisper_model = None
    
    def convert_audio_to_text(self, audio_path, language='en'):
        """
        Convert audio file to text using multiple methods
        """
        if not os.path.exists(audio_path):
            return self._error_response("Audio file not found")
        
        # Try multiple conversion methods
        methods = []
        
        if self.whisper_model:
            methods.append(('whisper', self._whisper_transcribe))
        
        if SPEECH_RECOGNITION_AVAILABLE:
            methods.extend([
                ('google', self._google_speech_recognition),
                ('sphinx', self._sphinx_recognition)
            ])
        
        # Try each method until one succeeds
        for method_name, method_func in methods:
            try:
                print(f"🎤 Trying {method_name} recognition...")
                result = method_func(audio_path, language)
                if result['success']:
                    result['method'] = method_name
                    return result
                else:
                    print(f"⚠️ {method_name} failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ {method_name} error: {str(e)}")
                continue
        
        # If all methods fail
        return self._error_response("All speech recognition methods failed")
    
    def _whisper_transcribe(self, audio_path, language):
        """
        Use OpenAI Whisper for transcription
        """
        try:
            # Convert audio to format supported by Whisper if needed
            processed_audio_path = self._preprocess_audio(audio_path)
            
            # Transcribe using Whisper
            result = self.whisper_model.transcribe(
                processed_audio_path,
                language=language if language != 'en' else None,
                task='transcribe'
            )
            
            text = result['text'].strip()
            confidence = 0.9  # Whisper generally has high accuracy
            
            # Clean up temporary file if created
            if processed_audio_path != audio_path:
                os.remove(processed_audio_path)
            
            if text:
                return {
                    'success': True,
                    'text': text,
                    'confidence': confidence,
                    'language_detected': result.get('language', language),
                    'segments': result.get('segments', [])
                }
            else:
                return {
                    'success': False,
                    'error': 'No speech detected in audio'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Whisper transcription failed: {str(e)}'
            }
    
    def _google_speech_recognition(self, audio_path, language):
        """
        Use Google Speech Recognition API
        """
        try:
            # Convert audio to WAV format for speech recognition
            audio_wav_path = self._convert_to_wav(audio_path)
            
            with sr.AudioFile(audio_wav_path) as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = self.recognizer.record(source)
            
            # Get language code
            lang_code = self.language_codes.get(language, 'en-US')
            
            # Recognize speech using Google API
            text = self.recognizer.recognize_google(
                audio_data,
                language=lang_code,
                show_all=False
            )
            
            # Clean up temporary file if created
            if audio_wav_path != audio_path:
                os.remove(audio_wav_path)
            
            if text:
                return {
                    'success': True,
                    'text': text.strip(),
                    'confidence': 0.8,
                    'language_detected': language
                }
            else:
                return {
                    'success': False,
                    'error': 'No speech detected'
                }
                
        except sr.UnknownValueError:
            return {
                'success': False,
                'error': 'Could not understand audio'
            }
        except sr.RequestError as e:
            return {
                'success': False,
                'error': f'Google Speech Recognition service error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Google recognition failed: {str(e)}'
            }
    
    def _sphinx_recognition(self, audio_path, language):
        """
        Use CMU Sphinx (PocketSphinx) for offline recognition
        """
        try:
            # Convert audio to WAV format
            audio_wav_path = self._convert_to_wav(audio_path)
            
            with sr.AudioFile(audio_wav_path) as source:
                audio_data = self.recognizer.record(source)
            
            # Use PocketSphinx for offline recognition (English only)
            if language == 'en':
                text = self.recognizer.recognize_sphinx(audio_data)
                
                # Clean up temporary file if created
                if audio_wav_path != audio_path:
                    os.remove(audio_wav_path)
                
                if text:
                    return {
                        'success': True,
                        'text': text.strip(),
                        'confidence': 0.6,  # Sphinx generally has lower accuracy
                        'language_detected': language
                    }
            
            return {
                'success': False,
                'error': f'Sphinx does not support language: {language}'
            }
            
        except sr.UnknownValueError:
            return {
                'success': False,
                'error': 'Sphinx could not understand audio'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Sphinx recognition failed: {str(e)}'
            }
    
    def _preprocess_audio(self, audio_path):
        """
        Preprocess audio for better recognition
        """
        try:
            # Load audio file
            audio = AudioSegment.from_file(audio_path)
            
            # Normalize audio
            audio = audio.normalize()
            
            # Convert to mono if stereo
            if audio.channels > 1:
                audio = audio.set_channels(1)
            
            # Set sample rate to 16kHz (optimal for speech recognition)
            audio = audio.set_frame_rate(16000)
            
            # Apply noise reduction (simple high-pass filter)
            audio = audio.high_pass_filter(300)
            
            # Save processed audio to temporary file
            temp_path = tempfile.mktemp(suffix='.wav')
            audio.export(temp_path, format='wav')
            
            return temp_path
            
        except Exception as e:
            print(f"⚠️ Audio preprocessing failed: {e}")
            return audio_path  # Return original path if preprocessing fails
    
    def _convert_to_wav(self, audio_path):
        """
        Convert audio file to WAV format if needed
        """
        try:
            # Check if already WAV format
            if audio_path.lower().endswith('.wav'):
                return audio_path
            
            # Convert to WAV
            audio = AudioSegment.from_file(audio_path)
            temp_wav_path = tempfile.mktemp(suffix='.wav')
            audio.export(temp_wav_path, format='wav')
            
            return temp_wav_path
            
        except Exception as e:
            print(f"⚠️ Audio conversion failed: {e}")
            return audio_path  # Return original path if conversion fails
    
    def _error_response(self, error_message):
        """
        Generate error response
        """
        return {
            'success': False,
            'error': error_message,
            'text': '',
            'confidence': 0.0
        }

def detect_language_from_audio(text):
    """
    Simple language detection based on transcribed text
    """
    # Hindi detection (Devanagari script)
    if any('\u0900' <= char <= '\u097F' for char in text):
        return 'hi'
    
    # Punjabi detection (Gurmukhi script)
    if any('\u0A00' <= char <= '\u0A7F' for char in text):
        return 'pa'
    
    # Urdu detection (Arabic script)
    if any('\u0600' <= char <= '\u06FF' for char in text):
        return 'ur'
    
    # Default to English
    return 'en'

def main():
    """
    Main function to process speech-to-text requests
    """
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        audio_path = request_data.get('audioPath')
        language = request_data.get('language', 'en')
        
        if not audio_path or not os.path.exists(audio_path):
            print(json.dumps({
                'success': False,
                'error': 'Audio file not found',
                'text': '',
                'confidence': 0.0
            }))
            return
        
        # Initialize converter and process audio
        converter = SpeechToTextConverter()
        result = converter.convert_audio_to_text(audio_path, language)
        
        # If successful, detect language if not specified
        if result.get('success') and result.get('text'):
            detected_lang = detect_language_from_audio(result['text'])
            result['language_detected'] = detected_lang
            
            # Add processing metadata
            result['processed_at'] = datetime.now().isoformat()
            result['audio_file'] = os.path.basename(audio_path)
        
        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Output error response
        error_response = {
            'success': False,
            'error': f'Speech-to-text conversion failed: {str(e)}',
            'text': '',
            'confidence': 0.0
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()