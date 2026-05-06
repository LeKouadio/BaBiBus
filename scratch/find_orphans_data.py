import re

with open('backend/backend/src/main/resources/data.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all stop IDs
stop_ids = set()
stops_section = re.search(r'INSERT IGNORE INTO stops .*?VALUES(.*?);', content, re.DOTALL)
if stops_section:
    stops_text = stops_section.group(1)
    stop_ids = set(map(int, re.findall(r'\((\d+),', stops_text)))

# Find all stop IDs used in line_stops
line_stops_ids = set()
line_stops_section = re.search(r'INSERT IGNORE INTO line_stops .*?VALUES(.*?);', content, re.DOTALL)
if line_stops_section:
    line_stops_text = line_stops_section.group(1)
    matches = re.findall(r'\(\d+,\s*(\d+),\s*\d+\)', line_stops_text)
    line_stops_ids = set(map(int, matches))

orphans = sorted(list(stop_ids - line_stops_ids))
print(f"Total stops: {len(stop_ids)}")
print(f"Used stops: {len(line_stops_ids)}")
print(f"Orphan stops count: {len(orphans)}")
print(f"Orphans: {orphans}")

# Also get the names of orphans
orphan_names = {}
for oid in orphans:
    match = re.search(fr'\({oid},\s*\'([^\']+)\'', content)
    if match:
        orphan_names[oid] = match.group(1)

print("Orphan names:", orphan_names)
