import json
import base64
import hashlib
import sys
import random
from collections import defaultdict
# from ortools.sat.python import cp_model

# ============================================================================
# ENCRYPTION/DECRYPTION
# ============================================================================

try:
    input = raw_input
except NameError:
    pass

try:
    bytes_type = bytes
    str_type = str
except NameError:
    bytes_type = str
    str_type = unicode

def to_bytes(s):
    if isinstance(s, bytes_type):
        return s
    return s.encode('utf-8')

def to_str(b):
    if isinstance(b, str_type):
        return b
    return b.decode('utf-8')

def generate_key(passphrase):
    return hashlib.sha256(to_bytes(passphrase)).digest()

def xor_encrypt_decrypt(data, key):
    key_length = len(key)
    data_bytes = to_bytes(data) if isinstance(data, str_type) else data
    result = bytearray(len(data_bytes))
    for i in range(len(data_bytes)):
        data_byte = ord(data_bytes[i]) if isinstance(data_bytes[i], str_type) else data_bytes[i]
        key_byte = ord(key[i % key_length]) if isinstance(key[i % key_length], str_type) else key[i % key_length]
        result[i] = data_byte ^ key_byte
    return bytes(result)

def encrypt(data, passphrase):
    data_bytes = to_bytes(data)
    encrypted = xor_encrypt_decrypt(data_bytes, generate_key(passphrase))
    return to_str(base64.b64encode(encrypted))

def decrypt(encrypted_data, passphrase):
    decoded = base64.b64decode(to_bytes(encrypted_data))
    decrypted = xor_encrypt_decrypt(decoded, generate_key(passphrase))
    return to_str(decrypted)

# ============================================================================
# READ INPUT
# ============================================================================

try:
    passphrase = sys.stdin.readline().strip()
    encrypted_data = sys.stdin.readline().strip()
except Exception as e:
    sys.stderr.write("Input error: " + str(e) + "\n")
    sys.exit(1)

try:
    decrypted_data = decrypt(encrypted_data, passphrase)
except Exception as e:
    sys.stderr.write("Decryption error: " + str(e) + "\n")
    sys.exit(1)

json_data = json.loads(decrypted_data)

title = json_data["Title"]
firstbreak = float(json_data["firstBreakTime"])
secondbreak = float(json_data["secondBreakTime"])
teachers_dict = json_data["TeacherLoad"]
teacher_availability_dict = json_data["TeacherAvailability"]
rooms = json_data["RoomInfo"]
subjects = json_data["Subject"]
sections = json_data["Section"]

# Day name normalization mapping
DAY_MAPPING = {
    'MON': 'Mon', 'MONDAY': 'Mon', 'Mon': 'Mon',
    'TUE': 'Tue', 'TUESDAY': 'Tue', 'Tue': 'Tue',
    'WED': 'Wed', 'WEDNESDAY': 'Wed', 'Wed': 'Wed',
    'THU': 'Thu', 'THURSDAY': 'Thu', 'Thu': 'Thu',
    'FRI': 'Fri', 'FRIDAY': 'Fri', 'Fri': 'Fri',
    'SAT': 'Sat', 'SATURDAY': 'Sat', 'Sat': 'Sat'
}

# Normalize teacher availability day keys
normalized_teacher_availability = {}
for tid, tdata in teacher_availability_dict.items():
    normalized_avail = {}
    for day_key, hours in tdata.get('availability', {}).items():
        normalized_day = DAY_MAPPING.get(day_key.upper(), day_key)
        normalized_avail[normalized_day] = hours
    
    normalized_teacher_availability[tid] = {
        'name': tdata.get('name', tid),
        'status': tdata.get('status', 'FULL-TIME'),
        'availability': normalized_avail
    }

teacher_availability_dict = normalized_teacher_availability

# Convert to list format for compatibility
teacher_load = []
for tid, tdata in teachers_dict.items():
    teacher_load.append({
        'teacher_id': tid,
        'teacher_name': tdata['name'],
        'courses': tdata['courses'],
        'max_units': float(tdata['maxUnits'])
    })

teacher_availability = []
for tid, tdata in teacher_availability_dict.items():
    teacher_availability.append({
        'teacher_id': tid,
        'teacher_name': tdata['name'],
        'status': tdata['status'],
        **{day: tdata['availability'][day] for day in tdata['availability']}
    })

# Map subjects to simpler format
courses = []
for subj in subjects:
    courses.append({
        'code': subj['courseCode'],
        'name': subj['courseTitle'],
        'type': subj['subjectType'],
        'units': float(subj['units']),
        'days': int(subj['daysPerWeek'])
    })

# Map rooms
rooms_list = []
for room in rooms:
    rooms_list.append({
        'room': room['roomName'],
        'type': room['roomType'],
        'capacity': int(room.get('roomCapacity', 40))
    })

# Map sections
sections_list = []
for sec in sections:
    sections_list.append({
        'name': sec['sectionName'],
        'courses': sec['courseCodes'],
        'student_count': int(sec.get('sectionStudents', 30))
    })

# ============================================================================
# CONSTANTS
# ============================================================================

FIRST_BREAK_RANGE_START = 10
FIRST_BREAK_RANGE_END = 13
SECOND_BREAK_RANGE_START = 17
SECOND_BREAK_RANGE_END = 18
BREAK_DURATION = 1

# Extract days with normalization
days = []
for teacher_data in teacher_availability:
    for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']:
        if day in teacher_data and teacher_data[day] and day not in days:
            days.append(day)

# Fallback if no days found
if not days:
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

time_slots = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM"]
time_map = {"8AM": 8, "9AM": 9, "10AM": 10, "11AM": 11, "12PM": 12, "1PM": 13, "2PM": 14, "3PM": 15, "4PM": 16, "5PM": 17, "6PM": 18, "7PM": 19}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_expected_schedules():
    """Calculate total expected schedules based on courses and sections"""
    total_expected = 0
    expected_by_section = {}

    for sec in sections_list:
        section_expected = 0
        for course_code in sec['courses']:
            course_obj = next((c for c in courses if c['code'] == course_code), None)
            if course_obj:
                num_sessions = course_obj['days']
                section_expected += num_sessions
        expected_by_section[sec['name']] = section_expected
        total_expected += section_expected

    return total_expected, expected_by_section

def analyze_schedule_completeness(schedule):
    """Analyze which schedules are created vs expected"""
    _, expected_by_section = calculate_expected_schedules()

    actual_by_section = {}
    created_courses_by_section = {}

    for sec in sections_list:
        actual_by_section[sec['name']] = 0
        created_courses_by_section[sec['name']] = {}

        for course_code in sec['courses']:
            course_classes = [g for g in schedule if g['section'] == sec['name'] and g['course'] == course_code]
            actual_count = len(course_classes)
            actual_by_section[sec['name']] += actual_count
            created_courses_by_section[sec['name']][course_code] = actual_count

    return expected_by_section, actual_by_section, created_courses_by_section

def get_all_teacher_ids():
    """Get list of unique teacher IDs"""
    return list(set([t['teacher_id'] for t in teacher_load]))

def get_teacher_info(teacher_id):
    """Get complete teacher information by merging data from all sources"""
    load_info = next((l for l in teacher_load if l['teacher_id'] == teacher_id), None)
    if not load_info:
        return None

    availability_info = next((a for a in teacher_availability if a['teacher_id'] == teacher_id), None)

    availability = {}
    if availability_info:
        for day in days:
            if day in availability_info:
                availability[day] = availability_info[day]

    return {
        'id': teacher_id,
        'name': load_info.get('teacher_name', teacher_id),
        'courses': load_info['courses'],
        'max_units': load_info['max_units'],
        'status': availability_info['status'] if availability_info else 'FULL-TIME',
        'availability': availability
    }

def get_all_teachers_info():
    """Get all teachers with complete information"""
    teacher_ids = get_all_teacher_ids()
    return [get_teacher_info(tid) for tid in teacher_ids]

def get_hours_per_session(course):
    return course["units"] / course["days"]

def times_overlap(start1, dur1, start2, dur2):
    """Check if two time intervals overlap"""
    end1 = time_map[start1] + dur1
    end2 = time_map[start2] + dur2
    return (time_map[start1] < end2) and (time_map[start2] < end1)

def calculate_end_time(start_time, duration):
    """Calculate end time string from start time and duration"""
    start_hour = time_map[start_time]
    end_hour_float = start_hour + duration
    end_hour = int(end_hour_float)
    end_min = int((end_hour_float - end_hour) * 60)
    if end_min > 0:
        if end_hour < 12:
            return f"{end_hour}:{end_min:02d}AM"
        elif end_hour == 12:
            return f"12:{end_min:02d}PM"
        else:
            return f"{end_hour-12}:{end_min:02d}PM"
    else:
        if end_hour < 12:
            return f"{end_hour}AM"
        elif end_hour == 12:
            return "12PM"
        else:
            return f"{end_hour-12}PM"

def is_teacher_available(teacher_info, day, start_time, duration):
    """Check if teacher is available for the entire class duration"""
    if day not in teacher_info['availability']:
        return False

    available_hours = teacher_info['availability'][day]

    class_start = time_map[start_time]
    class_end = class_start + duration

    required_hours = []
    current_hour = class_start
    while current_hour < class_end:
        required_hours.append(int(current_hour))
        current_hour += 1

    return all(hour in available_hours for hour in required_hours)

def has_continuous_schedule(schedule, entity_type, entity_id, day, start_hour, end_hour):
    """Check if an entity (section/teacher) has continuous classes in a time range"""
    classes = [g for g in schedule if g[entity_type] == entity_id and g['day'] == day]
    if not classes:
        return False

    covered_hours = set()
    for g in classes:
        class_start = time_map[g['time']]
        class_end = class_start + g['duration']
        for h in range(int(class_start), int(class_end)):
            covered_hours.add(h)

    required_hours = set(range(start_hour, end_hour))
    return required_hours.issubset(covered_hours)

def get_break_assignments(schedule):
    """Assign break times for each section and teacher on each day."""
    break_assignments = {}
    teachers_info = get_all_teachers_info()

    for day in days:
        used_first_breaks = set()
        used_second_breaks = set()

        for sec in sections_list:
            sec_classes = [g for g in schedule if g['section'] == sec['name'] and g['day'] == day]
            if not sec_classes:
                continue

            valid_first_breaks = []
            for break_start in range(FIRST_BREAK_RANGE_START, FIRST_BREAK_RANGE_END):
                has_conflict = False
                for g in sec_classes:
                    if times_overlap(f"{break_start}{'AM' if break_start < 12 else 'PM'}",
                                   BREAK_DURATION, g['time'], g['duration']):
                        has_conflict = True
                        break
                if not has_conflict:
                    valid_first_breaks.append(break_start)

            if valid_first_breaks:
                unused_breaks = [b for b in valid_first_breaks if b not in used_first_breaks]
                chosen_break = random.choice(unused_breaks) if unused_breaks else random.choice(valid_first_breaks)
                break_assignments[('section', sec['name'], day, 'first')] = chosen_break
                used_first_breaks.add(chosen_break)
            else:
                break_assignments[('section', sec['name'], day, 'first')] = random.choice(range(FIRST_BREAK_RANGE_START, FIRST_BREAK_RANGE_END))

            if has_continuous_schedule(schedule, 'section', sec['name'], day, 13, 17):
                valid_second_breaks = []
                for break_start in range(SECOND_BREAK_RANGE_START, SECOND_BREAK_RANGE_END):
                    has_conflict = False
                    for g in sec_classes:
                        if times_overlap(f"{break_start-12}PM", BREAK_DURATION, g['time'], g['duration']):
                            has_conflict = True
                            break
                    if not has_conflict:
                        valid_second_breaks.append(break_start)

                if valid_second_breaks:
                    unused_breaks = [b for b in valid_second_breaks if b not in used_second_breaks]
                    chosen_break = random.choice(unused_breaks) if unused_breaks else random.choice(valid_second_breaks)
                    break_assignments[('section', sec['name'], day, 'second')] = chosen_break
                    used_second_breaks.add(chosen_break)
                else:
                    break_assignments[('section', sec['name'], day, 'second')] = random.choice(range(SECOND_BREAK_RANGE_START, SECOND_BREAK_RANGE_END))

        for tchr_info in teachers_info:
            tchr_classes = [g for g in schedule if g['teacher'] == tchr_info['id'] and g['day'] == day]
            if not tchr_classes:
                continue

            valid_first_breaks = []
            for break_start in range(FIRST_BREAK_RANGE_START, FIRST_BREAK_RANGE_END):
                has_conflict = False
                for g in tchr_classes:
                    if times_overlap(f"{break_start}{'AM' if break_start < 12 else 'PM'}",
                                   BREAK_DURATION, g['time'], g['duration']):
                        has_conflict = True
                        break
                if not has_conflict:
                    valid_first_breaks.append(break_start)

            if valid_first_breaks:
                unused_breaks = [b for b in valid_first_breaks if b not in used_first_breaks]
                chosen_break = random.choice(unused_breaks) if unused_breaks else random.choice(valid_first_breaks)
                break_assignments[('teacher', tchr_info['id'], day, 'first')] = chosen_break
                used_first_breaks.add(chosen_break)
            else:
                break_assignments[('teacher', tchr_info['id'], day, 'first')] = random.choice(range(FIRST_BREAK_RANGE_START, FIRST_BREAK_RANGE_END))

            if has_continuous_schedule(schedule, 'teacher', tchr_info['id'], day, 13, 17):
                valid_second_breaks = []
                for break_start in range(SECOND_BREAK_RANGE_START, SECOND_BREAK_RANGE_END):
                    has_conflict = False
                    for g in tchr_classes:
                        if times_overlap(f"{break_start-12}PM", BREAK_DURATION, g['time'], g['duration']):
                            has_conflict = True
                            break
                    if not has_conflict:
                        valid_second_breaks.append(break_start)

                if valid_second_breaks:
                    unused_breaks = [b for b in valid_second_breaks if b not in used_second_breaks]
                    chosen_break = random.choice(unused_breaks) if unused_breaks else random.choice(valid_second_breaks)
                    break_assignments[('teacher', tchr_info['id'], day, 'second')] = chosen_break
                    used_second_breaks.add(chosen_break)
                else:
                    break_assignments[('teacher', tchr_info['id'], day, 'second')] = random.choice(range(SECOND_BREAK_RANGE_START, SECOND_BREAK_RANGE_END))

    return break_assignments

def calculate_schedule_diversity(population):
    """Calculate diversity metric to prevent premature convergence"""
    if not population:
        return 0.0

    schedule_signatures = []
    for schedule in population:
        signature = tuple(sorted([(g['section'], g['course'], g['day'], g['time']) for g in schedule]))
        schedule_signatures.append(signature)

    unique_schedules = len(set(schedule_signatures))
    return unique_schedules / len(population)

def teacher_can_teach_course(teacher_id, course_code):
    """Check if a teacher has the course in their load"""
    teacher_info = next((t for t in teacher_load if t['teacher_id'] == teacher_id), None)
    if not teacher_info:
        return False
    return course_code in teacher_info['courses']

# ============================================================================
# CSP SOLVER
# ============================================================================


def generate_csp_schedule():
    """
    Custom CSP solver using backtracking with constraint checking.
    Replaces OR-Tools while maintaining all constraints.
    """
    teachers_info = get_all_teachers_info()
    
    if not teachers_info or not days:
        return None
    
    # Initialize schedule
    schedule = []
    
    # Build assignment tasks
    tasks = []
    for sec in sections_list:
        for course_code in sec['courses']:
            course_obj = next((c for c in courses if c['code'] == course_code), None)
            if not course_obj:
                continue
            
            qualified_teachers = [t for t in teachers_info if course_code in t['courses']]
            
            # Handle no available teacher case
            if not qualified_teachers:
                num_sessions = course_obj['days']
                for session in range(num_sessions):
                    schedule.append({
                        'section': sec['name'],
                        'course': course_code,
                        'teacher': 'NO AVAILABLE TEACHER',
                        'room': 'ONLINE' if course_obj['type'] == 'Online' else 'NO ROOM',
                        'day': days[session % len(days)],
                        'time': time_slots[session % len(time_slots)],
                        'duration': get_hours_per_session(course_obj)
                    })
                continue
            
            # Add valid tasks
            num_sessions = course_obj['days']
            for session in range(num_sessions):
                tasks.append({
                    'section': sec['name'],
                    'course': course_code,
                    'session': session,
                    'course_obj': course_obj,
                    'qualified_teachers': qualified_teachers
                })
    
    # Shuffle tasks for randomization
    random.shuffle(tasks)
    
    # Greedy assignment with constraint checking
    for task in tasks:
        assignment = find_valid_assignment(task, schedule, teachers_info)
        if assignment:
            schedule.append(assignment)
        else:
            # Fallback: assign with potential conflicts (will be handled by GA)
            schedule.append({
                'section': task['section'],
                'course': task['course'],
                'teacher': task['qualified_teachers'][0]['id'],
                'room': get_random_valid_room(task['course_obj'], task['section']),
                'day': random.choice(days),
                'time': random.choice(time_slots),
                'duration': get_hours_per_session(task['course_obj'])
            })
    
    return schedule if schedule else None


def find_valid_assignment(task, current_schedule, teachers_info):
    """
    Find a valid assignment for a task that satisfies all constraints.
    """
    course_obj = task['course_obj']
    duration = get_hours_per_session(course_obj)
    section_name = task['section']
    
    # Get valid rooms
    valid_rooms = get_valid_rooms_for_course(course_obj, section_name)
    if not valid_rooms:
        valid_rooms = ['ONLINE' if course_obj['type'] == 'Online' else 'NO ROOM']
    
    # Shuffle to encourage variety
    random.shuffle(valid_rooms)
    
    # Try each teacher
    teachers = task['qualified_teachers'].copy()
    random.shuffle(teachers)
    
    for teacher in teachers:
        teacher_info = next((t for t in teachers_info if t['id'] == teacher['id']), None)
        if not teacher_info:
            continue
        
        # Try each day
        available_days = list(days)
        random.shuffle(available_days)
        
        for day in available_days:
            # Check if teacher is available on this day
            if day not in teacher_info['availability']:
                continue
            
            available_hours = teacher_info['availability'][day]
            
            # Try each time slot
            time_slots_shuffled = time_slots.copy()
            random.shuffle(time_slots_shuffled)
            
            for time_slot in time_slots_shuffled:
                # Check teacher availability for entire duration
                if not is_teacher_available(teacher_info, day, time_slot, duration):
                    continue
                
                # Try each room
                for room in valid_rooms:
                    assignment = {
                        'section': section_name,
                        'course': task['course'],
                        'teacher': teacher['id'],
                        'room': room,
                        'day': day,
                        'time': time_slot,
                        'duration': duration
                    }
                    
                    # Check all constraints
                    if is_assignment_valid(assignment, current_schedule, teacher_info):
                        return assignment
    
    return None


def is_assignment_valid(assignment, current_schedule, teacher_info):
    """
    Check if an assignment violates any constraints.
    """
    # CONSTRAINT 1: No teacher time conflicts
    for scheduled in current_schedule:
        if (scheduled['teacher'] == assignment['teacher'] and 
            scheduled['day'] == assignment['day']):
            if times_overlap(scheduled['time'], scheduled['duration'], 
                           assignment['time'], assignment['duration']):
                return False
    
    # CONSTRAINT 2: No section time conflicts
    for scheduled in current_schedule:
        if (scheduled['section'] == assignment['section'] and 
            scheduled['day'] == assignment['day']):
            if times_overlap(scheduled['time'], scheduled['duration'], 
                           assignment['time'], assignment['duration']):
                return False
    
    # CONSTRAINT 3: No room conflicts (except ONLINE)
    if assignment['room'] not in ['ONLINE', 'NO ROOM']:
        for scheduled in current_schedule:
            if (scheduled['room'] == assignment['room'] and 
                scheduled['day'] == assignment['day'] and
                scheduled['room'] not in ['ONLINE', 'NO ROOM']):
                if times_overlap(scheduled['time'], scheduled['duration'], 
                               assignment['time'], assignment['duration']):
                    return False
    
    # CONSTRAINT 4: Section daily hour limit (10 hours)
    section_day_hours = sum(
        s['duration'] for s in current_schedule 
        if s['section'] == assignment['section'] and s['day'] == assignment['day']
    )
    if section_day_hours + assignment['duration'] > 10:
        return False
    
    # CONSTRAINT 5: Teacher max units
    teacher_total_hours = sum(
        s['duration'] for s in current_schedule 
        if s['teacher'] == assignment['teacher']
    )
    if teacher_total_hours + assignment['duration'] > teacher_info['max_units']:
        return False
    
    # CONSTRAINT 6: Online courses unique day+time
    if assignment['room'] == 'ONLINE':
        for scheduled in current_schedule:
            if (scheduled['room'] == 'ONLINE' and 
                scheduled['day'] == assignment['day'] and 
                scheduled['time'] == assignment['time']):
                return False
    
    return True


def get_valid_rooms_for_course(course_obj, section_name):
    """
    Get list of valid rooms for a course based on type and capacity.
    """
    if course_obj['type'] == 'Online':
        return ['ONLINE']
    
    section = next((s for s in sections_list if s['name'] == section_name), None)
    if not section:
        return []
    
    student_count = section.get('student_count', 30)
    
    # Find rooms matching type and capacity
    valid_rooms = [
        r['room'] for r in rooms_list 
        if r['type'] == course_obj['type'] and r.get('capacity', 40) >= student_count
    ]
    
    # Fallback: just match type if no capacity match
    if not valid_rooms:
        valid_rooms = [r['room'] for r in rooms_list if r['type'] == course_obj['type']]
    
    return valid_rooms


def get_random_valid_room(course_obj, section_name):
    """
    Get a random valid room for fallback assignments.
    """
    valid_rooms = get_valid_rooms_for_course(course_obj, section_name)
    
    if valid_rooms:
        return random.choice(valid_rooms)
    
    if course_obj['type'] == 'Online':
        return 'ONLINE'
    
    return 'NO ROOM'
# ============================================================================
# CONFLICT DETECTION
# ============================================================================

def detect_conflicts(schedule):
    """Enhanced conflict detection with detailed reporting"""
    conflicts = []
    break_assignments = get_break_assignments(schedule)
    teachers_info = get_all_teachers_info()

    # Check for teacher-course mismatch (teacher doesn't have course in their load)
    for g in schedule:
        if g['teacher'] == 'NO AVAILABLE TEACHER':
            conflicts.append({
                'type': 'no_available_teacher',
                'section': g['section'],
                'course': g['course'],
                'day': g['day'],
                'time': g['time'],
                'message': f"No teacher available to teach {g['course']} for section {g['section']} on {g['day']} at {g['time']}"
            })
        elif not teacher_can_teach_course(g['teacher'], g['course']):
            end_time = calculate_end_time(g['time'], g['duration'])
            conflicts.append({
                'type': 'teacher_course_mismatch',
                'teacher': g['teacher'],
                'course': g['course'],
                'section': g['section'],
                'day': g['day'],
                'time': g['time'],
                'class_time': f"{g['time']}-{end_time}",
                'message': f"Teacher {g['teacher']} is assigned to teach {g['course']} for section {g['section']}, but this course is not in their teaching load"
            })

    # Check teacher availability violations
    for g in schedule:
        if g['teacher'] == 'NO AVAILABLE TEACHER':
            continue
        teacher_info = next((t for t in teachers_info if t['id'] == g['teacher']), None)
        if not teacher_info:
            continue
        if not is_teacher_available(teacher_info, g['day'], g['time'], g['duration']):
            end_time = calculate_end_time(g['time'], g['duration'])
            if g['day'] in teacher_info['availability']:
                avail_hours = teacher_info['availability'][g['day']]
                avail_str = f"{min(avail_hours)}:00-{max(avail_hours)+1}:00" if avail_hours else "Not Available"
            else:
                avail_str = "Not Available"
            conflicts.append({
                'type': 'teacher_availability',
                'teacher': g['teacher'],
                'day': g['day'],
                'course': g['course'],
                'section': g['section'],
                'time': g['time'],
                'class_time': f"{g['time']}-{end_time}",
                'teacher_availability': avail_str,
                'message': f"Teacher {g['teacher']} availability violated: {g['course']} ({g['section']}) scheduled {g['day']} {g['time']}-{end_time}, but teacher available only {avail_str}"
            })

    # Check break violations
    for key, break_start in break_assignments.items():
        entity_type, entity_id, day, break_type = key
        break_end = break_start + BREAK_DURATION

        for g in schedule:
            if g['day'] != day:
                continue
            if entity_type == 'section' and g['section'] != entity_id:
                continue
            if entity_type == 'teacher' and g['teacher'] != entity_id:
                continue

            class_start = time_map[g['time']]
            class_end = class_start + g['duration']

            if (class_start < break_end) and (class_end > break_start):
                break_time_str = f"{break_start}:00-{break_end}:00"
                end_time_str = calculate_end_time(g['time'], g['duration'])
                conflicts.append({
                    'type': 'break_violation',
                    'entity_type': entity_type,
                    'entity_id': entity_id,
                    'day': day,
                    'time': g['time'],
                    'break_type': break_type,
                    'break_time': break_time_str,
                    'course': g['course'],
                    'class_time': f"{g['time']}-{end_time_str}",
                    'section': g['section'],
                    'teacher': g['teacher'],
                    'message': f"{entity_type.capitalize()} {entity_id} {break_type} break ({break_time_str}) violated by {g['course']} on {day} at {g['time']}-{end_time_str}"
                })

    for i, g1 in enumerate(schedule):
        for j, g2 in enumerate(schedule):
            if i >= j:
                continue

            # Skip conflicts involving NO AVAILABLE TEACHER
            if g1['teacher'] == 'NO AVAILABLE TEACHER' or g2['teacher'] == 'NO AVAILABLE TEACHER':
                continue

            # Teacher overlap
            if g1["teacher"] == g2["teacher"] and g1["day"] == g2["day"]:
                if times_overlap(g1["time"], g1["duration"], g2["time"], g2["duration"]):
                    end1 = calculate_end_time(g1['time'], g1['duration'])
                    end2 = calculate_end_time(g2['time'], g2['duration'])
                    conflicts.append({
                        'type': 'teacher_overlap',
                        'teacher': g1['teacher'],
                        'day': g1['day'],
                        'time': g1['time'],
                        'class1': {'section': g1['section'], 'course': g1['course'],
                                  'time': g1['time'], 'end': end1, 'room': g1['room']},
                        'class2': {'section': g2['section'], 'course': g2['course'],
                                  'time': g2['time'], 'end': end2, 'room': g2['room']},
                        'message': f"Teacher {g1['teacher']} overlap on {g1['day']}: {g1['section']} {g1['course']} ({g1['time']}-{end1}) vs {g2['section']} {g2['course']} ({g2['time']}-{end2})"
                    })

            # Room overlap
            if g1["room"] == g2["room"] and g1["room"] != "ONLINE" and g1["room"] != "NO ROOM" and g1["day"] == g2["day"]:
                if times_overlap(g1["time"], g1["duration"], g2["time"], g2["duration"]):
                    end1 = calculate_end_time(g1['time'], g1['duration'])
                    end2 = calculate_end_time(g2['time'], g2['duration'])
                    conflicts.append({
                        'type': 'room_overlap',
                        'room': g1['room'],
                        'day': g1['day'],
                        'time': g1['time'],
                        'class1': {'section': g1['section'], 'course': g1['course'],
                                  'time': g1['time'], 'end': end1, 'teacher': g1['teacher']},
                        'class2': {'section': g2['section'], 'course': g2['course'],
                                  'time': g2['time'], 'end': end2, 'teacher': g2['teacher']},
                        'message': f"Room {g1['room']} overlap on {g1['day']}: {g1['section']} {g1['course']} ({g1['time']}-{end1}) vs {g2['section']} {g2['course']} ({g2['time']}-{end2})"
                    })

            # Section overlap
            if g1["section"] == g2["section"] and g1["day"] == g2["day"]:
                if times_overlap(g1["time"], g1["duration"], g2["time"], g2["duration"]):
                    end1 = calculate_end_time(g1['time'], g1['duration'])
                    end2 = calculate_end_time(g2['time'], g2['duration'])
                    conflicts.append({
                        'type': 'section_overlap',
                        'section': g1['section'],
                        'day': g1['day'],
                        'time': g1['time'],
                        'class1': {'course': g1['course'], 'time': g1['time'], 'end': end1,
                                  'teacher': g1['teacher'], 'room': g1['room']},
                        'class2': {'course': g2['course'], 'time': g2['time'], 'end': end2,
                                  'teacher': g2['teacher'], 'room': g2['room']},
                        'message': f"Section {g1['section']} overlap on {g1['day']}: {g1['course']} ({g1['time']}-{end1}, T:{g1['teacher']}, R:{g1['room']}) vs {g2['course']} ({g2['time']}-{end2}, T:{g2['teacher']}, R:{g2['room']})"
                    })

    # Online course conflicts
    online_courses = [g for g in schedule if g['room'] == 'ONLINE']
    for i, o1 in enumerate(online_courses):
        for o2 in online_courses[i+1:]:
            if o1['day'] == o2['day'] and o1['time'] == o2['time']:
                end1 = calculate_end_time(o1['time'], o1['duration'])
                end2 = calculate_end_time(o2['time'], o2['duration'])
                conflicts.append({
                    'type': 'online_overlap',
                    'day': o1['day'],
                    'time': o1['time'],
                    'class1': {'section': o1['section'], 'course': o1['course'],
                              'teacher': o1['teacher'], 'end': end1},
                    'class2': {'section': o2['section'], 'course': o2['course'],
                              'teacher': o2['teacher'], 'end': end2},
                    'message': f"Online courses conflict on {o1['day']} at {o1['time']}-{end1}: {o1['section']} {o1['course']} (T:{o1['teacher']}) vs {o2['section']} {o2['course']} (T:{o2['teacher']})"
                })

    # Online/offline conflict for teachers
    for tchr_info in teachers_info:
        for day in days:
            online_courses = [g for g in schedule if g["teacher"] == tchr_info["id"] and g["day"] == day and g["room"] == "ONLINE"]
            offline_courses = [g for g in schedule if g["teacher"] == tchr_info["id"] and g["day"] == day and g["room"] != "ONLINE" and g["room"] != "NO ROOM"]
            if online_courses and offline_courses:
                online_list = ', '.join([f"{g['course']} ({g['time']}-{calculate_end_time(g['time'], g['duration'])})" for g in online_courses])
                offline_list = ', '.join([f"{g['course']} ({g['time']}-{calculate_end_time(g['time'], g['duration'])}, R:{g['room']})" for g in offline_courses])
                conflicts.append({
                    'type': 'teacher_online_offline_mix',
                    'teacher': tchr_info['id'],
                    'day': day,
                    'time': online_courses[0]['time'],
                    'online_courses': online_courses,
                    'offline_courses': offline_courses,
                    'message': f"Teacher {tchr_info['id']} has online + offline courses on {day}: Online=[{online_list}], Offline=[{offline_list}]"
                })

    # Online/offline conflict for sections
    for sec in sections_list:
        for day in days:
            online_courses = [g for g in schedule if g["section"] == sec["name"] and g["day"] == day and g["room"] == "ONLINE"]
            offline_courses = [g for g in schedule if g["section"] == sec["name"] and g["day"] == day and g["room"] != "ONLINE" and g["room"] != "NO ROOM"]
            if online_courses and offline_courses:
                online_list = ', '.join([f"{g['course']} ({g['time']}-{calculate_end_time(g['time'], g['duration'])}, T:{g['teacher']})" for g in online_courses])
                offline_list = ', '.join([f"{g['course']} ({g['time']}-{calculate_end_time(g['time'], g['duration'])}, T:{g['teacher']}, R:{g['room']})" for g in offline_courses])
                conflicts.append({
                    'type': 'section_online_offline_mix',
                    'section': sec['name'],
                    'day': day,
                    'time': online_courses[0]['time'],
                    'online_courses': online_courses,
                    'offline_courses': offline_courses,
                    'message': f"Section {sec['name']} has online + offline courses on {day}: Online=[{online_list}], Offline=[{offline_list}]"
                })

    # Section daily hour limit
    for sec in sections_list:
        for day in days:
            sec_classes = [g for g in schedule if g['section'] == sec['name'] and g['day'] == day]
            total_hours = sum(g['duration'] for g in sec_classes)
            if total_hours > 10:
                class_list = ', '.join([f"{g['course']} ({g['time']}-{calculate_end_time(g['time'], g['duration'])}, {g['duration']}h)" for g in sec_classes])
                for g in sec_classes:
                    conflicts.append({
                        'type': 'section_daily_hours_exceeded',
                        'section': sec['name'],
                        'day': day,
                        'time': g['time'],
                        'total_hours': total_hours,
                        'course': g['course'],
                        'classes': sec_classes,
                        'message': f"Section {sec['name']} exceeds 10 hours on {day}: {total_hours:.1f} hours - Classes: [{class_list}]"
                    })

    # Teacher max units
    for tchr_info in teachers_info:
        tchr_classes = [g for g in schedule if g['teacher'] == tchr_info['id']]
        total_hours = sum(g['duration'] for g in tchr_classes)
        if total_hours > tchr_info['max_units']:
            class_list = ', '.join([f"{g['course']} ({g['day']} {g['time']}-{calculate_end_time(g['time'], g['duration'])}, {g['duration']}h)" for g in tchr_classes])
            for g in tchr_classes:
                conflicts.append({
                    'type': 'teacher_max_units_exceeded',
                    'teacher': tchr_info['id'],
                    'day': g['day'],
                    'time': g['time'],
                    'total_hours': total_hours,
                    'max_units': tchr_info['max_units'],
                    'course': g['course'],
                    'classes': tchr_classes,
                    'message': f"Teacher {tchr_info['id']} exceeds max units: {total_hours:.1f}/{tchr_info['max_units']} hours - Classes: [{class_list}]"
                })

    # Check room capacity violations
    for g in schedule:
        if g['room'] == 'ONLINE' or g['room'] == 'NO ROOM':
            continue
            
        section = next((s for s in sections_list if s['name'] == g['section']), None)
        room = next((r for r in rooms_list if r['room'] == g['room']), None)
        
        if section and room:
            student_count = section.get('student_count', 0)
            room_capacity = room.get('capacity', 0)
            
            if student_count > room_capacity:
                conflicts.append({
                    'type': 'room_capacity_exceeded',
                    'section': g['section'],
                    'room': g['room'],
                    'day': g['day'],
                    'time': g['time'],
                    'course': g['course'],
                    'student_count': student_count,
                    'room_capacity': room_capacity,
                    'overage': student_count - room_capacity,
                    'message': f"Room {g['room']} capacity exceeded: {student_count} students in room with {room_capacity} capacity for {g['section']} {g['course']} on {g['day']} at {g['time']}"
                })
    
    # Check room type mismatch (room type must match course type)
    for g in schedule:
        if g['room'] == 'ONLINE' or g['room'] == 'NO ROOM':
            continue
            
        # Get course type
        course = next((c for c in courses if c['code'] == g['course']), None)
        room = next((r for r in rooms_list if r['room'] == g['room']), None)
        
        if course and room:
            course_type = course.get('type', 'Lecture')
            room_type = room.get('type', 'Lecture')
            
            # Room type MUST match course type
            if course_type != room_type:
                end_time = calculate_end_time(g['time'], g['duration'])
                conflicts.append({
                    'type': 'room_type_mismatch',
                    'section': g['section'],
                    'course': g['course'],
                    'room': g['room'],
                    'day': g['day'],
                    'time': g['time'],
                    'class_time': f"{g['time']}-{end_time}",
                    'course_type': course_type,
                    'room_type': room_type,
                    'message': f"Room type mismatch: {g['course']} (type: {course_type}) assigned to {g['room']} (type: {room_type}) for {g['section']} on {g['day']} at {g['time']}-{end_time}"
                })

    return conflicts

# ============================================================================
# FITNESS CALCULATION
# ============================================================================

def calculate_fitness(schedule):
    """Enhanced fitness function with better weight distribution and room balance"""
    if not schedule:
        return -999999
    
    score = 0
    teachers_info = get_all_teachers_info()

    # 1. CONFLICTS (most critical - heavily penalized)
    conflicts = detect_conflicts(schedule)
    conflict_types = {}
    for c in conflicts:
        ctype = c['type']
        if ctype not in conflict_types:
            conflict_types[ctype] = 0
        conflict_types[ctype] += 1

    # Different penalties for different conflict types
    score -= conflict_types.get('teacher_overlap', 0) * 2000
    score -= conflict_types.get('section_overlap', 0) * 2000
    score -= conflict_types.get('room_overlap', 0) * 1500
    score -= conflict_types.get('teacher_availability', 0) * 2500
    score -= conflict_types.get('online_overlap', 0) * 1500
    score -= conflict_types.get('break_violation', 0) * 800
    score -= conflict_types.get('teacher_online_offline_mix', 0) * 500
    score -= conflict_types.get('section_online_offline_mix', 0) * 500
    score -= conflict_types.get('section_daily_hours_exceeded', 0) * 1200
    score -= conflict_types.get('teacher_max_units_exceeded', 0) * 1200
    score -= conflict_types.get('room_capacity_exceeded', 0) * 1800
    score -= conflict_types.get('teacher_course_mismatch', 0) * 3000
    score -= conflict_types.get('no_available_teacher', 0) * 5000

    # 2. TEACHER AVAILABILITY (bonus for compliance)
    for g in schedule:
        if g['teacher'] == 'NO AVAILABLE TEACHER':
            continue
        teacher_info = next((t for t in teachers_info if t['id'] == g['teacher']), None)
        if teacher_info and is_teacher_available(teacher_info, g['day'], g['time'], g['duration']):
            score += 100

    # 3. BREAK TIME COMPLIANCE (bonus for proper breaks)
    break_assignments = get_break_assignments(schedule)
    for key, break_start in break_assignments.items():
        entity_type, entity_id, day, break_type = key
        break_end = break_start + BREAK_DURATION

        has_violation = False
        for g in schedule:
            if g['day'] != day:
                continue
            if entity_type == 'section' and g['section'] != entity_id:
                continue
            if entity_type == 'teacher' and g['teacher'] != entity_id:
                continue

            class_start = time_map[g['time']]
            class_end = class_start + g['duration']

            if (class_start < break_end) and (class_end > break_start):
                has_violation = True
                break

        if not has_violation:
            score += 150

    # 4. TIME DISTRIBUTION (prefer balanced distribution)
    time_usage = {slot: sum(1 for g in schedule if g['time'] == slot) for slot in time_slots}
    if time_usage:
        time_std = (max(time_usage.values()) - min(time_usage.values()))
        score -= time_std * 15

    # 5. TEACHER WORKLOAD BALANCE
    teacher_hours = {t['id']: 0 for t in teachers_info}
    for g in schedule:
        if g['teacher'] != 'NO AVAILABLE TEACHER':
            teacher_hours[g['teacher']] += g['duration']
    if teacher_hours:
        workload_values = list(teacher_hours.values())
        if max(workload_values) > 0:
            workload_diff = max(workload_values) - min(workload_values)
            score -= workload_diff * 30

    # 6. CONTIGUOUS TIME BLOCKS (prefer consecutive classes)
    for sec in sections_list:
        for day in days:
            day_classes = sorted([g for g in schedule if g['section'] == sec['name'] and g['day'] == day],
                                key=lambda x: time_map[x['time']])
            for i in range(len(day_classes) - 1):
                current_end = time_map[day_classes[i]['time']] + day_classes[i]['duration']
                next_start = time_map[day_classes[i+1]['time']]
                gap = next_start - current_end
                if gap == 0:
                    score += 20
                elif gap == 1:
                    score += 10
                elif gap > 2:
                    score -= gap * 5

    # 7. EARLY TIME PREFERENCE (prefer morning classes)
    for g in schedule:
        hour = time_map[g['time']]
        if hour <= 10:
            score += 5
        elif hour >= 17:
            score -= 3

    # 8. DAY DISTRIBUTION (prefer classes spread across days)
    for sec in sections_list:
        for course_code in sec['courses']:
            course_classes = [g for g in schedule if g['section'] == sec['name'] and g['course'] == course_code]
            unique_days = len(set(g['day'] for g in course_classes))
            course_obj = next((c for c in courses if c['code'] == course_code), None)
            if course_obj and unique_days == course_obj['days']:
                score += 25

    # 9. ROOM DISTRIBUTION (prefer balanced room usage)
    room_usage = {}
    for g in schedule:
        if g['room'] not in ['ONLINE', 'NO ROOM']:
            room_usage[g['room']] = room_usage.get(g['room'], 0) + 1

    if len(room_usage) > 1:
        usage_values = list(room_usage.values())
        room_balance = max(usage_values) - min(usage_values)
        score -= room_balance * 10  # Penalize rooms that are over-used
        
        # Bonus for using more rooms (better distribution)
        unique_rooms_used = len(room_usage)
        total_available_rooms = len([r for r in rooms_list if r['type'] != 'Online'])
        if total_available_rooms > 0:
            usage_ratio = unique_rooms_used / total_available_rooms
            score += int(usage_ratio * 100)  # Bonus for using more available rooms

    return score

# ============================================================================
# GENETIC ALGORITHM
# ============================================================================

population_size = 25
generations = 50
csp_initial_population = 15
elite_size = 3
mutation_rate = 0.2

# PHASE 1: Generate initial population using enhanced CSP
population = []

print("Generating initial population using CSP...")
sys.stdout.flush()

for i in range(csp_initial_population):
    print(f"Generating CSP schedule {i+1}/{csp_initial_population}...")
    sys.stdout.flush()
    csp_schedule = generate_csp_schedule()
    if csp_schedule:
        population.append(csp_schedule)
        print(f"Successfully generated schedule {i+1}")
        sys.stdout.flush()
    else:
        print(f"Failed to generate schedule {i+1}")
        sys.stdout.flush()

if len(population) == 0:
    fallback_schedule = []
    for sec in sections_list:
        for course_code in sec['courses']:
            course_obj = next((c for c in courses if c['code'] == course_code), None)
            if not course_obj:
                continue
            num_sessions = course_obj['days']
            
            qualified_teachers = [t for t in get_all_teachers_info() if course_code in t['courses']]
            
            if not qualified_teachers:
                teacher_id = 'NO AVAILABLE TEACHER'
                room_name = 'ONLINE' if course_obj['type'] == 'Online' else 'NO ROOM'
            else:
                teacher = qualified_teachers[0]
                teacher_id = teacher['id']
                
                section = next(s for s in sections_list if s['name'] == sec['name'])
                student_count = section.get('student_count', 30)
                
                # Find ALL appropriate rooms (matching type AND capacity)
                appropriate_rooms = [
                    r for r in rooms_list 
                    if r['type'] == course_obj['type'] and r.get('capacity', 40) >= student_count
                ]
                
                # Fallback: if no rooms match both, try just type
                if not appropriate_rooms:
                    appropriate_rooms = [r for r in rooms_list if r['type'] == course_obj['type']]
                
                # RANDOMLY select from appropriate rooms instead of always picking first
                room_name = random.choice(appropriate_rooms)['room'] if appropriate_rooms else rooms_list[0]['room']
            
            for session in range(num_sessions):
                fallback_schedule.append({
                    'section': sec['name'],
                    'course': course_code,
                    'teacher': teacher_id,
                    'room': room_name,
                    'day': days[session % len(days)],
                    'time': time_slots[session % len(time_slots)],
                    'duration': get_hours_per_session(course_obj)
                })
    
    if fallback_schedule:
        population.append(fallback_schedule)

if len(population) < population_size and len(population) > 0:
    attempts = 0
    max_attempts = population_size * 3
    while len(population) < population_size and attempts < max_attempts:
        if population:
            base = [dict(g) for g in random.choice(population)]
            for _ in range(random.randint(1, 3)):
                if base:
                    gene = random.choice(base)
                    if gene['teacher'] != 'NO AVAILABLE TEACHER':
                        mutation_choice = random.random()
                        if mutation_choice < 0.4:
                            gene['time'] = random.choice(time_slots)
                        elif mutation_choice < 0.8:
                            gene['day'] = random.choice(days)
                        else:
                            gene['time'] = random.choice(time_slots)
                            gene['day'] = random.choice(days)
            population.append(base)
        attempts += 1

if len(population) == 0:
    error_output = {
        "error": "Failed to generate any valid schedules",
        "title": title,
        "generated_schedule": [],
        "conflicted_schedule": [],
        "teacher_schedules": [],
        "section_schedules": [],
        "room_schedules": [],
        "Number_of_Without_Conflict_Schedule": 0,
        "Number_of_Conflicted": 0,
        "Total_Schedule": 0,
        "Number_of_Expected_Schedule": 0,
        "statistics": {
            "completion_rate": 0,
            "final_fitness": 0,
            "diversity": 0,
            "generation": 0,
            "total_conflicts": 0,
            "conflict_summary": {
                "total_conflicts": 0,
                "conflict_breakdown": {},
                "has_conflicts": False
            }
        }
    }
    error_json = json.dumps(error_output, indent=4)
    re_encrypted = encrypt(error_json, passphrase)
    sys.stdout.write(re_encrypted + "\n")
    sys.stdout.flush()
    sys.exit(1)

all_generation_bests = []
best_fitness_ever = float('-inf')
stagnation_counter = 0

print("Starting genetic algorithm optimization...")
sys.stdout.flush()

for g in range(generations):
    scored = []
    for s in population:
        if s:
            fitness = calculate_fitness(s)
            scored.append((fitness, s))
    
    if not scored:
        break
    
    scored.sort(key=lambda x: x[0], reverse=True)
    generation_best = scored[0][1]
    generation_best_fitness = scored[0][0]

    diversity = calculate_schedule_diversity(population)

    all_generation_bests.append({
        'generation': g,
        'fitness': generation_best_fitness,
        'diversity': diversity,
        'schedule': [dict(entry) for entry in generation_best]
    })

    if g % 5 == 0 or g == generations - 1:
        pass

    if generation_best_fitness > best_fitness_ever:
        best_fitness_ever = generation_best_fitness
        stagnation_counter = 0
    else:
        stagnation_counter += 1

    elite = [s for f, s in scored[:elite_size]]

    top_performers = [s for f, s in scored[:population_size // 2]]
    new_pop = elite.copy()

    while len(new_pop) < population_size:
        p1, p2 = random.sample(top_performers, 2)

        if len(p1) >= 4:
            point1 = random.randint(1, len(p1) // 3)
            point2 = random.randint(2 * len(p1) // 3, len(p1) - 1)
            child = p1[:point1] + p2[point1:point2] + p1[point2:]
        else:
            point = len(p1) // 2
            child = p1[:point] + p2[point:]

        child = [dict(g) for g in child]

        effective_mutation_rate = mutation_rate
        if stagnation_counter > 10:
            effective_mutation_rate = min(0.4, mutation_rate * 1.5)

        if random.random() < effective_mutation_rate and child:
            num_mutations = random.randint(1, 2)
            for _ in range(num_mutations):
                gene = random.choice(child)
                if gene['teacher'] != 'NO AVAILABLE TEACHER':
                    mutation_type = random.choice(['time', 'day', 'both', 'room'])
                    if mutation_type == 'time':
                        gene["time"] = random.choice(time_slots)
                    elif mutation_type == 'day':
                        gene["day"] = random.choice(days)
                    elif mutation_type == 'room':
                        # Mutate room while respecting constraints
                        course_obj = next((c for c in courses if c['code'] == gene['course']), None)
                        if course_obj and course_obj['type'] != 'Online':
                            section = next((s for s in sections_list if s['name'] == gene['section']), None)
                            if section:
                                student_count = section.get('student_count', 30)
                                valid_rooms = [
                                    r['room'] for r in rooms_list 
                                    if r['type'] == course_obj['type'] and r.get('capacity', 40) >= student_count
                                ]
                                if valid_rooms and gene['room'] in valid_rooms:
                                    # Pick a different room from valid options
                                    other_rooms = [r for r in valid_rooms if r != gene['room']]
                                    if other_rooms:
                                        gene['room'] = random.choice(other_rooms)
                    else:  # 'both'
                        gene["time"] = random.choice(time_slots)
                        gene["day"] = random.choice(days)

        new_pop.append(child)

    population = new_pop

print("Finalizing best schedule...")
sys.stdout.flush()

if not all_generation_bests:
    if population:
        scored = [(calculate_fitness(s), s) for s in population if s]
        if scored:
            scored.sort(key=lambda x: x[0], reverse=True)
            all_generation_bests = [{
                'generation': 0,
                'fitness': scored[0][0],
                'diversity': 0,
                'schedule': [dict(entry) for entry in scored[0][1]]
            }]
        else:
            sys.exit(1)
    else:
        sys.exit(1)

all_generation_bests.sort(key=lambda x: x['fitness'], reverse=True)

final_best = all_generation_bests[0]
best_schedule = [dict(entry) for entry in final_best['schedule']]
best_fitness = final_best['fitness']

if not best_schedule:
    sys.exit(1)

# ============================================================================
# PREPARE OUTPUT
# ============================================================================

final_conflicts = detect_conflicts(best_schedule)
conflict_breakdown = {}
for c in final_conflicts:
    ctype = c['type']
    if ctype not in conflict_breakdown:
        conflict_breakdown[ctype] = 0
    conflict_breakdown[ctype] += 1

total_expected, expected_by_section = calculate_expected_schedules()
expected, actual, created = analyze_schedule_completeness(best_schedule)
completion_rate = (len(best_schedule) / total_expected * 100) if total_expected > 0 else 0

conflicted_schedule = []
conflict_free_schedule = []

for entry in best_schedule:
    has_conflict = False
    entry_conflicts = []
    
    for conflict in final_conflicts:
        if (conflict.get('section') == entry['section'] and 
            conflict.get('course') == entry['course'] and
            conflict.get('day') == entry['day'] and
            conflict.get('time') == entry['time']):
            has_conflict = True
            entry_conflicts.append(conflict['message'])
    
    schedule_entry = {
        'section': entry['section'],
        'course': entry['course'],
        'teacher': entry['teacher'],
        'room': entry['room'],
        'day': entry['day'],
        'time': entry['time'],
        'end_time': calculate_end_time(entry['time'], entry['duration']),
        'duration': entry['duration']
    }
    
    if has_conflict:
        schedule_entry['conflicts'] = entry_conflicts
        conflicted_schedule.append(schedule_entry)
    else:
        conflict_free_schedule.append(schedule_entry)

teacher_schedules = {}
for teacher_info in get_all_teachers_info():
    tid = teacher_info['id']
    teacher_classes = [g for g in best_schedule if g['teacher'] == tid]
    
    if teacher_classes:
        teacher_schedules[tid] = {
            'teacher_id': tid,
            'teacher_name': teacher_info['name'],
            'classes': []
        }
        
        for g in teacher_classes:
            teacher_schedules[tid]['classes'].append({
                'section': g['section'],
                'course': g['course'],
                'room': g['room'],
                'day': g['day'],
                'time': g['time'],
                'end_time': calculate_end_time(g['time'], g['duration']),
                'duration': g['duration']
            })

section_schedules = {}
for sec in sections_list:
    section_classes = [g for g in best_schedule if g['section'] == sec['name']]
    
    if section_classes:
        section_schedules[sec['name']] = {
            'section_name': sec['name'],
            'classes': []
        }
        
        for g in section_classes:
            section_schedules[sec['name']]['classes'].append({
                'course': g['course'],
                'teacher': g['teacher'],
                'room': g['room'],
                'day': g['day'],
                'time': g['time'],
                'end_time': calculate_end_time(g['time'], g['duration']),
                'duration': g['duration']
            })

room_schedules = {}
for room in rooms_list:
    room_classes = [g for g in best_schedule if g['room'] == room['room']]
    
    if room_classes:
        room_schedules[room['room']] = {
            'room_name': room['room'],
            'room_type': room['type'],
            'classes': []
        }
        
        for g in room_classes:
            room_schedules[room['room']]['classes'].append({
                'section': g['section'],
                'course': g['course'],
                'teacher': g['teacher'],
                'day': g['day'],
                'time': g['time'],
                'end_time': calculate_end_time(g['time'], g['duration']),
                'duration': g['duration']
            })

output = {
    "title": title,
    "generated_schedule": conflict_free_schedule,
    "conflicted_schedule": conflicted_schedule,
    "expected_schedule": total_expected,
    "teacher_schedules": list(teacher_schedules.values()),
    "section_schedules": list(section_schedules.values()),
    "room_schedules": list(room_schedules.values()),
    "Number_of_Without_Conflict_Schedule": len(conflict_free_schedule),
    "Number_of_Conflicted": len(conflicted_schedule),
    "Total_Schedule": len(best_schedule),
    "Number_of_Expected_Schedule": total_expected,
    "statistics": {
        "completion_rate": round(completion_rate, 2),
        "final_fitness": round(best_fitness, 2),
        "diversity": round(final_best['diversity'], 2),
        "generation": final_best['generation'],
        "total_conflicts": len(final_conflicts),
        "conflict_summary": {
            "total_conflicts": len(final_conflicts),
            "conflict_breakdown": conflict_breakdown,
            "has_conflicts": len(final_conflicts) > 0
        },
        "expected_by_section": expected,
        "actual_by_section": actual,
        "courses_created": created
    },
    "conflicts": [
        {
            'type': c['type'],
            'message': c['message'],
            'details': {k: v for k, v in c.items() if k not in ['type', 'message']}
        }
        for c in final_conflicts
    ]
}

output_json = json.dumps(output, indent=4)

encrypted_output = encrypt(output_json, passphrase)

sys.stdout.write(encrypted_output + "\n")
sys.stdout.flush()