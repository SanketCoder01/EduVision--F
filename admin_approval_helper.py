#!/usr/bin/env python3
"""
Admin Approval Helper Script
This script helps test admin approval and fix pending approval issues
"""

import requests
import json
import time
import os

class AdminApprovalHelper:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def check_pending_registrations(self):
        """Check all pending registrations"""
        print("📋 Checking all pending registrations...")
        try:
            response = self.session.get(f"{self.base_url}/api/admin/pending-registrations")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    registrations = data.get('registrations', [])
                    print(f"   ✅ Found {len(registrations)} registrations")
                    
                    for reg in registrations:
                        print(f"   📧 {reg['email']} - {reg['status']} - {reg['user_type']}")
                        if reg['status'] == 'pending_approval':
                            print(f"      ⏳ Pending approval")
                        elif reg['status'] == 'approved':
                            print(f"      ✅ Approved")
                        elif reg['status'] == 'rejected':
                            print(f"      ❌ Rejected: {reg.get('rejection_reason', 'No reason')}")
                    
                    return registrations
                else:
                    print(f"   ❌ Failed to get registrations: {data.get('message')}")
                    return []
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                return []
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return []
    
    def approve_registration(self, registration_id: str):
        """Approve a registration"""
        print(f"✅ Approving registration: {registration_id}")
        try:
            payload = {
                "registrationId": registration_id,
                "action": "approve"
            }
            
            response = self.session.post(f"{self.base_url}/api/admin/approve-registration", json=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Approval successful!")
                    if data.get('credentials'):
                        creds = data['credentials']
                        print(f"   📧 Email: {creds['email']}")
                        print(f"   🔑 Password: {creds['password']}")
                        if 'prn' in creds:
                            print(f"   🆔 PRN: {creds['prn']}")
                        if 'employee_id' in creds:
                            print(f"   🆔 Employee ID: {creds['employee_id']}")
                    return True
                else:
                    print(f"   ❌ Approval failed: {data.get('message')}")
                    return False
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def reject_registration(self, registration_id: str, reason: str = "Test rejection"):
        """Reject a registration"""
        print(f"❌ Rejecting registration: {registration_id}")
        try:
            payload = {
                "registrationId": registration_id,
                "action": "reject",
                "rejectionReason": reason
            }
            
            response = self.session.post(f"{self.base_url}/api/admin/approve-registration", json=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Rejection successful!")
                    return True
                else:
                    print(f"   ❌ Rejection failed: {data.get('message')}")
                    return False
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def test_user_approval_flow(self, email: str):
        """Test the complete user approval flow"""
        print(f"\n🧪 Testing approval flow for: {email}")
        print("=" * 50)
        
        # Step 1: Check current status
        print("1. Checking current status...")
        try:
            response = self.session.get(f"{self.base_url}/api/check-pending-registration?email={email}")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    status = data['data']['status']
                    print(f"   📊 Current status: {status}")
                    
                    if status == 'pending_approval':
                        print("   ⏳ Ready for approval")
                        return data['data']['id']
                    elif status == 'approved':
                        print("   ✅ Already approved")
                        return None
                    elif status == 'rejected':
                        print("   ❌ Already rejected")
                        return None
                else:
                    print("   📝 No pending registration found")
                    return None
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return None
    
    def simulate_admin_workflow(self):
        """Simulate complete admin workflow"""
        print("👨‍💼 Admin Approval Workflow")
        print("=" * 40)
        
        # Step 1: Check all pending registrations
        registrations = self.check_pending_registrations()
        
        if not registrations:
            print("   📝 No registrations found")
            return
        
        # Step 2: Find pending approvals
        pending = [reg for reg in registrations if reg['status'] == 'pending_approval']
        
        if not pending:
            print("   ✅ No pending approvals found")
            return
        
        print(f"\n⏳ Found {len(pending)} pending approvals:")
        for i, reg in enumerate(pending, 1):
            print(f"   {i}. {reg['email']} ({reg['user_type']})")
        
        # Step 3: Ask which one to approve
        try:
            choice = input(f"\n🤔 Which registration to approve? (1-{len(pending)}) or 'all': ")
            
            if choice.lower() == 'all':
                # Approve all pending
                for reg in pending:
                    print(f"\n--- Approving {reg['email']} ---")
                    self.approve_registration(reg['id'])
                    time.sleep(1)
            else:
                # Approve specific one
                idx = int(choice) - 1
                if 0 <= idx < len(pending):
                    reg = pending[idx]
                    print(f"\n--- Approving {reg['email']} ---")
                    self.approve_registration(reg['id'])
                else:
                    print("❌ Invalid choice")
        except (ValueError, KeyboardInterrupt):
            print("❌ Invalid input or cancelled")
    
    def quick_approve_by_email(self, email: str):
        """Quickly approve a registration by email"""
        print(f"⚡ Quick approval for: {email}")
        
        # Find registration by email
        registrations = self.check_pending_registrations()
        target_reg = None
        
        for reg in registrations:
            if reg['email'] == email:
                target_reg = reg
                break
        
        if not target_reg:
            print(f"   ❌ No registration found for {email}")
            return False
        
        if target_reg['status'] != 'pending_approval':
            print(f"   ⚠️ Registration status is {target_reg['status']}, not pending")
            return False
        
        # Approve it
        return self.approve_registration(target_reg['id'])

def main():
    """Main function"""
    print("🎯 Admin Approval Helper")
    print("=" * 30)
    
    helper = AdminApprovalHelper()
    
    while True:
        print("\n📋 Available Actions:")
        print("1. Check all pending registrations")
        print("2. Simulate admin workflow")
        print("3. Quick approve by email")
        print("4. Test user approval flow")
        print("5. Exit")
        
        try:
            choice = input("\n🤔 Choose an option (1-5): ")
            
            if choice == "1":
                helper.check_pending_registrations()
                
            elif choice == "2":
                helper.simulate_admin_workflow()
                
            elif choice == "3":
                email = input("📧 Enter email to approve: ")
                helper.quick_approve_by_email(email)
                
            elif choice == "4":
                email = input("📧 Enter email to test: ")
                helper.test_user_approval_flow(email)
                
            elif choice == "5":
                print("👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid choice. Please try again.")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
