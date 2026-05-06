import requests

token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBiYWJpYnVzLmNvbSIsImlhdCI6MTc3NzY3MjgzNSwiZXhwIjoxNzc3NzU5MjM1fQ.Xcgah6pnDb7aLVRe2ogmT4dQvGYG991u3ulfoDXsl00"
url = "http://localhost:8080/api/users/me"
headers = {"Authorization": f"Bearer {token}"}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
