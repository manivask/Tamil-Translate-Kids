import json
import os

with open('data/students/roster.json', 'r', encoding='utf-8') as f:
    roster = json.load(f)

enrollments = {}
for s in roster['students']:
    key = f"{s['firstName']}_{s['lastName']}_G{s['grade']}"
    # Aaradhana Manivasagam: Enrolled in Reading Club & Thirukkural
    if 'aaradhana' in s['firstName'].lower():
        enrollments[key] = {
            'firstName': s['firstName'],
            'lastName': s['lastName'],
            'grade': s['grade'],
            'clubs': ['reading', 'thirukkural']
        }
    else:
        # Default all clubs enrolled initially so other students can explore
        enrollments[key] = {
            'firstName': s['firstName'],
            'lastName': s['lastName'],
            'grade': s['grade'],
            'clubs': ['thirukkural', 'aathichudi', 'reading']
        }

with open('data/students/club_enrollments.json', 'w', encoding='utf-8') as f:
    json.dump(enrollments, f, ensure_ascii=False, indent=2)

print('Generated initial club_enrollments.json for', len(enrollments), 'students.')
