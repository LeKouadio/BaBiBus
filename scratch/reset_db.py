import mysql.connector

def run_sql_file(filename, cursor, connection):
    with open(filename, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Split by semicolon, but handle cases where semicolon is inside strings (simple split is risky but usually okay for this file)
    # Actually, init-db.sql has semicolons only at end of statements.
    commands = []
    current_command = []
    for line in sql.split('\n'):
        if line.strip().startswith('--'):
            continue
        current_command.append(line)
        if ';' in line:
            commands.append('\n'.join(current_command))
            current_command = []
            
    for command in commands:
        cmd = command.strip()
        if cmd:
            try:
                # Handle USE statement
                if cmd.upper().startswith('USE '):
                    cursor.execute(cmd)
                else:
                    cursor.execute(cmd)
            except Exception as e:
                print(f"Error executing command: {cmd[:100]}...\n{e}")
    connection.commit()

try:
    # Connect without database first to handle CREATE DATABASE IF NOT EXISTS
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="contenuMdp012_4"
    )
    cursor = conn.cursor()

    print("Executing init-db.sql to reset schema and data...")
    run_sql_file('init-db.sql', cursor, conn)
    print("Database successfully reset.")

    # Final verification
    cursor.execute("USE BaBIBUS")
    cursor.execute("SELECT COUNT(*) FROM stops")
    stops_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT stop_id) FROM line_stops")
    used_stops_count = cursor.fetchone()[0]
    
    print(f"Total stops: {stops_count}")
    print(f"Used stops: {used_stops_count}")
    
    if stops_count > used_stops_count:
        orphans_count = stops_count - used_stops_count
        print(f"Deleting {orphans_count} remaining orphans...")
        cursor.execute("DELETE FROM stops WHERE id NOT IN (SELECT DISTINCT stop_id FROM line_stops)")
        conn.commit()
    
    print("Perfectly clean database state achieved.")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
