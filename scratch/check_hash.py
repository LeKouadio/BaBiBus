import bcrypt

password = "password123"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))

# Check the existing hash
existing_hash = "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a"
if bcrypt.checkpw(password.encode('utf-8'), existing_hash.encode('utf-8')):
    print("Existing hash IS for password123")
else:
    print("Existing hash IS NOT for password123")
