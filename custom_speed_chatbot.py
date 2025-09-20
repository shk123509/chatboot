#!/usr/bin/env python3
"""
🤖 Custom Speed Chatbot - Aaram aaram se response
"""

import time
import random

def slow_type(text):
    """Aaram se type karta hai"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.05)  # Thoda slow
    print()

def medium_type(text):
    """Medium speed mein type karta hai"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.02)  # Medium speed
    print()

def fast_type(text):
    """Tez speed mein type karta hai"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.008)  # Fast speed
    print()

def word_by_word_type(text):
    """Word by word type karta hai"""
    words = text.split()
    for word in words:
        print(word, end=' ', flush=True)
        time.sleep(0.4)  # Her word ke baad pause
    print()

# Main chatbot
def run_chatbot():
    print("🤖 CHATBOT SPEED SELECTOR")
    print("1. Slow typing (aaram se)")
    print("2. Medium typing (normal)")  
    print("3. Fast typing (tez)")
    print("4. Word by word (shabd-shabd)")
    
    choice = input("\nApna choice select karo (1-4): ")
    
    print("\n" + "="*50)
    print("🤖 CHATBOT AI STARTED")
    print("="*50)
    
    # Initial greeting
    greeting = "Hi! I am ChatBot AI 🤖 and I am here to solve your problems!"
    
    print("\nChatBot: ", end='')
    if choice == "1":
        slow_type(greeting)
        typing_func = slow_type
    elif choice == "2":
        medium_type(greeting)
        typing_func = medium_type
    elif choice == "3":
        fast_type(greeting)
        typing_func = fast_type
    elif choice == "4":
        word_by_word_type(greeting)
        typing_func = word_by_word_type
    else:
        print(greeting)
        typing_func = print
    
    # Response messages
    responses = [
        "Great! I'm here to help you with that problem.",
        "That's interesting! How can I assist you further?",
        "Perfect! Let me solve this for you.",
        "I understand your concern. I'm ready to help!",
        "Awesome! What specific solution do you need?",
        "Thanks for sharing! I'll help you find the answer.",
        "Excellent! I'm here to make things easier for you.",
        "Good question! Let me help you with that."
    ]
    
    print("\n" + "-"*50)
    print("Type 'bye' to exit | Type anything to chat")
    print("-"*50)
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['bye', 'quit', 'exit', 'goodbye']:
            print("\nChatBot: ", end='')
            typing_func("Thank you for chatting! Have a great day! 👋")
            break
        
        if user_input:
            response = random.choice(responses)
            print("ChatBot: ", end='')
            typing_func(response)

if __name__ == "__main__":
    run_chatbot()