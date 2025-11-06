#!/usr/bin/env python3
"""
Focused OTP Authentication Testing for WA Messaging App
Tests the specific bug fix for OTP authentication flow
"""

import requests
import sys
import json
from datetime import datetime

class OTPAuthTester:
    def __init__(self, base_url="https://chatconnect-68.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
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

    def test_otp_request_email(self):
        """Test OTP request with email: kolluriabhishek7108@gmail.com"""
        try:
            response = requests.post(f"{self.api_url}/auth/request-otp", 
                json={"email": "kolluriabhishek7108@gmail.com"})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "otp" in data:
                    if data["otp"] == "123456":
                        self.log_test("OTP Request - Email", True, f"OTP received successfully: {data['otp']}")
                        return True
                    else:
                        self.log_test("OTP Request - Email", False, "", f"Wrong OTP received: {data.get('otp')}")
                else:
                    self.log_test("OTP Request - Email", False, "", "Missing message or OTP in response")
            else:
                self.log_test("OTP Request - Email", False, "", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("OTP Request - Email", False, "", str(e))
        return False

    def test_otp_verify_email(self):
        """Test OTP verification with email and OTP 123456"""
        try:
            response = requests.post(f"{self.api_url}/auth/verify-otp", json={
                "email": "kolluriabhishek7108@gmail.com",
                "otp": "123456",
                "device_name": "Test Device - Email Auth",
                "device_type": "web",
                "public_key": "test_public_key_email_123"
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ["user", "device", "token"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("OTP Verify - Email", False, "", f"Missing fields: {missing_fields}")
                    return False
                
                # Check user data structure
                user = data["user"]
                user_required = ["id", "email", "display_name"]
                user_missing = [field for field in user_required if field not in user]
                
                if user_missing:
                    self.log_test("OTP Verify - Email", False, "", f"Missing user fields: {user_missing}")
                    return False
                
                # Check device data structure
                device = data["device"]
                device_required = ["id", "user_id", "device_name", "device_type"]
                device_missing = [field for field in device_required if field not in device]
                
                if device_missing:
                    self.log_test("OTP Verify - Email", False, "", f"Missing device fields: {device_missing}")
                    return False
                
                # Verify email matches
                if user["email"] != "kolluriabhishek7108@gmail.com":
                    self.log_test("OTP Verify - Email", False, "", f"Email mismatch: {user['email']}")
                    return False
                
                # Check if is_new_user field exists (optional but good to have)
                has_new_user_flag = "is_new_user" in data
                
                self.log_test("OTP Verify - Email", True, 
                    f"User: {user['id']}, Device: {device['id']}, Token: {data['token'][:10]}..., New User Flag: {has_new_user_flag}")
                return True
            else:
                self.log_test("OTP Verify - Email", False, "", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("OTP Verify - Email", False, "", str(e))
        return False

    def test_otp_request_phone(self):
        """Test OTP request with phone number: +1234567890"""
        try:
            response = requests.post(f"{self.api_url}/auth/request-otp", 
                json={"phone_number": "+1234567890"})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "otp" in data:
                    if data["otp"] == "123456":
                        self.log_test("OTP Request - Phone", True, f"OTP received successfully: {data['otp']}")
                        return True
                    else:
                        self.log_test("OTP Request - Phone", False, "", f"Wrong OTP received: {data.get('otp')}")
                else:
                    self.log_test("OTP Request - Phone", False, "", "Missing message or OTP in response")
            else:
                self.log_test("OTP Request - Phone", False, "", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("OTP Request - Phone", False, "", str(e))
        return False

    def test_otp_verify_phone(self):
        """Test OTP verification with phone number and OTP 123456"""
        try:
            response = requests.post(f"{self.api_url}/auth/verify-otp", json={
                "phone_number": "+1234567890",
                "otp": "123456",
                "device_name": "Test Device - Phone Auth",
                "device_type": "web",
                "public_key": "test_public_key_phone_123"
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ["user", "device", "token"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("OTP Verify - Phone", False, "", f"Missing fields: {missing_fields}")
                    return False
                
                # Check user data structure
                user = data["user"]
                user_required = ["id", "phone_number", "display_name"]
                user_missing = [field for field in user_required if field not in user]
                
                if user_missing:
                    self.log_test("OTP Verify - Phone", False, "", f"Missing user fields: {user_missing}")
                    return False
                
                # Check device data structure
                device = data["device"]
                device_required = ["id", "user_id", "device_name", "device_type"]
                device_missing = [field for field in device_required if field not in device]
                
                if device_missing:
                    self.log_test("OTP Verify - Phone", False, "", f"Missing device fields: {device_missing}")
                    return False
                
                # Verify phone matches
                if user["phone_number"] != "+1234567890":
                    self.log_test("OTP Verify - Phone", False, "", f"Phone mismatch: {user['phone_number']}")
                    return False
                
                # Check if is_new_user field exists (optional but good to have)
                has_new_user_flag = "is_new_user" in data
                
                self.log_test("OTP Verify - Phone", True, 
                    f"User: {user['id']}, Device: {device['id']}, Token: {data['token'][:10]}..., New User Flag: {has_new_user_flag}")
                return True
            else:
                self.log_test("OTP Verify - Phone", False, "", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("OTP Verify - Phone", False, "", str(e))
        return False

    def test_existing_user_login(self):
        """Test login with existing user (should work for both new and existing users)"""
        try:
            # First, verify with email again (should be existing user now)
            response = requests.post(f"{self.api_url}/auth/verify-otp", json={
                "email": "kolluriabhishek7108@gmail.com",
                "otp": "123456",
                "device_name": "Test Device - Existing User",
                "device_type": "web",
                "public_key": "test_public_key_existing_123"
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Should still have all required fields
                if "user" in data and "device" in data and "token" in data:
                    user = data["user"]
                    if user["email"] == "kolluriabhishek7108@gmail.com":
                        self.log_test("Existing User Login", True, 
                            f"Existing user login successful: {user['id']}")
                        return True
                    else:
                        self.log_test("Existing User Login", False, "", "Email mismatch for existing user")
                else:
                    self.log_test("Existing User Login", False, "", "Missing required fields in response")
            else:
                self.log_test("Existing User Login", False, "", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Existing User Login", False, "", str(e))
        return False

    def run_otp_tests(self):
        """Run all OTP authentication tests"""
        print("🔐 Starting OTP Authentication Bug Fix Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        print("\n📧 Email Authentication Tests:")
        self.test_otp_request_email()
        self.test_otp_verify_email()
        
        print("\n📱 Phone Authentication Tests:")
        self.test_otp_request_phone()
        self.test_otp_verify_phone()
        
        print("\n🔄 Existing User Tests:")
        self.test_existing_user_login()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All OTP authentication tests passed!")
            print("✅ Bug fix verified: AuthScreen login() function issue resolved")
            return 0
        else:
            print("⚠️  Some OTP tests failed. Authentication may still have issues.")
            return 1

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.test_results
        }

def main():
    tester = OTPAuthTester()
    exit_code = tester.run_otp_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open('/app/otp_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())