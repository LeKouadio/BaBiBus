import mysql.connector

def run_sql_file(filename, cursor, connection):
    with open(filename, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Simple split by semicolon (might fail with complex SQL, but data.sql is simple)
    commands = sql.split(';')
    for command in commands:
        if command.strip():
            try:
                cursor.execute(command)
            except Exception as e:
                print(f"Error executing command: {e}")
    connection.commit()

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="contenuMdp012_4",
        database="BaBIBUS"
    )
    cursor = conn.cursor()

    print("Applying data.sql to database...")
    run_sql_file('backend/backend/src/main/resources/data.sql', cursor, conn)
    print("Applied successfully.")

    # Final check for orphans
    query = "SELECT id, nom FROM stops WHERE id NOT IN (SELECT DISTINCT stop_id FROM line_stops)"
    cursor.execute(query)
    orphans = cursor.fetchall()

    if orphans:
        print(f"Found {len(orphans)} ACTUAL orphan stops. Deleting them...")
        for oid, name in orphans:
            print(f"Deleting Orphan - ID: {oid}, Name: {name}")
            cursor.execute(f"DELETE FROM stops WHERE id = {oid}")
        conn.commit()
    else:
        print("No orphan stops found after applying relationships.")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
