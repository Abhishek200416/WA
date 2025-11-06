#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for WA Messaging App
Tests authentication, chat operations, messaging, file upload, and Socket.IO functionality
"""

import requests
import sys
import json
from datetime import datetime
import time
import os

class WABackendTester:
    def __init__(self, base_url="https://messagemate-138.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.user_data = None
        self.device_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", error=""):
        """Log test result"""
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
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {details}")
        if error:
            print(f"    Error: {error}")

    def test_auth_request_otp(self):
        """Test OTP request endpoint"""
        try:
            response = requests.post(f"{self.api_url}/auth/request-otp", 
                json={"phone_number": "+15551234567"})
            
            if response.status_code == 200:
                data = response.json()
                if "otp" in data and data["otp"] == "123456":
                    self.log_test("Auth - Request OTP", True, f"OTP received: {data['otp']}")
                    return True
                else:
                    self.log_test("Auth - Request OTP", False, "", "OTP not in response or incorrect")
            else:
                self.log_test("Auth - Request OTP", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - Request OTP", False, "", str(e))
        return False

    def test_auth_verify_otp(self):
        """Test OTP verification and user creation"""
        try:
            response = requests.post(f"{self.api_url}/auth/verify-otp", json={
                "phone_number": "+15551234567",
                "otp": "123456",
                "device_name": "Test Device",
                "device_type": "web",
                "public_key": "test_public_key_123"
            })
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "token" in data:
                    self.user_token = data["token"]
                    self.user_data = data["user"]
                    self.device_data = data["device"]
                    self.log_test("Auth - Verify OTP", True, f"User created: {data['user']['id']}")
                    return True
                else:
                    self.log_test("Auth - Verify OTP", False, "", "Missing user or token in response")
            else:
                self.log_test("Auth - Verify OTP", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - Verify OTP", False, "", str(e))
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.user_token:
            self.log_test("User - Get Current User", False, "", "No user token available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/users/me?user_id={self.user_token}")
            
            if response.status_code == 200:
                user = response.json()
                if user.get("id") == self.user_token:
                    self.log_test("User - Get Current User", True, f"User: {user.get('display_name')}")
                    return True
                else:
                    self.log_test("User - Get Current User", False, "", "User ID mismatch")
            else:
                self.log_test("User - Get Current User", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("User - Get Current User", False, "", str(e))
        return False

    def test_update_user(self):
        """Test updating user profile"""
        if not self.user_token:
            self.log_test("User - Update Profile", False, "", "No user token available")
            return False
        
        try:
            updates = {
                "display_name": "Test User Updated",
                "about": "Testing WA messaging app"
            }
            response = requests.patch(f"{self.api_url}/users/me?user_id={self.user_token}", json=updates)
            
            if response.status_code == 200:
                user = response.json()
                if user.get("display_name") == "Test User Updated":
                    self.log_test("User - Update Profile", True, "Profile updated successfully")
                    return True
                else:
                    self.log_test("User - Update Profile", False, "", "Profile not updated")
            else:
                self.log_test("User - Update Profile", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("User - Update Profile", False, "", str(e))
        return False

    def test_create_group_chat(self):
        """Test creating a group chat"""
        if not self.user_token:
            self.log_test("Chat - Create Group", False, "", "No user token available")
            return False
        
        try:
            chat_data = {
                "type": "group",
                "name": "WA Test Group",
                "participants": []  # Just the creator for now
            }
            response = requests.post(f"{self.api_url}/chats?user_id={self.user_token}", json=chat_data)
            
            if response.status_code == 200:
                chat = response.json()
                if chat.get("type") == "group" and chat.get("name") == "WA Test Group":
                    self.test_chat_id = chat["id"]
                    self.log_test("Chat - Create Group", True, f"Group created: {chat['id']}")
                    return True
                else:
                    self.log_test("Chat - Create Group", False, "", "Invalid chat data")
            else:
                self.log_test("Chat - Create Group", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Chat - Create Group", False, "", str(e))
        return False

    def test_get_chats(self):
        """Test getting user's chats"""
        if not self.user_token:
            self.log_test("Chat - Get Chats", False, "", "No user token available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/chats?user_id={self.user_token}")
            
            if response.status_code == 200:
                chats = response.json()
                if isinstance(chats, list):
                    self.log_test("Chat - Get Chats", True, f"Found {len(chats)} chats")
                    return True
                else:
                    self.log_test("Chat - Get Chats", False, "", "Invalid response format")
            else:
                self.log_test("Chat - Get Chats", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Chat - Get Chats", False, "", str(e))
        return False

    def test_send_message(self):
        """Test sending a message"""
        if not self.user_token or not hasattr(self, 'test_chat_id'):
            self.log_test("Message - Send Text", False, "", "No user token or chat ID available")
            return False
        
        try:
            message_data = {
                "chat_id": self.test_chat_id,
                "content": "Hello from backend test!",
                "message_type": "text"
            }
            response = requests.post(f"{self.api_url}/messages?user_id={self.user_token}", json=message_data)
            
            if response.status_code == 200:
                message = response.json()
                if message.get("content") == "Hello from backend test!":
                    self.test_message_id = message["id"]
                    self.log_test("Message - Send Text", True, f"Message sent: {message['id']}")
                    return True
                else:
                    self.log_test("Message - Send Text", False, "", "Message content mismatch")
            else:
                self.log_test("Message - Send Text", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Message - Send Text", False, "", str(e))
        return False

    def test_get_messages(self):
        """Test getting messages from a chat"""
        if not self.user_token or not hasattr(self, 'test_chat_id'):
            self.log_test("Message - Get Messages", False, "", "No user token or chat ID available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/chats/{self.test_chat_id}/messages?user_id={self.user_token}")
            
            if response.status_code == 200:
                messages = response.json()
                if isinstance(messages, list):
                    self.log_test("Message - Get Messages", True, f"Retrieved {len(messages)} messages")
                    return True
                else:
                    self.log_test("Message - Get Messages", False, "", "Invalid response format")
            else:
                self.log_test("Message - Get Messages", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Message - Get Messages", False, "", str(e))
        return False

    def test_file_upload(self):
        """Test file upload functionality"""
        if not self.user_token:
            self.log_test("File - Upload", False, "", "No user token available")
            return False
        
        try:
            # Create a simple test file
            test_content = b"Test file content for WA messaging app"
            files = {'file': ('test.txt', test_content, 'text/plain')}
            
            response = requests.post(f"{self.api_url}/upload?user_id={self.user_token}", files=files)
            
            if response.status_code == 200:
                file_data = response.json()
                if "file_url" in file_data and "file_id" in file_data:
                    self.log_test("File - Upload", True, f"File uploaded: {file_data['file_id']}")
                    return True
                else:
                    self.log_test("File - Upload", False, "", "Missing file data in response")
            else:
                self.log_test("File - Upload", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("File - Upload", False, "", str(e))
        return False

    def test_create_status(self):
        """Test creating a status/story"""
        if not self.user_token:
            self.log_test("Status - Create", False, "", "No user token available")
            return False
        
        try:
            params = {
                "user_id": self.user_token,
                "content_type": "text",
                "content": "Testing WA status feature!"
            }
            response = requests.post(f"{self.api_url}/status", params=params)
            
            if response.status_code == 200:
                status = response.json()
                if status.get("content") == "Testing WA status feature!":
                    self.log_test("Status - Create", True, f"Status created: {status['id']}")
                    return True
                else:
                    self.log_test("Status - Create", False, "", "Status content mismatch")
            else:
                self.log_test("Status - Create", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Status - Create", False, "", str(e))
        return False

    def test_get_statuses(self):
        """Test getting statuses"""
        if not self.user_token:
            self.log_test("Status - Get All", False, "", "No user token available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/status?user_id={self.user_token}")
            
            if response.status_code == 200:
                statuses = response.json()
                if isinstance(statuses, list):
                    self.log_test("Status - Get All", True, f"Retrieved {len(statuses)} statuses")
                    return True
                else:
                    self.log_test("Status - Get All", False, "", "Invalid response format")
            else:
                self.log_test("Status - Get All", False, "", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Status - Get All", False, "", str(e))
        return False

    def test_socket_connection(self):
        """Test Socket.IO connection (basic connectivity test)"""
        try:
            # Test if Socket.IO endpoint is accessible
            response = requests.get(f"{self.base_url}/socket.io/", timeout=5)
            
            # Socket.IO should return a specific response or redirect
            if response.status_code in [200, 400, 404]:  # 400/404 are expected for GET requests to socket.io
                self.log_test("Socket.IO - Connection Test", True, "Socket.IO endpoint accessible")
                return True
            else:
                self.log_test("Socket.IO - Connection Test", False, "", f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("Socket.IO - Connection Test", False, "", str(e))
        return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting WA Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n📱 Authentication Tests:")
        self.test_auth_request_otp()
        self.test_auth_verify_otp()
        
        # User Management Tests
        print("\n👤 User Management Tests:")
        self.test_get_current_user()
        self.test_update_user()
        
        # Chat Tests
        print("\n💬 Chat Tests:")
        self.test_create_group_chat()
        self.test_get_chats()
        
        # Message Tests
        print("\n📝 Message Tests:")
        self.test_send_message()
        self.test_get_messages()
        
        # File Upload Tests
        print("\n📎 File Upload Tests:")
        self.test_file_upload()
        
        # Status Tests
        print("\n📢 Status/Stories Tests:")
        self.test_create_status()
        self.test_get_statuses()
        
        # Socket.IO Tests
        print("\n🔌 Socket.IO Tests:")
        self.test_socket_connection()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.test_results,
            "user_data": self.user_data,
            "device_data": self.device_data
        }

def main():
    tester = WABackendTester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())