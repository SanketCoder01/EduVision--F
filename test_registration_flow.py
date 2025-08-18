#!/usr/bin/env python3
"""
Registration Flow Test Script
This script helps test the complete registration flow
"""

import requests
import json
import time
from typing import Dict, Any

class RegistrationFlowTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_registration_flow(self, email: str, user_type: str = "student"):
        """Test the complete registration flow"""
        print(f"🧪 Testing registration flow for {email} ({user_type})")
        print("=" * 50)
        
        # Step 1: Check if user exists in pending registrations
        print("1. Checking pending registrations...")
        pending_status = self.check_pending_registration(email)
        
        if pending_status:
            print(f"   ✅ Found pending registration: {pending_status['status']}")
            
            if pending_status['status'] == 'approved':
                print("   🎉 User is already approved!")
                return "approved"
            elif pending_status['status'] == 'rejected':
                print(f"   ❌ User is rejected: {pending_status.get('rejection_reason', 'No reason provided')}")
                return "rejected"
            elif pending_status['status'] == 'pending_approval':
                print("   ⏳ User is pending approval")
                return "pending"
        else:
            print("   📝 No pending registration found - user needs to register")
            return "new_user"
    
    def check_pending_registration(self, email: str) -> Dict[str, Any]:
        """Check if user has a pending registration"""
        try:
            response = self.session.get(f"{self.base_url}/api/check-pending-registration?email={email}")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    return data['data']
                return None
            return None
        except Exception as e:
            print(f"   ⚠️ Error checking pending registration: {e}")
            return None
    
    def simulate_admin_approval(self, email: str, action: str = "approve", reason: str = None):
        """Simulate admin approval/rejection"""
        print(f"2. Simulating admin {action} for {email}...")
        
        try:
            payload = {
                "email": email,
                "action": action,
                "rejection_reason": reason
            }
            
            response = self.session.post(f"{self.base_url}/api/simulate-admin-action", json=payload)
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   ✅ Admin {action} successful: {result.get('message', '')}")
                    return True
                else:
                    print(f"   ❌ Admin {action} failed: {result.get('message', '')}")
                    return False
            else:
                print(f"   ❌ Admin {action} failed: {response.text}")
                return False
        except Exception as e:
            print(f"   ⚠️ Error simulating admin action: {e}")
            return False
    
    def test_user_flow(self, email: str, user_type: str = "student"):
        """Test the complete user flow"""
        print(f"\n🚀 Testing complete user flow for {email}")
        print("=" * 60)
        
        # Step 1: Check current status
        status = self.test_registration_flow(email, user_type)
        
        if status == "new_user":
            print("\n📝 User needs to complete registration process")
            print("   → User should be redirected to registration page")
            print("   → After registration, user should see pending approval page")
            print("   → Complete flow: Fill info → Face capture → Pending approval")
            
        elif status == "pending":
            print("\n⏳ User is pending approval")
            print("   → User should see pending approval page")
            print("   → Admin can approve/reject from admin panel")
            
            # Simulate admin approval
            if input("\n🤔 Simulate admin approval? (y/n): ").lower() == 'y':
                self.simulate_admin_approval(email, "approve")
                print("   → User should now see approval success page")
                print("   → Dashboard button should be enabled")
                
        elif status == "approved":
            print("\n🎉 User is already approved")
            print("   → User should be redirected to dashboard")
            
        elif status == "rejected":
            print("\n❌ User is rejected")
            print("   → User should see rejection message")
            print("   → User can try registering again")
    
    def run_comprehensive_test(self):
        """Run comprehensive test scenarios"""
        print("🧪 Running comprehensive registration flow tests")
        print("=" * 60)
        
        test_cases = [
            {"email": "newstudent@sanjivani.edu.in", "type": "student"},
            {"email": "newfaculty@sanjivani.ac.in", "type": "faculty"},
            {"email": "pendingstudent@sanjivani.edu.in", "type": "student"},
            {"email": "approvedstudent@sanjivani.edu.in", "type": "student"},
            {"email": "rejectedstudent@sanjivani.edu.in", "type": "student"},
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📋 Test Case {i}: {test_case['email']}")
            print("-" * 40)
            self.test_user_flow(test_case['email'], test_case['type'])
            time.sleep(1)
    
    def clear_pending_registration(self, email: str):
        """Clear pending registration for testing"""
        print(f"🗑️ Clearing pending registration for {email}...")
        try:
            # This would need to be implemented as an API endpoint
            # For now, we'll just inform the user
            print("   ⚠️ Manual database cleanup required")
            print("   → Delete from pending_registrations table")
            print("   → Delete from students/faculty tables if exists")
            return True
        except Exception as e:
            print(f"   ❌ Error clearing registration: {e}")
            return False

def main():
    """Main function to run tests"""
    print("🎯 Registration Flow Test Suite")
    print("=" * 40)
    
    tester = RegistrationFlowTester()
    
    while True:
        print("\n📋 Available Tests:")
        print("1. Test specific user flow")
        print("2. Run comprehensive tests")
        print("3. Clear pending registration")
        print("4. Exit")
        
        choice = input("\n🤔 Choose an option (1-4): ")
        
        if choice == "1":
            email = input("📧 Enter email to test: ")
            user_type = input("👤 Enter user type (student/faculty): ").lower()
            if user_type not in ["student", "faculty"]:
                user_type = "student"
            tester.test_user_flow(email, user_type)
            
        elif choice == "2":
            tester.run_comprehensive_test()
            
        elif choice == "3":
            email = input("📧 Enter email to clear: ")
            tester.clear_pending_registration(email)
            
        elif choice == "4":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
