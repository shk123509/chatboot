#!/usr/bin/env python3
"""
Test script to check if all required dependencies are properly installed
and working for the Agricultural AI Assistant
"""

import sys
import json
import traceback
from datetime import datetime

def test_basic_imports():
    """Test basic Python imports"""
    print("🔧 Testing basic Python imports...")
    
    try:
        import json
        import sys
        import os
        print("✅ Basic Python modules: OK")
        return True
    except Exception as e:
        print(f"❌ Basic Python modules failed: {e}")
        return False

def test_image_processing():
    """Test image processing libraries"""
    print("🖼️ Testing image processing libraries...")
    
    results = {}
    
    # Test OpenCV
    try:
        import cv2
        print(f"✅ OpenCV version: {cv2.__version__}")
        results['opencv'] = True
    except ImportError as e:
        print(f"❌ OpenCV not available: {e}")
        results['opencv'] = False
    
    # Test NumPy
    try:
        import numpy as np
        print(f"✅ NumPy version: {np.__version__}")
        results['numpy'] = True
    except ImportError as e:
        print(f"❌ NumPy not available: {e}")
        results['numpy'] = False
    
    # Test PIL/Pillow
    try:
        from PIL import Image
        print(f"✅ Pillow available")
        results['pillow'] = True
    except ImportError as e:
        print(f"❌ Pillow not available: {e}")
        results['pillow'] = False
    
    # Test scikit-learn
    try:
        import sklearn
        print(f"✅ Scikit-learn version: {sklearn.__version__}")
        results['sklearn'] = True
    except ImportError as e:
        print(f"⚠️ Scikit-learn not available (optional): {e}")
        results['sklearn'] = False
    
    return results

def test_speech_libraries():
    """Test speech recognition and TTS libraries"""
    print("🎤 Testing speech libraries...")
    
    results = {}
    
    # Test SpeechRecognition
    try:
        import speech_recognition as sr
        print(f"✅ SpeechRecognition available")
        results['speech_recognition'] = True
    except ImportError as e:
        print(f"⚠️ SpeechRecognition not available: {e}")
        results['speech_recognition'] = False
    
    # Test pydub
    try:
        import pydub
        print(f"✅ Pydub available")
        results['pydub'] = True
    except ImportError as e:
        print(f"⚠️ Pydub not available: {e}")
        results['pydub'] = False
    
    # Test pyttsx3
    try:
        import pyttsx3
        print(f"✅ Pyttsx3 available")
        results['pyttsx3'] = True
    except ImportError as e:
        print(f"⚠️ Pyttsx3 not available: {e}")
        results['pyttsx3'] = False
    
    # Test gTTS
    try:
        from gtts import gTTS
        print(f"✅ gTTS available")
        results['gtts'] = True
    except ImportError as e:
        print(f"⚠️ gTTS not available: {e}")
        results['gtts'] = False
    
    return results

def test_advanced_libraries():
    """Test advanced AI/ML libraries (optional)"""
    print("🧠 Testing advanced AI/ML libraries...")
    
    results = {}
    
    # Test PyTorch
    try:
        import torch
        print(f"✅ PyTorch version: {torch.__version__}")
        results['torch'] = True
    except ImportError as e:
        print(f"⚠️ PyTorch not available (optional): {e}")
        results['torch'] = False
    
    # Test TensorFlow
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow version: {tf.__version__}")
        results['tensorflow'] = True
    except ImportError as e:
        print(f"⚠️ TensorFlow not available (optional): {e}")
        results['tensorflow'] = False
    
    # Test Whisper
    try:
        import whisper
        print(f"✅ Whisper available")
        results['whisper'] = True
    except ImportError as e:
        print(f"⚠️ Whisper not available (optional): {e}")
        results['whisper'] = False
    
    return results

def test_image_analysis_functionality():
    """Test actual image analysis functionality"""
    print("🔍 Testing image analysis functionality...")
    
    try:
        import os
        import cv2
        import numpy as np
        
        # Create a simple test image
        test_image = np.zeros((200, 200, 3), dtype=np.uint8)
        # Add some green areas (simulating vegetation)
        test_image[50:150, 50:150] = [0, 255, 0]  # Green square
        # Add some brown areas (simulating problems)
        test_image[160:190, 160:190] = [42, 42, 165]  # Brown square
        
        # Test basic OpenCV operations
        hsv = cv2.cvtColor(test_image, cv2.COLOR_BGR2HSV)
        
        # Test color analysis
        green_mask = cv2.inRange(hsv, (40, 50, 50), (80, 255, 255))
        green_percentage = (np.sum(green_mask > 0) / (test_image.shape[0] * test_image.shape[1])) * 100
        
        print(f"✅ Image analysis test passed - Green coverage: {green_percentage:.1f}%")
        return True
        
    except Exception as e:
        print(f"❌ Image analysis test failed: {e}")
        print(traceback.format_exc())
        return False

def test_speech_functionality():
    """Test speech processing functionality"""
    print("🗣️ Testing speech processing functionality...")
    
    try:
        # Test basic TTS functionality
        import pyttsx3
        engine = pyttsx3.init()
        if engine:
            print("✅ TTS engine initialization: OK")
            # Don't actually speak, just test initialization
            engine.stop()
            return True
        else:
            print("⚠️ TTS engine initialization failed")
            return False
    except Exception as e:
        print(f"⚠️ TTS test failed: {e}")
        return False

def generate_report(results):
    """Generate a comprehensive test report"""
    print("\n" + "="*50)
    print("🏁 SETUP TEST REPORT")
    print("="*50)
    
    all_results = {}
    total_tests = 0
    passed_tests = 0
    
    for category, tests in results.items():
        print(f"\n📋 {category.upper()}:")
        category_passed = 0
        category_total = 0
        
        for test_name, status in tests.items():
            status_icon = "✅" if status else "❌"
            print(f"  {status_icon} {test_name}: {'PASS' if status else 'FAIL'}")
            category_total += 1
            total_tests += 1
            if status:
                category_passed += 1
                passed_tests += 1
        
        all_results[category] = f"{category_passed}/{category_total}"
    
    print(f"\n📊 OVERALL RESULTS:")
    print(f"   Total Tests: {passed_tests}/{total_tests}")
    print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests >= total_tests * 0.8:  # 80% pass rate
        print(f"\n🎉 Setup Status: READY FOR PRODUCTION!")
        print(f"   Your system is ready to run the Agricultural AI Assistant.")
    elif passed_tests >= total_tests * 0.6:  # 60% pass rate
        print(f"\n⚠️ Setup Status: PARTIALLY READY")
        print(f"   Basic functionality should work, but some advanced features may be limited.")
    else:
        print(f"\n❌ Setup Status: NEEDS ATTENTION")
        print(f"   Please install missing dependencies before using the system.")
    
    print(f"\n🔧 Installation Recommendations:")
    if not results.get('image_processing', {}).get('opencv', False):
        print("   pip install opencv-python")
    if not results.get('image_processing', {}).get('numpy', False):
        print("   pip install numpy")
    if not results.get('speech_libraries', {}).get('speech_recognition', False):
        print("   pip install SpeechRecognition")
    
    return all_results

def main():
    """Run all tests and generate report"""
    print("🚀 Agricultural AI Assistant - Setup Test")
    print("="*50)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🐍 Python Version: {sys.version}")
    print()
    
    results = {}
    
    # Run all tests
    basic_ok = test_basic_imports()
    results['basic_imports'] = {'basic_modules': basic_ok}
    
    results['image_processing'] = test_image_processing()
    results['speech_libraries'] = test_speech_libraries()
    results['advanced_libraries'] = test_advanced_libraries()
    
    # Test functionality
    image_func_ok = test_image_analysis_functionality()
    speech_func_ok = test_speech_functionality()
    
    results['functionality_tests'] = {
        'image_analysis': image_func_ok,
        'speech_processing': speech_func_ok
    }
    
    # Generate comprehensive report
    generate_report(results)
    
    print(f"\n💡 Next Steps:")
    print("   1. Install any missing dependencies")
    print("   2. Test the enhanced chatbot UI: /enhanced_chatbot.html")
    print("   3. Try uploading images for crop analysis")
    print("   4. Test voice recording features")
    
    return results

if __name__ == "__main__":
    main()