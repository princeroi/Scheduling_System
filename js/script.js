let courses = [];
let sections = [];
let teacherLoads = [];
let teacherAvailability = [];
let rooms = [];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Sidebar Navigation
function switchTab(tabName) {
    // Hide all sections
    document.getElementById('generate-section').style.display = 'none';
    document.getElementById('schedules-section').style.display = 'none';
    
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section and activate menu item
    if (tabName === 'generate') {
        document.getElementById('generate-section').style.display = 'block';
        document.getElementById('menu-generate').classList.add('active');
    } else if (tabName === 'schedules') {
        document.getElementById('schedules-section').style.display = 'block';
        document.getElementById('menu-schedules').classList.add('active');
    }
}

// Load Sample Data
function loadSampleData() {
    document.getElementById('scheduleTitle').value = 'My School Schedule';
    document.getElementById('firstBreak').value = 60;
    document.getElementById('secondBreak').value = 120;

    courses = [
        { id: 1, courseCode: 'AASI 302', courseTitle: 'Auditing and Assurance: Specialized Industries', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 2, courseCode: 'ACCT 101', courseTitle: 'Financial Accounting', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 3, courseCode: 'MGMT 201', courseTitle: 'Principles of Management', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 4, courseCode: 'MKTG 210', courseTitle: 'Marketing Fundamentals', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 5, courseCode: 'ECON 102', courseTitle: 'Macroeconomics', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 6, courseCode: 'ACCT 202', courseTitle: 'Managerial Accounting', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 7, courseCode: 'IT 105', courseTitle: 'Computer Applications in Business', subjectType: 'LAB', units: '2', hoursPerWeek: 120, daysPerWeek: 1 },
        { id: 8, courseCode: 'STAT 301', courseTitle: 'Business Statistics', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 9, courseCode: 'BUSLAW 110', courseTitle: 'Business Law and Ethics', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 },
        { id: 10, courseCode: 'ENTR 101', courseTitle: 'Entrepreneurship', subjectType: 'LECTURE', units: '3', hoursPerWeek: 180, daysPerWeek: 2 }
    ];

    sections = [
        { id: 1, sectionName: 'III-A1', sectionStudents: '30', courseCodes: 'AASI 302' },
        { id: 2, sectionName: 'I-B2', sectionStudents: '35', courseCodes: 'ACCT 101' },
        { id: 3, sectionName: 'II-C3', sectionStudents: '45', courseCodes: 'MGMT 201, ECON 102' },
        { id: 4, sectionName: 'III-D1', sectionStudents: '40', courseCodes: 'ACCT 202, STAT 301' },
        { id: 5, sectionName: 'I-A3', sectionStudents: '32', courseCodes: 'MKTG 210' },
        { id: 6, sectionName: 'IV-B1', sectionStudents: '28', courseCodes: 'BUSLAW 110, ENTR 101' },
        { id: 7, sectionName: 'II-A2', sectionStudents: '36', courseCodes: 'IT 105' }
    ];

    teacherLoads = [
        { id: 1, fID: 'E_001', name: 'ABDON, MARK RONDOL', maxUnits: 3, courses: 'AASI 302' },
        { id: 2, fID: 'E_002', name: 'SMITH, JOHN DOE', maxUnits: 6, courses: 'ACCT 101, AASI 302' },
        { id: 3, fID: 'E_003', name: 'GARCIA, MARIA LOPEZ', maxUnits: 9, courses: 'MGMT 201, ENTR 101' },
        { id: 4, fID: 'E_004', name: 'WILLIAMS, ROBERT', maxUnits: 6, courses: 'ECON 102, STAT 301' },
        { id: 5, fID: 'E_005', name: 'CRUZ, ANA MARIE', maxUnits: 6, courses: 'ACCT 202' },
        { id: 6, fID: 'E_006', name: 'KIM, STEVEN', maxUnits: 4, courses: 'IT 105' },
        { id: 7, fID: 'E_007', name: 'REYES, LUIS MIGUEL', maxUnits: 6, courses: 'BUSLAW 110, MKTG 210' }
    ];

    teacherAvailability = [
        {
            id: 1, fID: 'E_001', name: 'abdon, mark rondol', status: 'FULL-TIME',
            schedules: [{ id: 1, days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], startTime: 8, endTime: 17 }]
        },
        {
            id: 2, fID: 'E_002', name: 'smith, john doe', status: 'PART-TIME',
            schedules: [
                { id: 1, days: ['MON', 'WED', 'FRI'], startTime: 8, endTime: 12 },
                { id: 2, days: ['TUE', 'THU'], startTime: 13, endTime: 17 }
            ]
        },
        {
            id: 3, fID: 'E_003', name: 'garcia, maria lopez', status: 'FULL-TIME',
            schedules: [
                { id: 1, days: ['MON', 'TUE'], startTime: 9, endTime: 16 },
                { id: 2, days: ['THU', 'FRI'], startTime: 8, endTime: 15 }
            ]
        },
        {
            id: 4, fID: 'E_004', name: 'williams, robert', status: 'PART-TIME',
            schedules: [{ id: 1, days: ['WED', 'FRI'], startTime: 10, endTime: 17 }]
        },
        {
            id: 5, fID: 'E_005', name: 'cruz, ana marie', status: 'FULL-TIME',
            schedules: [
                { id: 1, days: ['MON', 'THU'], startTime: 8, endTime: 12 },
                { id: 2, days: ['TUE', 'WED'], startTime: 13, endTime: 17 }
            ]
        },
        {
            id: 6, fID: 'E_006', name: 'kim, steven', status: 'PART-TIME',
            schedules: [{ id: 1, days: ['SAT'], startTime: 8, endTime: 17 }]
        },
        {
            id: 7, fID: 'E_007', name: 'reyes, luis miguel', status: 'FULL-TIME',
            schedules: [{ id: 1, days: ['MON', 'WED', 'FRI'], startTime: 8, endTime: 17 }]
        }
    ];

    rooms = [
        { id: 1, roomName: 'Room 101', roomType: 'LECTURE', roomCapacity: '40' },
        { id: 2, roomName: 'Room 102', roomType: 'LAB', roomCapacity: '30' },
        { id: 3, roomName: 'Room 201', roomType: 'LECTURE', roomCapacity: '45' },
        { id: 4, roomName: 'Room 202', roomType: 'LECTURE', roomCapacity: '50' },
        { id: 5, roomName: 'Computer Lab A', roomType: 'LAB', roomCapacity: '25' },
        { id: 6, roomName: 'Audio-Visual Room', roomType: 'LECTURE', roomCapacity: '60' },
        { id: 7, roomName: 'Room 303', roomType: 'LECTURE', roomCapacity: '35' }
    ];

    renderAll();
}

// Course Management
function addCourse() {
    courses.push({ id: Date.now(), courseCode: '', courseTitle: '', subjectType: 'LECTURE', units: '', hoursPerWeek: '', daysPerWeek: '' });
    renderCourses();
}

function removeCourse(id) {
    courses = courses.filter(c => c.id !== id);
    renderCourses();
}

function renderCourses() {
    const tbody = document.getElementById('coursesTable');
    tbody.innerHTML = courses.map(course => `
        <tr>
            <td><input type="text" class="form-control form-control-sm" value="${course.courseCode}" onchange="updateCourse(${course.id}, 'courseCode', this.value)"></td>
            <td><input type="text" class="form-control form-control-sm" value="${course.courseTitle}" onchange="updateCourse(${course.id}, 'courseTitle', this.value)"></td>
            <td>
                <select class="form-select form-select-sm" onchange="updateCourse(${course.id}, 'subjectType', this.value)">
                    <option value="LECTURE" ${course.subjectType === 'LECTURE' ? 'selected' : ''}>LECTURE</option>
                    <option value="LAB" ${course.subjectType === 'LAB' ? 'selected' : ''}>LAB</option>
                </select>
            </td>
            <td><input type="number" class="form-control form-control-sm" value="${course.units}" onchange="updateCourse(${course.id}, 'units', this.value)"></td>
            <td><input type="number" class="form-control form-control-sm" value="${course.hoursPerWeek}" onchange="updateCourse(${course.id}, 'hoursPerWeek', this.value)"></td>
            <td><input type="number" class="form-control form-control-sm" value="${course.daysPerWeek}" onchange="updateCourse(${course.id}, 'daysPerWeek', this.value)"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeCourse(${course.id})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function updateCourse(id, field, value) {
    const course = courses.find(c => c.id === id);
    if (course) course[field] = value;
}

// Section Management
function addSection() {
    sections.push({ id: Date.now(), sectionName: '', sectionStudents: '', courseCodes: '' });
    renderSections();
}

function removeSection(id) {
    sections = sections.filter(s => s.id !== id);
    renderSections();
}

function renderSections() {
    const tbody = document.getElementById('sectionsTable');
    tbody.innerHTML = sections.map(section => `
        <tr>
            <td><input type="text" class="form-control form-control-sm" value="${section.sectionName}" onchange="updateSection(${section.id}, 'sectionName', this.value)"></td>
            <td><input type="number" class="form-control form-control-sm" value="${section.sectionStudents}" onchange="updateSection(${section.id}, 'sectionStudents', this.value)"></td>
            <td><input type="text" class="form-control form-control-sm" value="${section.courseCodes}" onchange="updateSection(${section.id}, 'courseCodes', this.value)" placeholder="e.g., AASI 302, ACCT 101"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeSection(${section.id})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function updateSection(id, field, value) {
    const section = sections.find(s => s.id === id);
    if (section) section[field] = value;
}

// Teacher Load Management
function addTeacherLoad() {
    teacherLoads.push({ id: Date.now(), fID: '', name: '', maxUnits: '', courses: '' });
    renderTeacherLoads();
}

function removeTeacherLoad(id) {
    teacherLoads = teacherLoads.filter(t => t.id !== id);
    renderTeacherLoads();
}

function renderTeacherLoads() {
    const tbody = document.getElementById('teacherLoadTable');
    tbody.innerHTML = teacherLoads.map(teacher => `
        <tr>
            <td><input type="text" class="form-control form-control-sm" value="${teacher.fID}" onchange="updateTeacherLoad(${teacher.id}, 'fID', this.value)"></td>
            <td><input type="text" class="form-control form-control-sm" value="${teacher.name}" onchange="updateTeacherLoad(${teacher.id}, 'name', this.value)"></td>
            <td><input type="number" class="form-control form-control-sm" value="${teacher.maxUnits}" onchange="updateTeacherLoad(${teacher.id}, 'maxUnits', this.value)"></td>
            <td><input type="text" class="form-control form-control-sm" value="${teacher.courses}" onchange="updateTeacherLoad(${teacher.id}, 'courses', this.value)" placeholder="e.g., AASI 302, ACCT 101"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeTeacherLoad(${teacher.id})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function updateTeacherLoad(id, field, value) {
    const teacher = teacherLoads.find(t => t.id === id);
    if (teacher) teacher[field] = value;
}

// Teacher Availability Management
function addTeacherAvailability() {
    teacherAvailability.push({
        id: Date.now(),
        fID: '',
        name: '',
        status: 'FULL-TIME',
        schedules: [{ id: Date.now(), days: [], startTime: 8, endTime: 17 }]
    });
    renderTeacherAvailability();
}

function removeTeacherAvailability(id) {
    teacherAvailability = teacherAvailability.filter(t => t.id !== id);
    renderTeacherAvailability();
}

function addScheduleToTeacher(teacherId) {
    const teacher = teacherAvailability.find(t => t.id === teacherId);
    if (teacher) {
        teacher.schedules.push({ id: Date.now(), days: [], startTime: 8, endTime: 17 });
        renderTeacherAvailability();
    }
}

function removeScheduleFromTeacher(teacherId, scheduleId) {
    const teacher = teacherAvailability.find(t => t.id === teacherId);
    if (teacher) {
        teacher.schedules = teacher.schedules.filter(s => s.id !== scheduleId);
        renderTeacherAvailability();
    }
}

function updateTeacher(id, field, value) {
    const teacher = teacherAvailability.find(t => t.id === id);
    if (teacher) teacher[field] = value;
}

function updateSchedule(teacherId, scheduleId, field, value) {
    const teacher = teacherAvailability.find(t => t.id === teacherId);
    if (teacher) {
        const schedule = teacher.schedules.find(s => s.id === scheduleId);
        if (schedule) schedule[field] = parseInt(value);
    }
}

function toggleDay(teacherId, scheduleId, day) {
    const teacher = teacherAvailability.find(t => t.id === teacherId);
    if (teacher) {
        const schedule = teacher.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            if (schedule.days.includes(day)) {
                schedule.days = schedule.days.filter(d => d !== day);
            } else {
                schedule.days.push(day);
            }
            renderTeacherAvailability();
        }
    }
}

function renderTeacherAvailability() {
    const container = document.getElementById('teacherAvailabilityContainer');
    container.innerHTML = teacherAvailability.map(teacher => `
        <div class="card teacher-card mb-3">
            <div class="card-body">
                <div class="row g-3 mb-3">
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold">Faculty ID</label>
                        <input type="text" class="form-control form-control-sm" value="${teacher.fID}" onchange="updateTeacher(${teacher.id}, 'fID', this.value)">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold">Name</label>
                        <input type="text" class="form-control form-control-sm" value="${teacher.name}" onchange="updateTeacher(${teacher.id}, 'name', this.value)">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold">Status</label>
                        <select class="form-select form-select-sm" onchange="updateTeacher(${teacher.id}, 'status', this.value)">
                            <option value="FULL-TIME" ${teacher.status === 'FULL-TIME' ? 'selected' : ''}>FULL-TIME</option>
                            <option value="PART-TIME" ${teacher.status === 'PART-TIME' ? 'selected' : ''}>PART-TIME</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="btn btn-danger btn-sm w-100" onclick="removeTeacherAvailability(${teacher.id})">
                            <i class="fas fa-trash me-1"></i>Remove Teacher
                        </button>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label small fw-semibold mb-0">Availability Schedules</label>
                    <button class="btn btn-primary btn-sm" onclick="addScheduleToTeacher(${teacher.id})">
                        <i class="fas fa-plus me-1"></i>Add Schedule
                    </button>
                </div>
                
                ${teacher.schedules.map(schedule => `
                    <div class="card schedule-item mb-2">
                        <div class="card-body p-3">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-6">
                                    <label class="form-label small fw-semibold">Days</label>
                                    <div class="d-flex gap-1 flex-wrap">
                                        ${DAYS.map(day => `
                                            <button type="button" class="btn btn-sm day-btn ${schedule.days.includes(day) ? 'active btn-primary' : 'btn-outline-secondary'}" 
                                                    onclick="toggleDay(${teacher.id}, ${schedule.id}, '${day}')">
                                                ${day}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label small fw-semibold">Start Time</label>
                                    <input type="number" class="form-control form-control-sm" min="0" max="23" value="${schedule.startTime}" 
                                           onchange="updateSchedule(${teacher.id}, ${schedule.id}, 'startTime', this.value)">
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label small fw-semibold">End Time</label>
                                    <input type="number" class="form-control form-control-sm" min="0" max="23" value="${schedule.endTime}" 
                                           onchange="updateSchedule(${teacher.id}, ${schedule.id}, 'endTime', this.value)">
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-danger btn-sm w-100" onclick="removeScheduleFromTeacher(${teacher.id}, ${schedule.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Room Management
function addRoom() {
    rooms.push({ id: Date.now(), roomName: '', roomType: 'LECTURE', roomCapacity: '' });
    renderRooms();
}

function removeRoom(id) {
    rooms = rooms.filter(r => r.id !== id);
    renderRooms();
}

function renderRooms() {
    const tbody = document.getElementById('roomsTable');
    tbody.innerHTML = rooms.map(room => `
        <tr>
            <td><input type="text" class="form-control form-control-sm" value="${room.roomName}" onchange="updateRoom(${room.id}, 'roomName', this.value)"></td>
            <td>
                <select class="form-select form-select-sm" onchange="updateRoom(${room.id}, 'roomType', this.value)">
                    <option value="LECTURE" ${room.roomType === 'LECTURE' ? 'selected' : ''}>LECTURE</option>
                    <option value="LAB" ${room.roomType === 'LAB' ? 'selected' : ''}>LAB</option>
                </select>
            </td>
            <td><input type="number" class="form-control form-control-sm" value="${room.roomCapacity}" onchange="updateRoom(${room.id}, 'roomCapacity', this.value)"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeRoom(${room.id})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function updateRoom(id, field, value) {
    const room = rooms.find(r => r.id === id);
    if (room) room[field] = value;
}

// Render All
function renderAll() {
    renderCourses();
    renderSections();
    renderTeacherLoads();
    renderTeacherAvailability();
    renderRooms();
}

// Initialize
renderAll();

// Schedule Generation Functions

function generateHoursArray(start, end) {
    const hours = [];
    for (let i = start; i <= end; i++) {
        hours.push(i);
    }
    return hours;
}

function generateScheduleJSON() {
    const teacherLoadObj = {};
    teacherLoads.forEach(teacher => {
        teacherLoadObj[teacher.fID] = {
            fID: teacher.fID,
            maxUnits: parseInt(teacher.maxUnits) || 0,
            name: teacher.name,
            courses: teacher.courses ? teacher.courses.split(',').map(c => c.trim()) : []
        };
    });

    const teacherAvailabilityObj = {};
    teacherAvailability.forEach(teacher => {
        const availability = {
            MON: [],
            TUE: [],
            WED: [],
            THU: [],
            FRI: [],
            SAT: []
        };

        teacher.schedules.forEach(schedule => {
            const hours = generateHoursArray(schedule.startTime, schedule.endTime);
            schedule.days.forEach(day => {
                availability[day] = [...new Set([...availability[day], ...hours])].sort((a, b) => a - b);
            });
        });

        teacherAvailabilityObj[teacher.fID] = {
            fID: teacher.fID,
            name: teacher.name,
            status: teacher.status,
            availability
        };
    });

    const output = {
        Title: document.getElementById('scheduleTitle').value,
        firstBreakTime: parseInt(document.getElementById('firstBreak').value) || 0,
        secondBreakTime: parseInt(document.getElementById('secondBreak').value) || 0,
        TeacherLoad: teacherLoadObj,
        TeacherAvailability: teacherAvailabilityObj,
        RoomInfo: rooms.map(room => ({
            roomName: room.roomName,
            roomType: room.roomType,
            roomCapacity: room.roomCapacity
        })),
        Subject: courses.map(course => ({
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
            subjectType: course.subjectType,
            units: course.units,
            hoursPerWeek: parseInt(course.hoursPerWeek) || 0,
            daysPerWeek: parseInt(course.daysPerWeek) || 0
        })),
        Section: sections.map(section => ({
            sectionName: section.sectionName,
            sectionStudents: section.sectionStudents,
            courseCodes: section.courseCodes ? section.courseCodes.split(',').map(c => c.trim()) : []
        }))
    };

    return output;
}

function generateAndSubmit() {
    const scheduleJSON = generateScheduleJSON();
    const errors = [];
    const warnings = [];

    // Validation logic (same as before)
    if (!scheduleJSON.Title?.trim()) errors.push("Schedule Title is required");
    if (!scheduleJSON.firstBreakTime || scheduleJSON.firstBreakTime <= 0)
        errors.push("First Break must be greater than 0 minutes");
    if (!scheduleJSON.secondBreakTime || scheduleJSON.secondBreakTime <= 0)
        errors.push("Second Break must be greater than 0 minutes");

    if (courses.length === 0) {
        errors.push("At least one Course must be added");
    } else {
        courses.forEach((c, i) => {
            if (!c.courseCode?.trim()) errors.push(`Course ${i+1}: Course Code is required`);
            if (!c.courseTitle?.trim()) errors.push(`Course ${i+1}: Course Title is required`);
            if (!c.units?.trim()) errors.push(`Course ${i+1}: Units is required`);
            else if (parseInt(c.units) <= 0) errors.push(`Course ${i+1} (${c.courseCode}): Units must be > 0`);
            if (!c.hoursPerWeek || c.hoursPerWeek <= 0) errors.push(`Course ${i+1} (${c.courseCode}): Hours/Week must be > 0`);
            if (!c.daysPerWeek || c.daysPerWeek <= 0) errors.push(`Course ${i+1} (${c.courseCode}): Days/Week must be > 0`);
            else if (c.daysPerWeek > 6) errors.push(`Course ${i+1} (${c.courseCode}): Days/Week cannot exceed 6`);
        });
    }

    if (sections.length === 0) {
        errors.push("At least one Section must be added");
    } else {
        sections.forEach((s, i) => {
            if (!s.sectionName?.trim()) errors.push(`Section ${i+1}: Section Name is required`);
            if (!s.sectionStudents || s.sectionStudents <= 0) errors.push(`Section ${i+1} (${s.sectionName}): Number of Students is required and must be > 0`);
            if (!s.courseCodes?.trim()) errors.push(`Section ${i+1} (${s.sectionName}): Course Codes are required`);
        });
    }

    if (teacherLoads.length === 0) {
        errors.push("At least one Teacher Load is required");
    } else {
        teacherLoads.forEach((t, i) => {
            if (!t.fID?.trim()) errors.push(`Teacher Load ${i+1}: Faculty ID is required`);
            if (!t.name?.trim()) errors.push(`Teacher Load ${i+1}: Name is required`);
            if (!t.maxUnits || t.maxUnits <= 0) errors.push(`Teacher Load ${i+1} (${t.name || t.fID}): Max Units must be > 0`);
            if (!t.courses?.trim()) errors.push(`Teacher Load ${i+1} (${t.name || t.fID}): At least one Course is required`);
        });
    }

    if (teacherAvailability.length === 0) {
        errors.push("At least one Teacher Availability is required");
    } else {
        teacherAvailability.forEach((t, i) => {
            if (!t.fID?.trim()) errors.push(`Availability ${i+1}: Faculty ID is required`);
            if (!t.name?.trim()) errors.push(`Availability ${i+1}: Name is required`);
            
            if (!t.schedules || t.schedules.length === 0) {
                errors.push(`Availability for "${t.name}" (${t.fID}): Must have at least one schedule slot`);
            } else {
                const hasValidSlot = t.schedules.some(s => s.days.length > 0 && s.startTime < s.endTime);
                if (!hasValidSlot)
                    errors.push(`Availability for "${t.name}" (${t.fID}): Must have at least one valid time slot with days and proper time range`);
                
                t.schedules.forEach((sch, idx) => {
                    if (!sch.days || sch.days.length === 0) {
                        errors.push(`Availability for "${t.name}" (${t.fID}), Schedule ${idx+1}: At least ONE day must be selected`);
                    }
                    if (sch.startTime >= sch.endTime) {
                        errors.push(`Availability for "${t.name}" (${t.fID}), Schedule ${idx+1}: Start time (${sch.startTime}) must be before End time (${sch.endTime})`);
                    }
                    if (sch.startTime < 0 || sch.startTime > 23) {
                        errors.push(`Availability for "${t.name}" (${t.fID}), Schedule ${idx+1}: Start time must be between 0-23`);
                    }
                    if (sch.endTime < 0 || sch.endTime > 23) {
                        errors.push(`Availability for "${t.name}" (${t.fID}), Schedule ${idx+1}: End time must be between 0-23`);
                    }
                });
            }
        });
    }

    if (rooms.length === 0) {
        errors.push("At least one Room must be added");
    } else {
        rooms.forEach((r, i) => {
            if (!r.roomName?.trim()) errors.push(`Room ${i+1}: Room Name is required`);
            if (!r.roomCapacity || r.roomCapacity <= 0) errors.push(`Room ${i+1} (${r.roomName}): Capacity must be > 0`);
        });
    }

    // Advanced validations
    const courseCodeMap = {};
    courses.forEach(c => {
        const code = c.courseCode?.trim().toUpperCase();
        if (code) {
            if (courseCodeMap[code]) {
                errors.push(`Duplicate course code detected: "${c.courseCode}" appears multiple times`);
            }
            courseCodeMap[code] = true;
        }
    });

    const loadFidMap = {};
    teacherLoads.forEach(t => {
        const fid = t.fID?.trim().toUpperCase();
        if (fid) {
            if (loadFidMap[fid]) {
                errors.push(`Duplicate Faculty ID in Teacher Load: "${t.fID}" appears multiple times`);
            }
            loadFidMap[fid] = true;
        }
    });

    const availFidMap = {};
    teacherAvailability.forEach(t => {
        const fid = t.fID?.trim().toUpperCase();
        if (fid) {
            if (availFidMap[fid]) {
                errors.push(`Duplicate Faculty ID in Teacher Availability: "${t.fID}" appears multiple times`);
            }
            availFidMap[fid] = true;
        }
    });

    const sectionNameMap = {};
    sections.forEach(s => {
        const name = s.sectionName?.trim().toUpperCase();
        if (name) {
            if (sectionNameMap[name]) {
                errors.push(`Duplicate section name: "${s.sectionName}" appears multiple times`);
            }
            sectionNameMap[name] = true;
        }
    });

    const roomNameMap = {};
    rooms.forEach(r => {
        const name = r.roomName?.trim().toUpperCase();
        if (name) {
            if (roomNameMap[name]) {
                errors.push(`Duplicate room name: "${r.roomName}" appears multiple times`);
            }
            roomNameMap[name] = true;
        }
    });

    const validCourseCodes = new Set(courses.map(c => c.courseCode.trim().toUpperCase()));

    teacherLoads.forEach(t => {
        if (!t.courses?.trim()) return;
        const assigned = t.courses.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
        assigned.forEach(code => {
            if (!validCourseCodes.has(code)) {
                errors.push(`Teacher "${t.name}" (${t.fID}) is assigned course "${code}" which does NOT exist in Courses list`);
            }
        });
        
        const teacherCourses = assigned.map(code => 
            courses.find(c => c.courseCode.trim().toUpperCase() === code)
        ).filter(Boolean);
        
        const totalUnits = teacherCourses.reduce((sum, c) => sum + (parseInt(c.units) || 0), 0);
        if (totalUnits > parseInt(t.maxUnits)) {
            warnings.push(`Teacher "${t.name}" (${t.fID}): Total assigned units (${totalUnits}) exceeds max units (${t.maxUnits})`);
        }
    });

    sections.forEach((s, i) => {
        if (!s.courseCodes?.trim()) return;
        const assigned = s.courseCodes.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
        assigned.forEach(code => {
            if (!validCourseCodes.has(code)) {
                errors.push(`Section "${s.sectionName}": Course "${code}" does NOT exist in Courses list`);
            }
        });
    });

    sections.forEach((s, i) => {
        if (!s.courseCodes?.trim()) return;
        const sectionCourses = s.courseCodes.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
        sectionCourses.forEach(code => {
            const hasTeacher = teacherLoads.some(t => {
                if (!t.courses?.trim()) return false;
                return t.courses.split(',').map(c => c.trim().toUpperCase()).includes(code);
            });
            if (!hasTeacher) {
                errors.push(`Section "${s.sectionName}": Course "${code}" has NO teacher assigned to teach it`);
            }
        });
    });

    const loadFids = new Set(teacherLoads.map(t => t.fID.trim().toUpperCase()));
    const availFids = new Set(teacherAvailability.map(t => t.fID.trim().toUpperCase()));

    for (const fid of loadFids) {
        if (!availFids.has(fid)) {
            const teacher = teacherLoads.find(t => t.fID.trim().toUpperCase() === fid);
            errors.push(`Teacher "${teacher.name}" (${fid}) has teaching load but NO availability schedule defined`);
        }
    }
    for (const fid of availFids) {
        if (!loadFids.has(fid)) {
            const teacher = teacherAvailability.find(t => t.fID.trim().toUpperCase() === fid);
            errors.push(`Teacher "${teacher.name}" (${fid}) has availability schedule but NO teaching load assigned`);
        }
    }

    sections.forEach(s => {
        const studentCount = parseInt(s.sectionStudents);
        const suitableRooms = rooms.filter(r => parseInt(r.roomCapacity) >= studentCount);
        if (suitableRooms.length === 0) {
            warnings.push(`Section "${s.sectionName}" has ${studentCount} students but NO room has sufficient capacity`);
        }
    });

    const hasLabCourses = courses.some(c => c.subjectType === 'LAB');
    const hasLabRooms = rooms.some(r => r.roomType === 'LAB');
    if (hasLabCourses && !hasLabRooms) {
        warnings.push(`LAB courses exist but NO LAB rooms are available`);
    }

    if (errors.length > 0 || warnings.length > 0) {
        const errorList = document.getElementById('validationErrorList');
        let html = '';
        
        if (errors.length > 0) {
            html += '<h6 class="text-danger mb-3"><i class="fas fa-times-circle me-2"></i>Errors (Must Fix)</h6>';
            html += errors.map(err => `
                <div class="alert alert-danger py-2 mb-2 border-0">
                    <i class="fas fa-exclamation-triangle me-2"></i>${err}
                </div>
            `).join('');
        }
        
        if (warnings.length > 0) {
            html += '<h6 class="text-warning mb-3 mt-4"><i class="fas fa-exclamation-circle me-2"></i>Warnings (Review Recommended)</h6>';
            html += warnings.map(warn => `
                <div class="alert alert-warning py-2 mb-2 border-0">
                    <i class="fas fa-info-circle me-2"></i>${warn}
                </div>
            `).join('');
        }
        
        errorList.innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('validationErrorModal'));
        modal.show();
        
        if (errors.length > 0) {
            return;
        }
    }

    const processingModal = new bootstrap.Modal(document.getElementById('processingModal'));
    processingModal.show();

    updateProgress(0, 'Initializing...');
    document.getElementById('statusMessages').innerHTML = `
        <div class="d-flex align-items-center text-primary">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>Starting schedule generation...</span>
        </div>`;

    fetch('http://localhost:3000/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleJSON)
    })
    .then(response => {
        if (!response.ok) throw new Error('Server error: ' + response.status);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullOutput = '';

        function read() {
            return reader.read().then(({ done, value }) => {
                if (done) return fullOutput;

                const chunk = decoder.decode(value, { stream: true });
                fullOutput += chunk;

                chunk.split('\n').forEach(rawLine => {
                    const line = rawLine.trim();
                    if (!line) return;

                    const isProgressLine = line.startsWith('[PROGRESS]');
                    const isJsonLine = line.startsWith('{') || line.startsWith('[') || line.startsWith('}') || line.startsWith(']');

                    if (!isProgressLine && !isJsonLine) {
                        addStatusMessage(line);
                    }

                    if (line.includes('Generating initial population')) {
                        updateProgress(10, 'Creating initial population...');
                    }
                    else if (line.includes('Generating CSP schedule')) {
                        const match = line.match(/(\d+)\/(\d+)/);
                        if (match) {
                            const current = parseInt(match[1]);
                            const total = parseInt(match[2]);
                            const percent = 10 + Math.round((current / total) * 40);
                            updateProgress(percent, `Generating candidate schedules... ${current}/${total}`);
                        }
                    }
                    else if (line.includes('Starting genetic algorithm')) {
                        updateProgress(50, 'Optimizing schedule with AI...');
                    }
                    else if (line.includes('Generation')) {
                        const match = line.match(/Generation (\d+)/i);
                        if (match) {
                            const gen = parseInt(match[1]);
                            const percent = 50 + Math.min((gen / 100) * 45, 45);
                            updateProgress(percent, `Evolving solution – Generation ${gen}`);
                        }
                    }
                    else if (line.includes('Finalizing') || line.includes('Best schedule found')) {
                        updateProgress(98, 'Finalizing schedule...');
                    }
                });

                return read();
            });
        }
        return read();
    })
    .then(fullText => {
        let jsonResult = null;
        const lines = fullText.split('\n').reverse();
        for (const line of lines) {
            const trimmed = line.trim();
            if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length > 10) {
                try {
                    jsonResult = JSON.parse(trimmed);
                    break;
                } catch (e) { }
            }
        }

        if (jsonResult) {
            addStatusMessage('Schedule generated successfully!', 'success');
            updateProgress(100, 'Complete!');

            setTimeout(() => {
                processingModal.hide();
                displayScheduleResults(jsonResult);
                new bootstrap.Modal(document.getElementById('resultModal')).show();
            }, 800);
        } else {
            addStatusMessage('Failed: No valid schedule was generated.', 'danger');
            updateProgress(0, 'Failed');
        }
    })
    .catch(err => {
        console.error('Generation failed:', err);
        addStatusMessage('Error: Failed to connect to server.', 'danger');
        updateProgress(0, 'Failed');
        processingModal.hide();
    });
}

function updateProgress(percent, message) {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const currentStep = document.getElementById('currentStep');
    
    progressBar.style.width = percent + '%';
    progressPercent.textContent = Math.round(percent) + '%';
    currentStep.textContent = message;
}

function addStatusMessage(message, type = 'normal') {
    const container = document.getElementById('statusMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'status-message';
    
    if (message.includes('Successfully')) {
        msgDiv.classList.add('success-message');
        msgDiv.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${message}`;
    } else if (type === 'warning' || message.includes('Error')) {
        msgDiv.classList.add('warning-message');
        msgDiv.innerHTML = `<i class="fas fa-exclamation-triangle text-warning me-2"></i>${message}`;
    } else {
        msgDiv.innerHTML = `<i class="fas fa-info-circle text-primary me-2"></i>${message}`;
    }
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function copyResultToClipboard() {
    const resultText = JSON.stringify(window.currentScheduleResult, null, 2);
    navigator.clipboard.writeText(resultText).then(() => {
        alert('Result copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function downloadSchedule() {
    const resultText = JSON.stringify(window.currentScheduleResult, null, 2);
    const blob = new Blob([resultText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_' + new Date().getTime() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function displayScheduleResults(jsonResult) {
    window.currentScheduleResult = jsonResult;
    
    const stats = jsonResult.statistics || {};
    const statsHTML = `
        <div class="col-md-3">
            <div class="card text-center border-success stat-card">
                <div class="card-body">
                    <h3 class="text-success mb-0">${stats.completion_rate || 0}%</h3>
                    <small class="text-muted">Completion Rate</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center ${stats.total_conflicts > 0 ? 'border-warning' : 'border-success'} stat-card">
                <div class="card-body">
                    <h3 class="${stats.total_conflicts > 0 ? 'text-warning' : 'text-success'} mb-0">${stats.total_conflicts || 0}</h3>
                    <small class="text-muted">Total Conflicts</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center border-info stat-card">
                <div class="card-body">
                    <h3 class="text-info mb-0">${jsonResult.Total_Schedule || 0}</h3>
                    <small class="text-muted">Total Classes</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center border-primary stat-card">
                <div class="card-body">
                    <h3 class="text-primary mb-0">${jsonResult.expected_schedule || 0}</h3>
                    <small class="text-muted">Expected Schedule</small>
                </div>
            </div>
        </div>
    `;
    document.getElementById('statisticsOverview').innerHTML = statsHTML;

    displayScheduleView(jsonResult.generated_schedule || []);
    displayTeacherView(jsonResult.teacher_schedules || []);
    displaySectionView(jsonResult.section_schedules || []);
    displayRoomView(jsonResult.room_schedules || []);
    displayConflictsView(jsonResult);
}

// Display Functions for Schedule Results

function displayScheduleView(schedules) {
    if (!schedules || schedules.length === 0) {
        document.getElementById('scheduleViewContent').innerHTML = '<p class="text-center text-muted py-5">No schedules generated.</p>';
        return;
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const schedulesByDay = {};
    
    days.forEach(day => {
        schedulesByDay[day] = schedules.filter(s => s.day === day).sort((a, b) => {
            const getHour = (time) => {
                const match = time.match(/(\d+)(AM|PM)/);
                if (!match) return 0;
                let hour = parseInt(match[1]);
                if (match[2] === 'PM' && hour !== 12) hour += 12;
                if (match[2] === 'AM' && hour === 12) hour = 0;
                return hour;
            };
            return getHour(a.time) - getHour(b.time);
        });
    });

    let html = '<div class="accordion" id="scheduleAccordion">';
    
    days.forEach((day, index) => {
        const daySchedules = schedulesByDay[day];
        if (daySchedules.length === 0) return;
        
        const collapseId = `collapse-${day}`;
        const dayNames = {
            'Mon': 'Monday',
            'Tue': 'Tuesday',
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday',
            'Sat': 'Saturday'
        };
        
        html += `
            <div class="day-section">
                <div class="day-header ${index !== 0 ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    <div>
                        <h5 class="mb-0">
                            <i class="fas fa-calendar-day me-2"></i>${dayNames[day]}
                        </h5>
                        <small class="opacity-75">${daySchedules.length} classes scheduled</small>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div id="${collapseId}" class="collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#scheduleAccordion">
                    <div class="day-content">`;
        
        daySchedules.forEach(cls => {
            html += `
                <div class="class-item">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <div class="time-slot mb-2">
                                <i class="fas fa-clock me-2"></i>${cls.time} - ${cls.end_time}
                            </div>
                            <small class="text-muted"><i class="fas fa-hourglass-half me-1"></i>${cls.duration} hours</small>
                        </div>
                        <div class="col-md-9">
                            <h6 class="text-primary mb-2">
                                <i class="fas fa-book me-2"></i>${cls.course}
                            </h6>
                            <div class="row g-2 text-muted small">
                                <div class="col-md-4">
                                    <i class="fas fa-users me-1"></i><strong>Section:</strong> ${cls.section}
                                </div>
                                <div class="col-md-4">
                                    <i class="fas fa-chalkboard-teacher me-1"></i><strong>Teacher:</strong> ${cls.teacher}
                                </div>
                                <div class="col-md-4">
                                    <i class="fas fa-door-open me-1"></i><strong>Room:</strong> ${cls.room}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        html += `
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    document.getElementById('scheduleViewContent').innerHTML = html;
}

function displayTeacherView(teacherSchedules) {
    if (!teacherSchedules || teacherSchedules.length === 0) {
        document.getElementById('teacherViewContent').innerHTML = '<p class="text-center text-muted py-5">No teacher schedules available.</p>';
        return;
    }

    const dayNames = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday'
    };

    let html = '<div class="accordion" id="teacherAccordion">';
    
    teacherSchedules.forEach((teacher, index) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const classesByDay = {};
        
        days.forEach(day => {
            classesByDay[day] = teacher.classes.filter(c => c.day === day);
        });

        const collapseId = `teacher-collapse-${index}`;
        
        html += `
            <div class="teacher-section">
                <div class="entity-header ${index !== 0 ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    <div>
                        <h5 class="mb-0">
                            <i class="fas fa-user-tie me-2"></i>${teacher.teacher_name}
                        </h5>
                        <small class="opacity-75">
                            <span class="badge bg-light text-dark me-2">${teacher.teacher_id}</span>
                            ${teacher.classes.length} total classes
                        </small>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div id="${collapseId}" class="collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#teacherAccordion">
                    <div class="entity-content">`;
        
        days.forEach(day => {
            const dayClasses = classesByDay[day];
            if (dayClasses.length === 0) return;
            
            html += `
                <div class="mb-3">
                    <h6 class="text-primary mb-3">
                        <i class="fas fa-calendar-day me-2"></i>${dayNames[day]}
                    </h6>`;
            
            dayClasses.forEach(cls => {
                html += `
                    <div class="class-item">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <div class="time-slot mb-2">
                                    <i class="fas fa-clock me-2"></i>${cls.time} - ${cls.end_time}
                                </div>
                                <small class="text-muted"><i class="fas fa-hourglass-half me-1"></i>${cls.duration}h</small>
                            </div>
                            <div class="col-md-9">
                                <h6 class="text-primary mb-2">
                                    <i class="fas fa-book me-2"></i>${cls.course}
                                </h6>
                                <div class="row g-2 text-muted small">
                                    <div class="col-md-6">
                                        <i class="fas fa-users me-1"></i><strong>Section:</strong> ${cls.section}
                                    </div>
                                    <div class="col-md-6">
                                        <i class="fas fa-door-open me-1"></i><strong>Room:</strong> ${cls.room}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            
            html += `</div>`;
        });

        html += `
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    document.getElementById('teacherViewContent').innerHTML = html;
}

function displaySectionView(sectionSchedules) {
    if (!sectionSchedules || sectionSchedules.length === 0) {
        document.getElementById('sectionViewContent').innerHTML = '<p class="text-center text-muted py-5">No section schedules available.</p>';
        return;
    }

    const dayNames = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday'
    };

    let html = '<div class="accordion" id="sectionAccordion">';
    
    sectionSchedules.forEach((section, index) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const classesByDay = {};
        
        days.forEach(day => {
            classesByDay[day] = section.classes.filter(c => c.day === day);
        });

        const collapseId = `section-collapse-${index}`;
        
        html += `
            <div class="section-section">
                <div class="entity-header ${index !== 0 ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <div>
                        <h5 class="mb-0">
                            <i class="fas fa-users me-2"></i>Section ${section.section_name}
                        </h5>
                        <small class="opacity-75">${section.classes.length} total classes</small>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div id="${collapseId}" class="collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#sectionAccordion">
                    <div class="entity-content">`;
        
        days.forEach(day => {
            const dayClasses = classesByDay[day];
            if (dayClasses.length === 0) return;
            
            html += `
                <div class="mb-3">
                    <h6 class="text-danger mb-3">
                        <i class="fas fa-calendar-day me-2"></i>${dayNames[day]}
                    </h6>`;
            
            dayClasses.forEach(cls => {
                html += `
                    <div class="class-item" style="border-left-color: #f5576c;">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <div class="time-slot mb-2" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                    <i class="fas fa-clock me-2"></i>${cls.time} - ${cls.end_time}
                                </div>
                                <small class="text-muted"><i class="fas fa-hourglass-half me-1"></i>${cls.duration}h</small>
                            </div>
                            <div class="col-md-9">
                                <h6 class="text-danger mb-2">
                                    <i class="fas fa-book me-2"></i>${cls.course}
                                </h6>
                                <div class="row g-2 text-muted small">
                                    <div class="col-md-6">
                                        <i class="fas fa-chalkboard-teacher me-1"></i><strong>Teacher:</strong> ${cls.teacher}
                                    </div>
                                    <div class="col-md-6">
                                        <i class="fas fa-door-open me-1"></i><strong>Room:</strong> ${cls.room}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            
            html += `</div>`;
        });

        html += `
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    document.getElementById('sectionViewContent').innerHTML = html;
}

function displayRoomView(roomSchedules) {
    if (!roomSchedules || roomSchedules.length === 0) {
        document.getElementById('roomViewContent').innerHTML = '<p class="text-center text-muted py-5">No room schedules available.</p>';
        return;
    }

    const dayNames = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday'
    };

    let html = '<div class="accordion" id="roomAccordion">';
    
    roomSchedules.forEach((room, index) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const classesByDay = {};
        
        days.forEach(day => {
            classesByDay[day] = room.classes.filter(c => c.day === day);
        });

        const utilizationPercent = Math.round((room.classes.length / 30) * 100);
        const collapseId = `room-collapse-${index}`;
        
        html += `
            <div class="room-section">
                <div class="entity-header ${index !== 0 ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <div>
                        <h5 class="mb-0">
                            <i class="fas fa-door-open me-2"></i>${room.room_name}
                        </h5>
                        <small class="opacity-75">
                            <span class="badge bg-light text-dark me-2">${room.room_type}</span>
                            ${room.classes.length} classes · ${utilizationPercent}% utilization
                        </small>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div id="${collapseId}" class="collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#roomAccordion">
                    <div class="entity-content">`;
        
        days.forEach(day => {
            const dayClasses = classesByDay[day];
            if (dayClasses.length === 0) return;
            
            html += `
                <div class="mb-3">
                    <h6 class="text-info mb-3">
                        <i class="fas fa-calendar-day me-2"></i>${dayNames[day]}
                    </h6>`;
            
            dayClasses.forEach(cls => {
                html += `
                    <div class="class-item" style="border-left-color: #00f2fe;">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <div class="time-slot mb-2" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                                    <i class="fas fa-clock me-2"></i>${cls.time} - ${cls.end_time}
                                </div>
                                <small class="text-muted"><i class="fas fa-hourglass-half me-1"></i>${cls.duration}h</small>
                            </div>
                            <div class="col-md-9">
                                <h6 class="text-info mb-2">
                                    <i class="fas fa-book me-2"></i>${cls.course}
                                </h6>
                                <div class="row g-2 text-muted small">
                                    <div class="col-md-6">
                                        <i class="fas fa-users me-1"></i><strong>Section:</strong> ${cls.section}
                                    </div>
                                    <div class="col-md-6">
                                        <i class="fas fa-chalkboard-teacher me-1"></i><strong>Teacher:</strong> ${cls.teacher}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            
            html += `</div>`;
        });

        html += `
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    document.getElementById('roomViewContent').innerHTML = html;
}

function displayConflictsView(jsonResult) {
    const conflicts = jsonResult.conflicts || [];
    const stats = jsonResult.statistics || {};
    const conflictSummary = stats.conflict_summary || {};

    if (conflicts.length === 0) {
        document.getElementById('conflictsViewContent').innerHTML = `
            <div class="no-conflicts">
                <i class="fas fa-check-circle fa-4x mb-3"></i>
                <h3>No Conflicts Detected!</h3>
                <p class="mb-0">All schedules have been generated successfully without any conflicts.</p>
            </div>
        `;
        return;
    }

    // DEBUG: Log all conflicts to see their structure
    console.log('=== ALL CONFLICTS ===');
    console.log(JSON.stringify(conflicts, null, 2));
    console.log('====================');

    let html = `
        <div class="alert alert-danger border-0 shadow-sm mb-4">
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <div>
                    <h5 class="alert-heading mb-1">Conflicts Detected</h5>
                    <p class="mb-0">The schedule generation has identified <strong>${conflicts.length}</strong> conflict(s) that need attention.</p>
                </div>
            </div>
        </div>
    `;

    if (conflictSummary.conflict_breakdown && conflictSummary.conflict_breakdown.length > 0) {
        html += `
            <div class="card mb-4 border-0 shadow-sm">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">
                        <i class="fas fa-chart-pie me-2"></i>Conflict Summary
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row g-3">`;
        
        conflictSummary.conflict_breakdown.forEach(breakdown => {
            html += `
                <div class="col-md-4">
                    <div class="text-center p-3 bg-light rounded">
                        <h3 class="text-danger mb-2">${breakdown.count || 0}</h3>
                        <p class="text-muted mb-0 small">${breakdown.type || 'Unknown Type'}</p>
                    </div>
                </div>`;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    html += `<h5 class="mb-3"><i class="fas fa-list me-2"></i>Conflict Details</h5>`;

    conflicts.forEach((conflict, index) => {
        // DEBUG: Log each conflict
        console.log(`Conflict #${index + 1}:`, conflict);
        console.log('Available keys:', Object.keys(conflict));
        
        const conflictType = conflict.type || 'Unknown Conflict';
        const message = conflict.message || 'No details available';
        
        // Try to extract schedule from various possible locations
        let schedule = conflict.schedule || conflict.details || conflict;
        
        // If schedule is nested, try to extract it
        if (conflict.schedule1) schedule = conflict.schedule1;
        if (conflict.schedule_1) schedule = conflict.schedule_1;
        if (conflict.schedules && conflict.schedules.length > 0) schedule = conflict.schedules[0];
        
        html += `
            <div class="conflict-item card mb-3" style="margin-top: 20px;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0">
                            <i class="fas fa-exclamation-circle text-danger me-2"></i>
                            Conflict #${index + 1}
                        </h6>
                        <span class="conflict-badge badge bg-danger">${conflictType}</span>
                    </div>
                    
                    <div class="conflict-detail mb-3">
                        <strong>Conflicted Schedule:</strong><br>
                        <i class="fas fa-book me-1 text-danger"></i><strong>Course:</strong> ${schedule.course || schedule.course_code || conflict.course || conflict.course_code || 'N/A'}<br>
                        <i class="fas fa-users me-1 text-danger"></i><strong>Section:</strong> ${schedule.section || schedule.section_name || conflict.section || conflict.section_name || 'N/A'}<br>
                        <i class="fas fa-chalkboard-teacher me-1 text-danger"></i><strong>Teacher:</strong> ${schedule.teacher || schedule.teacher_name || conflict.teacher || conflict.teacher_name || 'N/A'}<br>
                        <i class="fas fa-door-open me-1 text-danger"></i><strong>Room:</strong> ${schedule.room || schedule.room_name || conflict.room || conflict.room_name || 'N/A'}<br>
                        <i class="fas fa-calendar me-1 text-danger"></i><strong>Day:</strong> ${schedule.day || conflict.day || 'N/A'}<br>
                        <i class="fas fa-clock me-1 text-danger"></i><strong>Time:</strong> ${schedule.time || schedule.start_time || conflict.time || conflict.start_time || 'N/A'}${schedule.end_time || conflict.end_time ? ` - ${schedule.end_time || conflict.end_time}` : ''}
                    </div>
                    
                    <div class="conflict-note">
                        <i class="fas fa-lightbulb me-2"></i>
                        <strong>Note:</strong> ${message}
                    </div>
                </div>
            </div>

        `;
    });

    document.getElementById('conflictsViewContent').innerHTML = html;
}

