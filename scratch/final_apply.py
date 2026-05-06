import mysql.connector

def run_sql_file(filename, cursor, connection):
    with open(filename, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Split by semicolon, but be careful with multi-line commands
    # For data.sql, each command is usually a single INSERT or SET or TRUNCATE
    commands = sql.split(';')
    for command in commands:
        cmd = command.strip()
        if cmd:
            try:
                cursor.execute(cmd)
            except Exception as e:
                print(f"Error executing: {cmd[:100]}... \n{e}")
    connection.commit()

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="contenuMdp012_4",
        database="BaBIBUS"
    )
    cursor = conn.cursor()

    print("Re-initializing database from synchronized data.sql...")
    run_sql_file('backend/backend/src/main/resources/data.sql', cursor, conn)
    print("Database re-initialized.")

    # Verification
    cursor.execute("SELECT COUNT(*) FROM stops")
    stops_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT stop_id) FROM line_stops")
    used_stops_count = cursor.fetchone()[0]
    
    print(f"Total stops: {stops_count}")
    print(f"Used stops: {used_stops_count}")
    
    if stops_count > used_stops_count:
        print(f"Still found {stops_count - used_stops_count} orphans. Deleting them...")
        cursor.execute("DELETE FROM stops WHERE id NOT IN (SELECT DISTINCT stop_id FROM line_stops)")
        conn.commit()
        print("Cleanup complete.")
    else:
        print("No orphans remaining. The network is perfect!")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
