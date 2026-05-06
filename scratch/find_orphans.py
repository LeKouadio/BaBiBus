import re

with open('init-db.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all stop IDs
stop_ids = set()
stops_matches = re.findall(r'\((\d+),\s*\'', content)
# Wait, the stops are in lines 95-422. Some lines have one, some might have multiple?
# Let's be more specific.
stops_section = re.search(r'INSERT INTO stops .*?VALUES(.*?);', content, re.DOTALL)
if stops_section:
    stops_text = stops_section.group(1)
    # IDs are the first number in each parenthesis
    stop_ids = set(map(int, re.findall(r'\((\d+),', stops_text)))

# Find all stop IDs used in line_stops
line_stops_ids = set()
line_stops_section = re.search(r'INSERT INTO line_stops .*?VALUES(.*?);', content, re.DOTALL)
if line_stops_section:
    line_stops_text = line_stops_section.group(1)
    # line_stops values are like (line_id, stop_id, position)
    # We want the second number
    matches = re.findall(r'\(\d+,\s*(\d+),\s*\d+\)', line_stops_text)
    line_stops_ids = set(map(int, matches))

orphans = sorted(list(stop_ids - line_stops_ids))
print(f"Total stops: {len(stop_ids)}")
print(f"Used stops: {len(line_stops_ids)}")
print(f"Orphan stops count: {len(orphans)}")
print(f"Orphans: {orphans}")
