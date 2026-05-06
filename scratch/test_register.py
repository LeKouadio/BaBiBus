import requests
import random
import string

BASE_URL = "http://localhost:8080/api"

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def test_register():
    email = f"{random_string()}@test.com"
    data = {
        "nom": "Test User",
        "email": email,
        "motDePasse": "password123",
        "telephone": "0102030405"
    }
    print(f"Registering {email}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_register()
