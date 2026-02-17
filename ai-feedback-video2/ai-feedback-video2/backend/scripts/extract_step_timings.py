import json
import sys
import re
from pathlib import Path

# Usage: python extract_step_timings.py timings_json_path [fps]
# Example: python extract_step_timings.py ../output/timings/q1_thinking.json 30

def extract_step_timings(timings_json, fps=30):
    with open(timings_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    words = data['words']
    steps = []
    i = 0
    while i < len(words) - 2:
        # Look for pattern: For <Step> <Rest...>
        if words[i]['text'].lower() == 'for':
            # Compose the step phrase (e.g., 'For Locate mismatch', 'For Validate business rules', ...)
            phrase = ['For']
            j = i + 1
            # Collect up to 3 words after 'For' (to cover e.g. 'For Validate business rules')
            while j < len(words) and len(phrase) < 4 and re.match(r"[A-Za-z-]+", words[j]['text']):
                phrase.append(words[j]['text'])
                j += 1
            step_phrase = ' '.join(phrase)
            steps.append({
                'step_phrase': step_phrase,
                'start_sec': words[i]['start_sec'],
                'start_frame': int(round(words[i]['start_sec'] * fps)),
                'word_index': i
            })
        i += 1
    return steps

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_step_timings.py timings_json_path choreography_json_path [fps]")
        sys.exit(1)
    timings_json = sys.argv[1]
    choreo_json = sys.argv[2]
    fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    steps = extract_step_timings(timings_json, fps)
    print(f"Step phrase timings in {timings_json} (fps={fps}):\n")
    for step in steps:
        print(f"{step['step_phrase']}: start_sec={step['start_sec']:.3f}, start_frame={step['start_frame']}")
    update_choreography_json(choreo_json, steps, fps)

def update_choreography_json(choreo_json_path, steps, fps=30):
    with open(choreo_json_path, 'r', encoding='utf-8') as f:
        choreo = json.load(f)
    updated = False
    # Find all segments for 'col_thought' and 'col_advice' (or similar)
    for seg in choreo.get('segments', []):
        label = seg.get('label', '').lower()
        # Try to match step phrase in label or description
        for step in steps:
            # Use lower for robust matching
            if step['step_phrase'].lower() in label or step['step_phrase'].lower() in seg.get('description', '').lower():
                seg['startFrame'] = step['start_frame']
                # Optionally, set endFrame to the next step's startFrame-1, or leave as is
                updated = True
    if updated:
        with open(choreo_json_path, 'w', encoding='utf-8') as f:
            json.dump(choreo, f, indent=2)
        print(f"Updated {choreo_json_path} with step timings.")
    else:
        print("No matching segments found to update.")

if __name__ == "__main__":
    main()
