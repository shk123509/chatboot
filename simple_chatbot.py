#!/usr/bin/env python3
"""
🤖 Simple Animated Chatbot with Speed Control
"""

import time
import random
import os

def typing_effect(text, speed=0.02):
    """Type text character by character"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(speed)
    print()

def fast_typing(text, speed=0.01):
    """Fast typing effect"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(speed)
    print()

def instant_response(text):
    """Instant response - no delay"""
    print(text)

def main():
    """Main chatbot with speed options"""
    
    print("🤖 CHATBOT SPEED OPTIONS:")
    print("1. Slow typing (realistic)")
    print("2. Fast typing")
    print("3. Instant response")
    
    speed_choice = input("\nChoose speed (1/2/3): ").strip()
    
    # Clear screen
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print("🤖 ANIMATED CHATBOT AI")
    print("=" * 40)
    
    # Choose typing function based on user choice
    if speed_choice == "1":
        type_func = lambda text: typing_effect(text, 0.03)
        print("\nChatBot: ", end='')
        type_func("Hi! I am ChatBot AI 🤖 and I am here to solve your problems!")
    elif speed_choice == "2":
        type_func = lambda text: fast_typing(text, 0.01)
        print("\nChatBot: ", end='')
        type_func("Hi! I am ChatBot AI 🤖 and I am here to solve your problems!")
    else:
        type_func = instant_response
        print("\nChatBot: Hi! I am ChatBot AI 🤖 and I am here to solve your problems!")
    
    # Responses database
    responses = [
        "That's interesting! How can I help you with that?",
        "I understand. What specific solution are you looking for?",
        "Great! Let me help you solve this problem.",
        "Thanks for sharing! I'm here to assist you.",
        "I see what you mean. How can I make this better for you?",
        "Perfect! What would you like me to help you with?",
        "Awesome! I'm ready to solve your problem."
    ]
    
    print("\n" + "-" * 40)
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye', 'q']:
            print("\nChatBot: ", end='')
            if speed_choice == "1":
                typing_effect("Thank you! Have a great day! 👋", 0.03)
            elif speed_choice == "2":
                fast_typing("Thank you! Have a great day! 👋", 0.01)
            else:
                instant_response("Thank you! Have a great day! 👋")
            break
        
        if not user_input:
            continue
        
        # Get random response
        response = random.choice(responses)
        
        print("ChatBot: ", end='')
        if speed_choice == "1":
            typing_effect(response, 0.03)
        elif speed_choice == "2":
            fast_typing(response, 0.01)
        else:
            instant_response(response)

if __name__ == "__main__":
    main()