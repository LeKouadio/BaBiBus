import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="contenuMdp012_4",
        database="BaBIBUS"
    )
    cursor = conn.cursor()

    # Find orphans
    query = "SELECT id, nom FROM stops WHERE id NOT IN (SELECT DISTINCT stop_id FROM line_stops)"
    cursor.execute(query)
    orphans = cursor.fetchall()

    print(f"Found {len(orphans)} orphan stops in the database.")
    for oid, name in orphans:
        print(f"Deleting Orphan - ID: {oid}, Name: {name}")
        # Actually delete
        delete_query = f"DELETE FROM stops WHERE id = {oid}"
        cursor.execute(delete_query)

    conn.commit()
    print("Cleanup complete.")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
