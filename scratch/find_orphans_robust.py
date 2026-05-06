import re

with open('init-db.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stop_ids = set()
line_stop_stop_ids = set()

# Process stops
in_stops = False
for line in lines:
    if 'INSERT INTO stops' in line:
        in_stops = True
        continue
    if in_stops:
        # Match (id, 'name', ...
        matches = re.findall(r'\((\d+),', line)
        for m in matches:
            stop_ids.add(int(m))
        if ';' in line:
            in_stops = False

# Process line_stops
in_line_stops = False
for line in lines:
    if 'INSERT INTO line_stops' in line:
        in_line_stops = True
        continue
    if in_line_stops:
        # Match (line_id, stop_id, position)
        matches = re.findall(r'\(\d+,\s*(\d+),\s*\d+\)', line)
        for m in matches:
            line_stop_stop_ids.add(int(m))
        if ';' in line:
            in_line_stops = False

orphans = sorted(list(stop_ids - line_stop_stop_ids))
print(f"Total stops found: {len(stop_ids)}")
print(f"Stops in line_stops: {len(line_stop_stop_ids)}")
print(f"Orphans count: {len(orphans)}")
print(f"Orphans: {orphans}")

# Get names for orphans
orphan_info = []
for oid in orphans:
    for line in lines:
        if f"({oid}," in line and "'" in line:
            match = re.search(fr'\({oid},\s*\'([^\']+)\'', line)
            if match:
                orphan_info.append((oid, match.group(1)))
                break

for oid, name in orphan_info:
    print(f"ID: {oid}, Name: {name}")
