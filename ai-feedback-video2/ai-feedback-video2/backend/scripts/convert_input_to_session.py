# Wrapper script to convert input.txt (slides JSON) to session_questions.json using slides_payload_adapter.py
from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).parent))
from slides_payload_adapter import load_slides_payload, convert_slides_to_session

# Paths
input_path = Path('../../input.txt').resolve()
if not input_path.exists():
    # Try workspace root
    input_path = Path(__file__).parent.parent.parent / 'input.txt'
    input_path = input_path.resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"input.txt not found at {input_path}")
output_path = Path(__file__).parent.parent / 'data' / 'session_questions.json'
output_path.parent.mkdir(parents=True, exist_ok=True)

slides = load_slides_payload(input_path)
session = convert_slides_to_session(slides)


# Write backend session_questions.json
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(session, f, ensure_ascii=False, indent=2)
print(f"session_questions.json written to {output_path}")

# Also copy to frontend for video-app
frontend_path = Path(__file__).parent.parent.parent / 'video-app' / 'src' / 'data' / 'session_questions.json'
frontend_path.parent.mkdir(parents=True, exist_ok=True)
with open(frontend_path, 'w', encoding='utf-8') as f:
    json.dump(session, f, ensure_ascii=False, indent=2)
print(f"session_questions.json also copied to {frontend_path}")
