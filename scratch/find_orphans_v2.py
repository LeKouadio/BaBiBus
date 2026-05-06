import re

def analyze_sql(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    all_stop_ids = set()
    stop_id_to_name = {}
    
    # Simple line-by-line parsing for stops
    in_stops_block = False
    for line in lines:
        if 'INSERT INTO stops' in line:
            in_stops_block = True
            continue
        if in_stops_block:
            # Match (ID, 'Name', 'Address', Lat, Lng)
            # Using a more robust match for the name/address that handles escaped quotes
            match = re.search(r'\((\d+),\s*\'(.*)\',\s*\'(.*)\',\s*([\d.-]+),\s*([\d.-]+)\)', line)
            if match:
                sid = int(match.group(1))
                all_stop_ids.add(sid)
                stop_id_to_name[sid] = match.group(2)
            if ';' in line:
                in_stops_block = False

    print(f"Total stops found: {len(all_stop_ids)}")

    used_stop_ids = set()
    in_line_stops_block = False
    for line in lines:
        if 'INSERT INTO line_stops' in line:
            in_line_stops_block = True
            continue
        if in_line_stops_block:
            # Find all (line_id, stop_id, position)
            matches = re.findall(r'\((\d+),\s*(\d+),\s*(\d+)\)', line)
            for m in matches:
                used_stop_ids.add(int(m[1]))
            if ';' in line:
                # But wait, there might be multiple INSERT INTO line_stops?
                # In this file there is only one major one starting at 480 and ending at 554.
                pass

    print(f"Stops used in lines: {len(used_stop_ids)}")
    
    orphan_stops = all_stop_ids - used_stop_ids
    print(f"Orphan stops count: {len(orphan_stops)}")
    
    orphan_list = sorted(list(orphan_stops))
    orphan_names = [f"{sid}: {stop_id_to_name.get(sid, 'Unknown')}" for sid in orphan_list]
    
    with open('orphans.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(orphan_names))
    
    print("Orphans saved to orphans.txt")

analyze_sql('init-db.sql')
