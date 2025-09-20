import time
import os

def slow_print(text):
    """Simple typing effect - guaranteed to work"""
    for char in text:
        print(char, end='')
        time.sleep(0.1)  # 0.1 second delay per character
    print()  # New line

def medium_print(text):
    """Medium speed typing"""
    for char in text:
        print(char, end='')
        time.sleep(0.05)  # 0.05 second delay
    print()

def fast_print(text):
    """Fast typing"""
    for char in text:
        print(char, end='')
        time.sleep(0.02)  # 0.02 second delay
    print()

def demo():
    """Demo function to test typing speeds"""
    print("=== TYPING SPEED TEST ===\n")
    
    print("1. SLOW typing:")
    slow_print("Hello! This is SLOW typing effect.")
    
    print("\n2. MEDIUM typing:")
    medium_print("Hello! This is MEDIUM typing effect.")
    
    print("\n3. FAST typing:")
    fast_print("Hello! This is FAST typing effect.")
    
    print("\n4. NORMAL (no effect):")
    print("Hello! This is NORMAL without any effect.")
    
    print("\n=== END TEST ===")

if __name__ == "__main__":
    demo()