import time
import sys
import subprocess
import os

def typing_effect(text, delay=0.05):
    """Typing effect with forced output"""
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def main():
    print("🤖 INTERACTIVE TYPING CHATBOT")
    print("=" * 40)
    
    while True:
        try:
            user_input = input("\n👤 Type something (or 'quit'): ")
            
            if user_input.lower() == 'quit':
                print("\n🤖 Bot: ", end='')
                typing_effect("Goodbye! Take care! 👋", 0.08)
                break
            
            elif user_input.lower() == 'slow':
                print("\n🤖 Bot: ", end='')
                typing_effect("This is SLOW typing... very relaxed pace!", 0.15)
                
            elif user_input.lower() == 'medium':
                print("\n🤖 Bot: ", end='')
                typing_effect("This is MEDIUM typing speed!", 0.08)
                
            elif user_input.lower() == 'fast':
                print("\n🤖 Bot: ", end='')
                typing_effect("This is FAST typing speed!", 0.03)
                
            elif user_input.lower() == 'test':
                print("\n🤖 Bot: ", end='')
                typing_effect("Testing... Can you see each character appearing one by one?", 0.08)
                
            else:
                print("\n🤖 Bot: ", end='')
                typing_effect(f"You said: '{user_input}' - Try: slow, medium, fast, test, quit", 0.08)
                
        except KeyboardInterrupt:
            print("\n\n👋 Bye!")
            break

if __name__ == "__main__":
    # Force unbuffered output
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
    main()