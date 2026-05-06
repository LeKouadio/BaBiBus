import re

def extract_section(content, start_marker, end_marker=';'):
    start_index = content.find(start_marker)
    if start_index == -1:
        return None
    end_index = content.find(end_marker, start_index)
    if end_index == -1:
        return content[start_index:]
    return content[start_index:end_index+1]

with open('init-db.sql', 'r', encoding='utf-8') as f:
    init_content = f.read()

# Extract sections
stops_section = extract_section(init_content, 'INSERT INTO stops')
lines_section = extract_section(init_content, 'INSERT INTO bus_lines')
line_stops_section = extract_section(init_content, 'INSERT INTO line_stops')
notifications_section = extract_section(init_content, 'INSERT INTO notifications')

# Convert to INSERT IGNORE for data.sql safety
if stops_section:
    stops_section = stops_section.replace('INSERT INTO stops', 'INSERT IGNORE INTO stops')
if lines_section:
    lines_section = lines_section.replace('INSERT INTO bus_lines', 'INSERT IGNORE INTO bus_lines')
if line_stops_section:
    line_stops_section = line_stops_section.replace('INSERT INTO line_stops', 'INSERT IGNORE INTO line_stops')
if notifications_section:
    notifications_section = notifications_section.replace('INSERT INTO notifications', 'INSERT IGNORE INTO notifications')

# Build data.sql
data_sql_content = f"""-- Combined Data from init-db.sql
{stops_section}

{lines_section}

{line_stops_section}

-- Users
INSERT IGNORE INTO users (nom, email, mot_de_passe, telephone, role) VALUES 
('Admin BaBiBUS', 'admin@babibus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', '0101010101', 'ADMIN'),
('Kouadio N''Guessan', 'kouadio@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', '0707070707', 'USER');

{notifications_section}
"""

with open('backend/backend/src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(data_sql_content)

print("Updated data.sql successfully.")
