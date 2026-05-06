import re

with open('init-db.sql', 'r', encoding='utf-8') as f:
    content = f.read()

def extract_values(content, table_name):
    pattern = fr"INSERT INTO {table_name} .*? VALUES(.*?);"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

stops_values = extract_values(content, "stops")
lines_values = extract_values(content, "bus_lines")
line_stops_values = extract_values(content, "line_stops")

# For users, keep the existing one from data.sql or use the one from init-db.sql
# Users in init-db.sql are at line 90.
users_match = re.search(r"INSERT INTO users .*? VALUES(.*?);", content, re.DOTALL)
users_values = users_match.group(1).strip() if users_match else ""

# Notifications
notifications_match = re.search(r"INSERT INTO notifications .*? VALUES(.*?);", content, re.DOTALL)
notifications_values = notifications_match.group(1).strip() if notifications_match else ""

# Final data.sql
new_data_sql = f"""-- Sync with init-db.sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE line_stops;
TRUNCATE TABLE buses;
TRUNCATE TABLE favorites;
TRUNCATE TABLE stops;
TRUNCATE TABLE bus_lines;
TRUNCATE TABLE users;
TRUNCATE TABLE notifications;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO bus_lines (id, numero, nom, couleur, has_wifi, has_ac, is_accessible, type) VALUES 
{lines_values};

INSERT INTO stops (id, nom, adresse, latitude, longitude) VALUES 
{stops_values};

INSERT INTO line_stops (line_id, stop_id, position) VALUES 
{line_stops_values};

INSERT INTO users (nom, email, mot_de_passe, telephone, role) VALUES 
{users_values};

INSERT INTO notifications (title, description, time, is_read, icon, color) VALUES 
{notifications_values};
"""

with open('backend/backend/src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(new_data_sql)

print("Synchronized data.sql with init-db.sql and added TRUNCATE commands for clean state.")
