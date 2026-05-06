import json

try:
    with open('stops_output_v2.json', 'r', encoding='utf-16le') as f:
        data = json.load(f)
    print(f"Number of stops in JSON: {len(data)}")
    # Check for orphans in this data? 
    # Does the JSON contain line info?
    if len(data) > 0:
        print("Sample stop:", data[0])
except Exception as e:
    print(f"Error: {e}")
    try:
        with open('stops_output_v2.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Number of stops in JSON: {len(data)}")
    except Exception as e2:
        print(f"Error with utf-8: {e2}")
