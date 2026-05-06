import requests

BASE_URL = "http://localhost:8080/api"

def test_full_login():
    # 1. Login
    login_url = f"{BASE_URL}/auth/login"
    login_data = {"email": "admin@babibus.com", "motDePasse": "password123"}
    print(f"Logging in to {login_url}...")
    resp = requests.post(login_url, json=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
    
    token = resp.json().get("token")
    print(f"Login success. Token: {token[:20]}...")
    
    # 2. Get Me
    me_url = f"{BASE_URL}/users/me"
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Fetching user details from {me_url}...")
    resp = requests.get(me_url, headers=headers)
    if resp.status_code != 200:
        print(f"Get Me failed: {resp.status_code} {resp.text}")
        return
    print(f"User details: {resp.json()}")
    
    # 3. Get Favorites
    fav_url = f"{BASE_URL}/favorites/"
    print(f"Fetching favorites from {fav_url}...")
    resp = requests.get(fav_url, headers=headers)
    if resp.status_code != 200:
        print(f"Get Favorites failed: {resp.status_code} {resp.text}")
        return
    print(f"Favorites: {resp.json()}")

if __name__ == "__main__":
    test_full_login()
