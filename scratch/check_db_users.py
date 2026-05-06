import sqlite3
import mysql.connector

# The app uses MySQL according to application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/BaBIBUS

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="BaBIBUS"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom, email, role FROM users")
    users = cursor.fetchall()
    print("Users in database:")
    for user in users:
        print(user)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
