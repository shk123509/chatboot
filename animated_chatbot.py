#!/usr/bin/env python3
"""
🤖 Animated Chatbot - Response with Typing Effect
Chatbot jo response slowly type karta hai jaise real person type kar raha ho
"""

import time
import sys
import random
import os

class AnimatedChatbot:
    def __init__(self):
        self.bot_name = "ChatBot AI"
        self.responses = {
            "greeting": [
                "Hi! I am ChatBot AI 🤖 and I am here to solve your problems!",
                "Hello! Welcome! I am your AI assistant ready to help you!",
                "Hey there! I'm ChatBot AI and I'm excited to assist you today!"
            ],
            "help": [
                "I can help you with various tasks like answering questions, solving problems, and providing information.",
                "I'm here to assist you with any queries or problems you might have!",
                "Feel free to ask me anything - I'm here to help solve your problems!"
            ],
            "default": [
                "That's interesting! Let me think about that...",
                "I understand what you're saying. How can I help you with this?",
                "Thanks for sharing! What specific solution are you looking for?"
            ]
        }
    
    def typing_effect(self, text, speed=0.03):
        """Type text with realistic typing speed effect"""
        for char in text:
            print(char, end='', flush=True)
            
            # Variable typing speed for more realistic effect
            if char == ' ':
                time.sleep(speed * 0.5)  # Faster for spaces
            elif char in '.,!?;:':
                time.sleep(speed * 3)    # Pause at punctuation
            elif char == '\n':
                time.sleep(speed * 2)    # Pause at line breaks
            else:
                # Random slight variation in typing speed
                variation = random.uniform(0.8, 1.2)
                time.sleep(speed * variation)
        
        print()  # New line after complete text
        time.sleep(0.5)  # Small pause after complete response
    
    def word_by_word_effect(self, text, speed=0.5):
        """Show text word by word for different effect"""
        words = text.split()
        for word in words:
            print(word, end=' ', flush=True)
            time.sleep(speed)
        print()
        time.sleep(0.5)
    
    def simulate_thinking(self):
        """Show thinking animation"""
        thinking_chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        print("Thinking", end='')
        
        for i in range(15):  # Show thinking for ~1.5 seconds
            print(f'\r{thinking_chars[i % len(thinking_chars)]} Thinking...', end='', flush=True)
            time.sleep(0.1)
        
        print('\r' + ' ' * 20 + '\r', end='')  # Clear the thinking line
    
    def get_response(self, user_input):
        """Get appropriate response based on user input"""
        user_input_lower = user_input.lower()
        
        if any(word in user_input_lower for word in ['hi', 'hello', 'hey', 'namaste']):
            return random.choice(self.responses["greeting"])
        elif any(word in user_input_lower for word in ['help', 'assist', 'support']):
            return random.choice(self.responses["help"])
        elif "problem" in user_input_lower or "solve" in user_input_lower:
            return f"I understand you have a problem to solve. Can you tell me more details about: '{user_input}'? I'm here to help find the best solution!"
        elif "?" in user_input:
            return f"Great question! Let me help you with that. Regarding '{user_input}', here's what I think..."
        else:
            return f"Thanks for telling me about '{user_input}'. {random.choice(self.responses['default'])}"
    
    def clear_screen(self):
        """Clear screen for better UI"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def show_welcome(self):
        """Show animated welcome message"""
        welcome_text = f"""
╔══════════════════════════════════════════════════╗
║              🤖 ANIMATED CHATBOT AI 🤖            ║
║                                                  ║
║     Response with Typing Effect - Like Real!     ║
╚══════════════════════════════════════════════════╝
        """
        print(welcome_text)
        time.sleep(1)
    
    def run(self):
        """Main chatbot loop with animated responses"""
        self.clear_screen()
        self.show_welcome()
        
        # Initial greeting with typing effect
        self.simulate_thinking()
        self.typing_effect("Hi! I am ChatBot AI 🤖 and I am here to solve your problems!", 0.04)
        self.typing_effect("Please tell me what you need help with...", 0.03)
        
        print("\n" + "="*60 + "\n")
        
        while True:
            try:
                # Get user input
                user_input = input("You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                    self.simulate_thinking()
                    self.typing_effect("Thank you for chatting with me! Have a great day! 👋", 0.04)
                    break
                
                if not user_input:
                    self.typing_effect("Please say something! I'm here to help! 😊", 0.03)
                    continue
                
                # Show thinking animation
                self.simulate_thinking()
                
                # Get and display response with typing effect
                response = self.get_response(user_input)
                print("ChatBot AI: ", end='')
                self.typing_effect(response, 0.03)
                
                print("-" * 60)
                
            except KeyboardInterrupt:
                print("\n")
                self.typing_effect("Goodbye! Thanks for using ChatBot AI! 👋", 0.04)
                break
            except Exception as e:
                self.typing_effect(f"Sorry, something went wrong: {e}", 0.03)

class FastChatbot(AnimatedChatbot):
    """Faster version of chatbot"""
    
    def run_fast(self):
        """Fast typing version"""
        self.clear_screen()
        self.show_welcome()
        
        self.typing_effect("Hi! I am ChatBot AI 🤖 and I am here to solve your problems!", 0.01)
        
        while True:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                self.typing_effect("Goodbye! 👋", 0.01)
                break
            
            if user_input:
                response = self.get_response(user_input)
                print("ChatBot AI: ", end='')
                self.typing_effect(response, 0.01)

class WordByWordChatbot(AnimatedChatbot):
    """Word by word version of chatbot"""
    
    def run_word_by_word(self):
        """Word by word typing version"""
        self.clear_screen()
        self.show_welcome()
        
        print("ChatBot AI: ", end='')
        self.word_by_word_effect("Hi! I am ChatBot AI and I am here to solve your problems!", 0.3)
        
        while True:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("ChatBot AI: ", end='')
                self.word_by_word_effect("Thank you! Goodbye!", 0.3)
                break
            
            if user_input:
                response = self.get_response(user_input)
                print("ChatBot AI: ", end='')
                self.word_by_word_effect(response, 0.3)

def main():
    """Main function with different chatbot options"""
    print("Choose chatbot type:")
    print("1. Normal Speed Typing (Realistic)")
    print("2. Fast Typing")
    print("3. Word by Word")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        bot = AnimatedChatbot()
        bot.run()
    elif choice == "2":
        bot = FastChatbot()
        bot.run_fast()
    elif choice == "3":
        bot = WordByWordChatbot()
        bot.run_word_by_word()
    else:
        print("Invalid choice! Starting normal chatbot...")
        bot = AnimatedChatbot()
        bot.run()

if __name__ == "__main__":
    main()