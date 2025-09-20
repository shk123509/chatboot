import time
import sys

def type_response(text, speed='medium'):
    """
    Text ko realistic typing speed mein print karta hai
    Speed options: 'slow', 'medium', 'fast'
    """
    
    # Speed settings (seconds per character)
    speeds = {
        'slow': 0.15,    # Bahut aaram se
        'medium': 0.08,  # Normal speed  
        'fast': 0.03     # Tez speed
    }
    
    delay = speeds.get(speed, 0.08)
    
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()  # Windows ke liye force flush
        time.sleep(delay)
    print()  # New line ke liye

def chatbot():
    print("🤖 Chatbot Ready! (Type 'quit' to exit)")
    print("Speed options: slow, medium, fast")
    print("-" * 40)
    
    current_speed = 'medium'
    
    while True:
        user_input = input("\n👤 You: ").strip()
        
        if user_input.lower() == 'quit':
            type_response("👋 Bye! Take care!", current_speed)
            break
            
        # Speed change karne ke liye
        if user_input.lower() in ['slow', 'medium', 'fast']:
            current_speed = user_input.lower()
            type_response(f"✅ Speed changed to: {current_speed}", current_speed)
            continue
            
        # Simple responses
        responses = {
            'hello': f"🙏 Namaste! Main {current_speed} speed mein type kar raha hun.",
            'how are you': "😊 Main bilkul theek hun! Aap kaise hain?",
            'what is your name': "🤖 Main ek simple typing chatbot hun!",
            'help': "💡 Commands: slow/medium/fast (speed change), quit (exit)"
        }
        
        response = responses.get(user_input.lower(), 
                               f"🤔 Samajh nahi aaya. Try: {', '.join(responses.keys())}")
        
        print("🤖 Bot: ", end='')
        type_response(response, current_speed)

if __name__ == "__main__":
    chatbot()