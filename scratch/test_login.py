import requests

url = "http://localhost:8080/api/auth/login"
data = {
    "email": "admin@babibus.com",
    "motDePasse": "password123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
