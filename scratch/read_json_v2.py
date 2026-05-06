import json

try:
    with open('stops_output_v2.json', 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    print(f"Number of stops in JSON: {len(data)}")
    if len(data) > 0:
        print("Sample stop:", data[0])
except Exception as e:
    print(f"Error: {e}")
