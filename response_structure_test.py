#!/usr/bin/env python3
"""
Test to verify the OTP response structure includes is_new_user field
"""

import requests
import json

def test_response_structure():
    base_url = "https://chatconnect-68.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing OTP Response Structure...")
    
    # Test with a completely new email
    new_email = f"test_new_user_{int(time.time())}@example.com"
    
    try:
        # Request OTP for new user
        otp_response = requests.post(f"{api_url}/auth/request-otp", 
            json={"email": new_email})
        
        if otp_response.status_code == 200:
            print("✅ OTP request successful for new user")
            
            # Verify OTP for new user
            verify_response = requests.post(f"{api_url}/auth/verify-otp", json={
                "email": new_email,
                "otp": "123456",
                "device_name": "Structure Test Device",
                "device_type": "web",
                "public_key": "test_structure_key"
            })
            
            if verify_response.status_code == 200:
                data = verify_response.json()
                print("✅ OTP verification successful")
                
                # Check response structure
                print("\n📋 Response Structure Analysis:")
                print(f"- Has 'user' field: {'user' in data}")
                print(f"- Has 'device' field: {'device' in data}")
                print(f"- Has 'token' field: {'token' in data}")
                print(f"- Has 'is_new_user' field: {'is_new_user' in data}")
                
                if 'user' in data:
                    user = data['user']
                    print(f"- User ID: {user.get('id', 'Missing')}")
                    print(f"- User Email: {user.get('email', 'Missing')}")
                    print(f"- Display Name: {user.get('display_name', 'Missing')}")
                
                if 'device' in data:
                    device = data['device']
                    print(f"- Device ID: {device.get('id', 'Missing')}")
                    print(f"- Device Type: {device.get('device_type', 'Missing')}")
                
                print(f"\n📄 Full Response Structure:")
                print(json.dumps(data, indent=2, default=str))
                
            else:
                print(f"❌ OTP verification failed: {verify_response.status_code}")
        else:
            print(f"❌ OTP request failed: {otp_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    import time
    test_response_structure()