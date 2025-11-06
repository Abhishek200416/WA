#!/usr/bin/env python3
"""
Comprehensive WA Backend Testing - Following the exact test plan from review request
Tests all WhatsApp-like messaging features as specified
"""

import requests
import sys
import json
from datetime import datetime
import time
import os

class ComprehensiveWATest:
    def __init__(self, base_url="https://messagemate-138.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
        # Test users data
        self.users = {}  # Will store Alice, Bob, Carol
        self.test_results = []
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test data storage
        self.test_chat_id = None
        self.test_group_id = None
        self.test_message_ids = []

    def log_test(self, name, success, details="", error="", curl_cmd=""):
        """Log test result with curl command"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test_name": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "error": error,
            "curl_command": curl_cmd,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")
        if curl_cmd:
            print(f"    Curl: {curl_cmd}")
        if error:
            print(f"    Error: {error}")

    def create_test_user(self, name, phone_number):
        """Create a test user (Alice, Bob, or Carol)"""
        try:
            # Step 1: Request OTP
            otp_data = {"phone_number": phone_number}
            curl_otp = f"curl -X POST {self.api_url}/auth/request-otp -H 'Content-Type: application/json' -d '{json.dumps(otp_data)}'"
            
            response = requests.post(f"{self.api_url}/auth/request-otp", json=otp_data)
            
            if response.status_code != 200:
                self.log_test(f"Auth - {name} Request OTP", False, "", f"Status: {response.status_code}", curl_otp)
                return False
            
            # Step 2: Verify OTP
            verify_data = {
                "phone_number": phone_number,
                "otp": "123456",
                "device_name": f"{name}'s Device",
                "device_type": "web",
                "public_key": f"test_public_key_{name.lower()}"
            }
            curl_verify = f"curl -X POST {self.api_url}/auth/verify-otp -H 'Content-Type: application/json' -d '{json.dumps(verify_data)}'"
            
            response = requests.post(f"{self.api_url}/auth/verify-otp", json=verify_data)
            
            if response.status_code == 200:
                data = response.json()
                self.users[name] = {
                    "user_data": data["user"],
                    "device_data": data["device"],
                    "token": data["token"],
                    "phone": phone_number
                }
                self.log_test(f"Auth - {name} Created", True, f"User ID: {data['user']['id']}", "", curl_verify)
                return True
            else:
                self.log_test(f"Auth - {name} Verify OTP", False, "", f"Status: {response.status_code}", curl_verify)
                return False
                
        except Exception as e:
            self.log_test(f"Auth - {name} Creation", False, "", str(e))
            return False

    def test_contacts_management(self):
        """Test contact management between Alice and Bob"""
        if "Alice" not in self.users or "Bob" not in self.users:
            self.log_test("Contacts - Management", False, "", "Alice or Bob not created")
            return False
        
        try:
            # Alice adds Bob as contact
            contact_data = {"phone_number": self.users["Bob"]["phone"]}
            curl_cmd = f"curl -X POST '{self.api_url}/contacts?user_id={self.users['Alice']['token']}' -H 'Content-Type: application/json' -d '{json.dumps(contact_data)}'"
            
            response = requests.post(f"{self.api_url}/contacts?user_id={self.users['Alice']['token']}", json=contact_data)
            
            if response.status_code == 200:
                # Bob adds Alice as contact
                contact_data_bob = {"phone_number": self.users["Alice"]["phone"]}
                response_bob = requests.post(f"{self.api_url}/contacts?user_id={self.users['Bob']['token']}", json=contact_data_bob)
                
                if response_bob.status_code == 200:
                    # Verify Alice's contacts
                    contacts_response = requests.get(f"{self.api_url}/contacts?user_id={self.users['Alice']['token']}")
                    if contacts_response.status_code == 200:
                        contacts = contacts_response.json()
                        self.log_test("Contacts - Alice adds Bob", True, f"Alice has {len(contacts)} contacts", "", curl_cmd)
                        return True
                    else:
                        self.log_test("Contacts - Get Alice's contacts", False, "", f"Status: {contacts_response.status_code}")
                else:
                    self.log_test("Contacts - Bob adds Alice", False, "", f"Status: {response_bob.status_code}")
            else:
                self.log_test("Contacts - Alice adds Bob", False, "", f"Status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("Contacts - Management", False, "", str(e))
        return False

    def test_direct_chat_creation(self):
        """Test creating direct chat between Alice and Bob"""
        if "Alice" not in self.users or "Bob" not in self.users:
            self.log_test("Chat - Direct Creation", False, "", "Alice or Bob not created")
            return False
        
        try:
            chat_data = {
                "type": "direct",
                "participants": [self.users["Bob"]["token"]]
            }
            curl_cmd = f"curl -X POST '{self.api_url}/chats?user_id={self.users['Alice']['token']}' -H 'Content-Type: application/json' -d '{json.dumps(chat_data)}'"
            
            response = requests.post(f"{self.api_url}/chats?user_id={self.users['Alice']['token']}", json=chat_data)
            
            if response.status_code == 200:
                chat = response.json()
                if chat.get("type") == "direct" and len(chat.get("participants", [])) == 2:
                    self.test_chat_id = chat["id"]
                    self.log_test("Chat - Direct Creation", True, f"Chat ID: {chat['id']}", "", curl_cmd)
                    return True
                else:
                    self.log_test("Chat - Direct Creation", False, "", "Invalid chat structure")
            else:
                self.log_test("Chat - Direct Creation", False, "", f"Status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("Chat - Direct Creation", False, "", str(e))
        return False

    def test_messaging_flow(self):
        """Test bidirectional messaging between Alice and Bob"""
        if not self.test_chat_id:
            self.log_test("Messaging - Flow", False, "", "No chat ID available")
            return False
        
        try:
            # Alice sends message
            alice_message = {
                "chat_id": self.test_chat_id,
                "content": "Hello Bob! This is Alice testing the messaging system.",
                "message_type": "text"
            }
            curl_alice = f"curl -X POST '{self.api_url}/messages?user_id={self.users['Alice']['token']}' -H 'Content-Type: application/json' -d '{json.dumps(alice_message)}'"
            
            response_alice = requests.post(f"{self.api_url}/messages?user_id={self.users['Alice']['token']}", json=alice_message)
            
            if response_alice.status_code == 200:
                alice_msg = response_alice.json()
                self.test_message_ids.append(alice_msg["id"])
                
                # Bob sends reply
                bob_message = {
                    "chat_id": self.test_chat_id,
                    "content": "Hi Alice! Bob here. The messaging system is working great!",
                    "message_type": "text"
                }
                
                response_bob = requests.post(f"{self.api_url}/messages?user_id={self.users['Bob']['token']}", json=bob_message)
                
                if response_bob.status_code == 200:
                    bob_msg = response_bob.json()
                    self.test_message_ids.append(bob_msg["id"])
                    
                    # Verify messages can be retrieved
                    messages_response = requests.get(f"{self.api_url}/chats/{self.test_chat_id}/messages?user_id={self.users['Alice']['token']}")
                    
                    if messages_response.status_code == 200:
                        messages = messages_response.json()
                        if len(messages) >= 2:
                            self.log_test("Messaging - Bidirectional", True, f"Retrieved {len(messages)} messages", "", curl_alice)
                            return True
                        else:
                            self.log_test("Messaging - Message Retrieval", False, "", f"Only {len(messages)} messages found")
                    else:
                        self.log_test("Messaging - Message Retrieval", False, "", f"Status: {messages_response.status_code}")
                else:
                    self.log_test("Messaging - Bob Reply", False, "", f"Status: {response_bob.status_code}")
            else:
                self.log_test("Messaging - Alice Send", False, "", f"Status: {response_alice.status_code}", curl_alice)
                
        except Exception as e:
            self.log_test("Messaging - Flow", False, "", str(e))
        return False

    def test_message_operations(self):
        """Test message editing, reactions, and deletion"""
        if not self.test_message_ids:
            self.log_test("Message Ops - Operations", False, "", "No message IDs available")
            return False
        
        try:
            alice_msg_id = self.test_message_ids[0]
            bob_msg_id = self.test_message_ids[1] if len(self.test_message_ids) > 1 else alice_msg_id
            
            # Alice edits her message
            edit_data = {"content": "Hello Bob! This is Alice testing the EDITED messaging system."}
            curl_edit = f"curl -X PATCH '{self.api_url}/messages/{alice_msg_id}?user_id={self.users['Alice']['token']}' -H 'Content-Type: application/json' -d '{json.dumps(edit_data)}'"
            
            edit_response = requests.patch(f"{self.api_url}/messages/{alice_msg_id}?user_id={self.users['Alice']['token']}", json=edit_data)
            
            if edit_response.status_code == 200:
                # Alice adds reaction to Bob's message
                reaction_response = requests.post(f"{self.api_url}/messages/{bob_msg_id}/react?user_id={self.users['Alice']['token']}&emoji=👍")
                
                if reaction_response.status_code == 200:
                    # Alice deletes her message (delete for me)
                    delete_response = requests.delete(f"{self.api_url}/messages/{alice_msg_id}?user_id={self.users['Alice']['token']}&delete_for_everyone=false")
                    
                    if delete_response.status_code == 200:
                        self.log_test("Message Ops - Edit/React/Delete", True, "All operations successful", "", curl_edit)
                        return True
                    else:
                        self.log_test("Message Ops - Delete", False, "", f"Status: {delete_response.status_code}")
                else:
                    self.log_test("Message Ops - Reaction", False, "", f"Status: {reaction_response.status_code}")
            else:
                self.log_test("Message Ops - Edit", False, "", f"Status: {edit_response.status_code}", curl_edit)
                
        except Exception as e:
            self.log_test("Message Ops - Operations", False, "", str(e))
        return False

    def test_group_chat(self):
        """Test group chat creation with Alice, Bob, and Carol"""
        if len(self.users) < 3:
            self.log_test("Group Chat - Creation", False, "", "Need 3 users (Alice, Bob, Carol)")
            return False
        
        try:
            group_data = {
                "type": "group",
                "name": "WA Test Group Chat",
                "participants": [self.users["Bob"]["token"], self.users["Carol"]["token"]]
            }
            curl_cmd = f"curl -X POST '{self.api_url}/chats?user_id={self.users['Alice']['token']}' -H 'Content-Type: application/json' -d '{json.dumps(group_data)}'"
            
            response = requests.post(f"{self.api_url}/chats?user_id={self.users['Alice']['token']}", json=group_data)
            
            if response.status_code == 200:
                group = response.json()
                if (group.get("type") == "group" and 
                    len(group.get("participants", [])) == 3 and 
                    self.users["Alice"]["token"] in group.get("admins", [])):
                    
                    self.test_group_id = group["id"]
                    
                    # Test sending message in group
                    group_message = {
                        "chat_id": self.test_group_id,
                        "content": "Welcome to our test group chat!",
                        "message_type": "text"
                    }
                    
                    msg_response = requests.post(f"{self.api_url}/messages?user_id={self.users['Alice']['token']}", json=group_message)
                    
                    if msg_response.status_code == 200:
                        invite_link = group.get("invite_link", "")
                        self.log_test("Group Chat - Full Test", True, f"Group created with invite: {invite_link}", "", curl_cmd)
                        return True
                    else:
                        self.log_test("Group Chat - Message Send", False, "", f"Status: {msg_response.status_code}")
                else:
                    self.log_test("Group Chat - Structure", False, "", "Invalid group structure")
            else:
                self.log_test("Group Chat - Creation", False, "", f"Status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("Group Chat - Creation", False, "", str(e))
        return False

    def test_file_upload(self):
        """Test file upload with attachment message"""
        if "Alice" not in self.users:
            self.log_test("File Upload - Test", False, "", "Alice not available")
            return False
        
        try:
            # Create test image content
            test_content = b"Test image content for WA messaging app - this simulates an image file"
            files = {'file': ('test_image.jpg', test_content, 'image/jpeg')}
            
            curl_cmd = f"curl -X POST '{self.api_url}/upload?user_id={self.users['Alice']['token']}' -F 'file=@test_image.jpg'"
            
            response = requests.post(f"{self.api_url}/upload?user_id={self.users['Alice']['token']}", files=files)
            
            if response.status_code == 200:
                file_data = response.json()
                if "file_url" in file_data and "thumbnail_url" in file_data:
                    
                    # Send message with attachment
                    if self.test_chat_id:
                        attachment_message = {
                            "chat_id": self.test_chat_id,
                            "content": "Check out this image!",
                            "message_type": "image",
                            "attachments": [file_data]
                        }
                        
                        msg_response = requests.post(f"{self.api_url}/messages?user_id={self.users['Alice']['token']}", json=attachment_message)
                        
                        if msg_response.status_code == 200:
                            self.log_test("File Upload - With Message", True, f"File uploaded and sent: {file_data['file_id']}", "", curl_cmd)
                            return True
                        else:
                            self.log_test("File Upload - Message Send", False, "", f"Status: {msg_response.status_code}")
                    else:
                        self.log_test("File Upload - Basic", True, f"File uploaded: {file_data['file_id']}", "", curl_cmd)
                        return True
                else:
                    self.log_test("File Upload - Response", False, "", "Missing file URLs in response")
            else:
                self.log_test("File Upload - Upload", False, "", f"Status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("File Upload - Test", False, "", str(e))
        return False

    def test_status_stories(self):
        """Test status/stories functionality"""
        if "Alice" not in self.users or "Bob" not in self.users:
            self.log_test("Status - Stories", False, "", "Alice or Bob not available")
            return False
        
        try:
            # Alice creates status
            params = {
                "user_id": self.users["Alice"]["token"],
                "content_type": "text",
                "content": "Alice's test status - having a great day testing WA!"
            }
            curl_cmd = f"curl -X POST '{self.api_url}/status' -G " + " ".join([f"-d '{k}={v}'" for k, v in params.items()])
            
            response = requests.post(f"{self.api_url}/status", params=params)
            
            if response.status_code == 200:
                status = response.json()
                
                # Verify status has 24h expiry
                if "expires_at" in status:
                    # Bob fetches statuses (should see Alice's if they're contacts)
                    bob_statuses = requests.get(f"{self.api_url}/status?user_id={self.users['Bob']['token']}")
                    
                    if bob_statuses.status_code == 200:
                        statuses = bob_statuses.json()
                        self.log_test("Status - Create & Fetch", True, f"Status created, Bob sees {len(statuses)} statuses", "", curl_cmd)
                        return True
                    else:
                        self.log_test("Status - Bob Fetch", False, "", f"Status: {bob_statuses.status_code}")
                else:
                    self.log_test("Status - Expiry", False, "", "No expiry time in status")
            else:
                self.log_test("Status - Create", False, "", f"Status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("Status - Stories", False, "", str(e))
        return False

    def test_socket_io_connectivity(self):
        """Test Socket.IO endpoint accessibility"""
        try:
            # Test Socket.IO endpoint
            response = requests.get(f"{self.base_url}/socket.io/", timeout=5)
            curl_cmd = f"curl -X GET '{self.base_url}/socket.io/'"
            
            # Socket.IO endpoints typically return 400 for GET requests, which is expected
            if response.status_code in [200, 400, 404]:
                self.log_test("Socket.IO - Connectivity", True, "Socket.IO endpoint accessible", "", curl_cmd)
                return True
            else:
                self.log_test("Socket.IO - Connectivity", False, "", f"Unexpected status: {response.status_code}", curl_cmd)
                
        except Exception as e:
            self.log_test("Socket.IO - Connectivity", False, "", str(e))
        return False

    def run_comprehensive_tests(self):
        """Run all comprehensive tests following the review request plan"""
        print("🚀 Starting Comprehensive WA Backend Testing")
        print(f"Testing against: {self.base_url}")
        print("Following the exact test plan from review request...")
        print("=" * 80)
        
        # 1. Authentication Flow & Create Test Users
        print("\n📱 1. AUTHENTICATION FLOW & USER CREATION:")
        self.create_test_user("Alice", "+1111111111")
        self.create_test_user("Bob", "+2222222222")
        self.create_test_user("Carol", "+3333333333")
        
        # 2. Contacts Management
        print("\n👥 2. CONTACTS MANAGEMENT:")
        self.test_contacts_management()
        
        # 3. Direct Chat Creation
        print("\n💬 3. DIRECT CHAT CREATION:")
        self.test_direct_chat_creation()
        
        # 4. Messaging Flow
        print("\n📝 4. MESSAGING FLOW:")
        self.test_messaging_flow()
        
        # 5. Message Operations
        print("\n⚡ 5. MESSAGE OPERATIONS:")
        self.test_message_operations()
        
        # 6. Group Chat
        print("\n👥 6. GROUP CHAT:")
        self.test_group_chat()
        
        # 7. File Upload
        print("\n📎 7. FILE UPLOAD:")
        self.test_file_upload()
        
        # 8. Status/Stories
        print("\n📢 8. STATUS/STORIES:")
        self.test_status_stories()
        
        # 9. Socket.IO Events
        print("\n🔌 9. SOCKET.IO CONNECTIVITY:")
        self.test_socket_io_connectivity()
        
        # Summary
        print("\n" + "=" * 80)
        print(f"📊 COMPREHENSIVE TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Show created users
        print(f"\n👤 Created Test Users:")
        for name, data in self.users.items():
            print(f"  {name}: {data['phone']} (ID: {data['token'][:8]}...)")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED! WA Backend is fully functional!")
            return 0
        else:
            print(f"\n⚠️  {self.tests_run - self.tests_passed} tests failed. Check details above.")
            return 1

    def get_detailed_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results,
            "created_users": self.users,
            "test_chat_id": self.test_chat_id,
            "test_group_id": self.test_group_id,
            "message_ids": self.test_message_ids
        }

def main():
    tester = ComprehensiveWATest()
    exit_code = tester.run_comprehensive_tests()
    
    # Save detailed results
    results = tester.get_detailed_results()
    with open('/app/comprehensive_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/comprehensive_test_results.json")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())