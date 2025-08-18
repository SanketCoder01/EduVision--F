#!/usr/bin/env python3
"""
Setup Script for Registration Flow
This script helps set up and test the complete registration flow
"""

import requests
import json
import time
import os

def check_server_status(base_url: str = "http://localhost:3000"):
    """Check if the server is running"""
    try:
        response = requests.get(f"{base_url}/api/check-pending-registration?email=test@example.com", timeout=5)
        return True
    except:
        return False

def setup_test_environment():
    """Setup test environment"""
    print("🔧 Setting up Registration Flow Test Environment")
    print("=" * 50)
    
    # Check server status
    print("1. Checking server status...")
    if check_server_status():
        print("   ✅ Server is running")
    else:
        print("   ❌ Server is not running")
        print("   → Please start your Next.js development server:")
        print("   → npm run dev")
        return False
    
    print("\n2. Testing API endpoints...")
    
    # Test check-pending-registration endpoint
    try:
        response = requests.get("http://localhost:3000/api/check-pending-registration?email=test@example.com")
        if response.status_code == 200:
            print("   ✅ check-pending-registration endpoint working")
        else:
            print(f"   ❌ check-pending-registration endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ check-pending-registration endpoint error: {e}")
    
    # Test simulate-admin-action endpoint
    try:
        response = requests.post("http://localhost:3000/api/simulate-admin-action", 
                               json={"email": "test@example.com", "action": "approve"})
        if response.status_code in [200, 404]:  # 404 is expected for non-existent user
            print("   ✅ simulate-admin-action endpoint working")
        else:
            print(f"   ❌ simulate-admin-action endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ simulate-admin-action endpoint error: {e}")
    
    print("\n3. Environment setup complete!")
    return True

def run_quick_test():
    """Run a quick test of the registration flow"""
    print("\n🧪 Running Quick Registration Flow Test")
    print("=" * 40)
    
    # Test with a new email
    test_email = "teststudent@sanjivani.edu.in"
    
    print(f"Testing with email: {test_email}")
    
    # Check if pending registration exists
    try:
        response = requests.get(f"http://localhost:3000/api/check-pending-registration?email={test_email}")
        if response.status_code == 200:
            data = response.json()
            if data.get('data'):
                print(f"   ⚠️ Found existing registration: {data['data']['status']}")
            else:
                print("   ✅ No existing registration - ready for new user flow")
        else:
            print(f"   ❌ API check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API check error: {e}")

def main():
    """Main setup function"""
    print("🎯 Registration Flow Setup & Test")
    print("=" * 40)
    
    while True:
        print("\n📋 Setup Options:")
        print("1. Setup test environment")
        print("2. Run quick test")
        print("3. Start comprehensive testing")
        print("4. Exit")
        
        choice = input("\n🤔 Choose an option (1-4): ")
        
        if choice == "1":
            if setup_test_environment():
                print("\n✅ Environment setup successful!")
            else:
                print("\n❌ Environment setup failed!")
                
        elif choice == "2":
            run_quick_test()
            
        elif choice == "3":
            print("\n🚀 Starting comprehensive testing...")
            os.system("python test_registration_flow.py")
            
        elif choice == "4":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
