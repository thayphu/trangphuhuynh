/**
 * Quản lý điểm danh
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách lớp để điểm danh
    displayAttendanceClasses();
    
    // Xử lý form điểm danh
    const attendanceForm = document.getElementById('attendance-form');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendance);
    }
});

// Hiển thị danh sách lớp để điểm danh
function displayAttendanceClasses() {
    const attendanceClasses = document.getElementById('attendance-classes');
    if (!attendanceClasses) return;
    
    attendanceClasses.innerHTML = '';
    
    const classes = getClasses();
    
    if (classes.length === 0) {
        attendanceClasses.innerHTML = '<p class="no-data">Chưa có lớp học nào. Vui lòng thêm lớp học trước.</p>';
        return;
    }
    
    // Sắp xếp lớp có lịch học hôm nay lên đầu
    classes.sort((a, b) => {
        const aTodayClass = isClassToday(a);
        const bTodayClass = isClassToday(b);
        
        if (aTodayClass && !bTodayClass) return -1;
        if (!aTodayClass && bTodayClass) return 1;
        return 0;
    });
    
    classes.forEach(classData => {
        const isTodayClass = isClassToday(classData);
        
        const classCard = document.createElement('div');
        classCard.className = `class-card ${isTodayClass ? 'today-class' : ''}`;
        
        // Đếm số học sinh trong lớp
        const students = getStudents().filter(student => student.classId === classData.id);
        const studentCount = students.length;
        
        // Kiểm tra xem lớp đã được điểm danh hôm nay chưa
        const today = new Date().toISOString().split('T')[0];
        const attendance = getAttendance();
        const todayAttendance = attendance.find(record => 
            record.date === today && record.classId === classData.id
        );
        
        // Đếm số học sinh đã điểm danh
        let attendedCount = 0;
        if (todayAttendance && todayAttendance.students) {
            attendedCount = todayAttendance.students.length;
        }
        
        const allAttended = todayAttendance && attendedCount === studentCount;
        const attendanceStatus = todayAttendance ? `Đã điểm danh (${attendedCount}/${studentCount})` : 'Chưa điểm danh';
        const attendanceStatusClass = todayAttendance ? 'status-paid' : 'status-unpaid';
        
        classCard.innerHTML = `
            <h3>${classData.name}</h3>
            <div class="class-details">
                <div><span>Lịch học:</span> ${classData.schedule.join(', ')}</div>
                <div><span>Giờ học:</span> ${formatTime(classData.timeStart)} - ${formatTime(classData.timeEnd)}</div>
                <div><span>Địa điểm:</span> ${classData.location}</div>
                <div><span>Số học sinh:</span> ${studentCount}</div>
                <div><span>Trạng thái:</span> <span class="student-status ${attendanceStatusClass}">${attendanceStatus}</span></div>
            </div>
            <div class="class-actions">
                <button class="attendance-btn" data-id="${classData.id}" ${!isTodayClass || allAttended ? 'disabled' : ''}>
                    ${!isTodayClass ? 'Không có lịch học hôm nay' : 
                      allAttended ? 'Đã điểm danh đủ' : 
                      '<span class="blink">Điểm danh</span>'}
                </button>
            </div>
        `;
        
        attendanceClasses.appendChild(classCard);
    });
    
    // Thêm sự kiện cho các nút điểm danh
    attachAttendanceButtonEvents();
}

// Gắn sự kiện cho các nút điểm danh
function attachAttendanceButtonEvents() {
    const attendanceButtons = document.querySelectorAll('.attendance-btn');
    attendanceButtons.forEach(button => {
        if (!button.disabled) {
            button.addEventListener('click', function() {
                const classId = this.dataset.id;
                openAttendanceModal(classId);
            });
        }
    });
}

// Mở modal điểm danh
function openAttendanceModal(classId) {
    const modal = document.getElementById('attendance-modal');
    if (!modal) return;
    
    const classes = getClasses();
    const classData = classes.find(cls => cls.id === classId);
    
    if (!classData) return;
    
    // Lấy danh sách học sinh của lớp
    const students = getStudents().filter(student => student.classId === classId);
    
    if (students.length === 0) {
        alert('Lớp này chưa có học sinh nào. Vui lòng thêm học sinh trước khi điểm danh.');
        return;
    }
    
    // Điền thông tin lớp vào modal
    document.getElementById('attendance-class-name').textContent = classData.name;
    
    // Lấy ngày hiện tại
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('attendance-date').textContent = formatDate(formattedDate);
    
    // Tạo danh sách học sinh để điểm danh
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';
    
    // Kiểm tra xem lớp đã được điểm danh hôm nay chưa
    const attendance = getAttendance();
    const todayAttendance = attendance.find(record => 
        record.date === formattedDate && record.classId === classId
    );
    
    students.forEach(student => {
        const attendanceItem = document.createElement('div');
        
        // Nếu đã điểm danh, sử dụng dữ liệu đã lưu
        let studentStatus = 'present'; // Mặc định là có mặt
        let isPresent = true;
        
        if (todayAttendance) {
            const studentRecord = todayAttendance.students.find(s => s.id === student.id);
            if (studentRecord) {
                studentStatus = studentRecord.status;
                isPresent = studentStatus === 'present';
            }
        }
        
        // Thêm class phù hợp để hiển thị viền
        attendanceItem.className = `attendance-item ${isPresent ? 'present' : ''}`;
        
        attendanceItem.innerHTML = `
            <div class="attendance-student">${student.name} (${student.id})</div>
            <div class="attendance-options">
                <input type="hidden" name="student-id" value="${student.id}">
                
                <label>
                    <input type="radio" name="status-${student.id}" value="present" ${studentStatus === 'present' ? 'checked' : ''} 
                           onchange="updateAttendanceItemStatus(this)">
                    Có mặt
                </label>
                
                <label>
                    <input type="radio" name="status-${student.id}" value="absent" ${studentStatus === 'absent' ? 'checked' : ''}
                           onchange="updateAttendanceItemStatus(this)">
                    Vắng mặt
                </label>
                
                <label>
                    <input type="radio" name="status-${student.id}" value="teacher-absent" ${studentStatus === 'teacher-absent' ? 'checked' : ''}
                           onchange="updateAttendanceItemStatus(this)">
                    GV nghỉ
                </label>
            </div>
        `;
        
        attendanceList.appendChild(attendanceItem);
    });
    
    // Lưu class ID vào một trường ẩn để sử dụng khi lưu
    const attendanceForm = document.getElementById('attendance-form');
    if (!attendanceForm.querySelector('input[name="class-id"]')) {
        const classIdInput = document.createElement('input');
        classIdInput.type = 'hidden';
        classIdInput.name = 'class-id';
        classIdInput.value = classId;
        attendanceForm.appendChild(classIdInput);
    } else {
        attendanceForm.querySelector('input[name="class-id"]').value = classId;
    }
    
    // Lưu ngày vào một trường ẩn để sử dụng khi lưu
    if (!attendanceForm.querySelector('input[name="attendance-date"]')) {
        const dateInput = document.createElement('input');
        dateInput.type = 'hidden';
        dateInput.name = 'attendance-date';
        dateInput.value = formattedDate;
        attendanceForm.appendChild(dateInput);
    } else {
        attendanceForm.querySelector('input[name="attendance-date"]').value = formattedDate;
    }
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Xử lý lưu điểm danh
function handleAttendance(event) {
    event.preventDefault();
    
    // Lấy classId và date từ form
    const classId = document.querySelector('input[name="class-id"]').value;
    const date = document.querySelector('input[name="attendance-date"]').value;
    
    // Lấy tất cả các học sinh từ form
    const studentIds = Array.from(document.querySelectorAll('input[name="student-id"]')).map(input => input.value);
    
    // Tạo mảng dữ liệu học sinh với trạng thái điểm danh
    const studentsAttendance = studentIds.map(studentId => {
        const status = document.querySelector(`input[name="status-${studentId}"]:checked`).value;
        return {
            id: studentId,
            status: status
        };
    });
    
    // Lấy dữ liệu điểm danh hiện tại
    let attendance = getAttendance();
    
    // Kiểm tra xem đã có bản ghi điểm danh cho ngày và lớp này chưa
    const existingRecordIndex = attendance.findIndex(record => 
        record.date === date && record.classId === classId
    );
    
    if (existingRecordIndex !== -1) {
        // Cập nhật bản ghi điểm danh hiện tại
        attendance[existingRecordIndex].students = studentsAttendance;
    } else {
        // Tạo bản ghi điểm danh mới
        attendance.push({
            id: generateId('attendance', 5),
            date: date,
            classId: classId,
            students: studentsAttendance
        });
    }
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Đóng modal
    document.getElementById('attendance-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách lớp điểm danh
    displayAttendanceClasses();
    
    // Hiển thị thông báo thành công
    alert('Đã lưu điểm danh thành công!');
}

// Lấy lịch sử điểm danh của một học sinh
function getStudentAttendance(studentId) {
    const attendance = getAttendance();
    
    // Lọc các bản ghi có học sinh này
    const studentAttendance = [];
    
    attendance.forEach(record => {
        const studentRecord = record.students.find(student => student.id === studentId);
        if (studentRecord) {
            studentAttendance.push({
                date: record.date,
                classId: record.classId,
                status: studentRecord.status
            });
        }
    });
    
    return studentAttendance;
}

// Tính toán tổng số buổi học, số buổi có mặt, vắng mặt và giáo viên vắng của một học sinh
function calculateAttendanceSummary(studentId) {
    const studentAttendance = getStudentAttendance(studentId);
    
    const summary = {
        total: studentAttendance.length,
        present: 0,
        absent: 0,
        teacherAbsent: 0
    };
    
    studentAttendance.forEach(record => {
        switch(record.status) {
            case 'present':
                summary.present++;
                break;
            case 'absent':
                summary.absent++;
                break;
            case 'teacher-absent':
                summary.teacherAbsent++;
                break;
        }
    });
    
    return summary;
}
