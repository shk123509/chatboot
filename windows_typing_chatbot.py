import time
import sys
import os

# Windows terminal ke liye clear screen function
def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def type_response_words(text, speed='medium'):
    """
    Word by word typing effect - Windows mein better work karta hai
    """
    speeds = {
        'slow': 0.8,     # Har word ke baad 0.8 second wait
        'medium': 0.4,   # Har word ke baad 0.4 second wait  
        'fast': 0.2      # Har word ke baad 0.2 second wait
    }
    
    delay = speeds.get(speed, 0.4)
    words = text.split()
    
    for i, word in enumerate(words):
        print(word, end=' ', flush=True)
        if i < len(words) - 1:  # Last word ke baad wait nahi karna
            time.sleep(delay)
    print()  # New line

def type_response_char(text, speed='medium'):
    """
    Character by character typing - Windows optimized
    """
    speeds = {
        'slow': 0.1,
        'medium': 0.05,  
        'fast': 0.02
    }
    
    delay = speeds.get(speed, 0.05)
    
    for char in text:
        print(char, end='')
        sys.stdout.flush()
        time.sleep(delay)
    print()

def chatbot():
    clear_screen()
    print("🤖 TYPING CHATBOT - Windows Edition")
    print("=" * 50)
    print("📝 Commands:")
    print("  - hello, help, what is your name")
    print("  - slow, medium, fast (typing speed)")
    print("  - words (word-by-word typing)")
    print("  - chars (character-by-character)")
    print("  - quit (exit)")
    print("=" * 50)
    
    current_speed = 'medium'
    typing_mode = 'words'  # Default word-by-word
    
    while True:
        user_input = input(f"\n👤 You ({current_speed} speed): ").strip()
        
        if user_input.lower() == 'quit':
            print("\n🤖 Bot: ", end='')
            if typing_mode == 'words':
                type_response_words("👋 Goodbye! Take care!", current_speed)
            else:
                type_response_char("👋 Goodbye! Take care!", current_speed)
            break
            
        # Speed change
        if user_input.lower() in ['slow', 'medium', 'fast']:
            current_speed = user_input.lower()
            print(f"\n🤖 Bot: ", end='')
            response = f"✅ Speed set to: {current_speed.upper()}"
            if typing_mode == 'words':
                type_response_words(response, current_speed)
            else:
                type_response_char(response, current_speed)
            continue
            
        # Typing mode change
        if user_input.lower() == 'words':
            typing_mode = 'words'
            print(f"\n🤖 Bot: ", end='')
            type_response_words("✅ Changed to WORD-BY-WORD typing!", current_speed)
            continue
            
        if user_input.lower() == 'chars':
            typing_mode = 'chars'
            print(f"\n🤖 Bot: ", end='')
            type_response_char("✅ Changed to CHARACTER-BY-CHARACTER typing!", current_speed)
            continue
        
        # Responses
        responses = {
            'hello': f"🙏 Namaste! Main {typing_mode} mode mein {current_speed} speed se type kar raha hun!",
            'hi': f"🙏 Namaste! Main {typing_mode} mode mein {current_speed} speed se type kar raha hun!",
            'how are you': "😊 Main bilkul theek hun! Aap kaise hain? Typing effect kaisa lag raha hai?",
            'what is your name': "🤖 Main ek Windows-compatible typing chatbot hun! Speed control kar sakte hain!",
            'help': "💡 Try: hello, slow/medium/fast, words/chars, quit",
            'test': "🧪 Ye ek test message hai! Dekhiye kaise word-by-word ya char-by-char type ho raha hai!",
            'speed test': "⚡ SLOW mein bahut aaram se, MEDIUM normal speed, FAST mein jaldi type hota hai!"
        }
        
        response = responses.get(user_input.lower(), 
                               f"🤔 '{user_input}' samajh nahi aaya. Try: {', '.join(list(responses.keys())[:3])}")
        
        print(f"\n🤖 Bot ({typing_mode}): ", end='')
        
        # Typing mode ke according response
        if typing_mode == 'words':
            type_response_words(response, current_speed)
        else:
            type_response_char(response, current_speed)

if __name__ == "__main__":
    try:
        chatbot()
    except KeyboardInterrupt:
        print("\n\n👋 Chatbot stopped! Bye!")