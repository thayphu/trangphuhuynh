/**
 * Quản lý điểm danh
 */

// Cập nhật trạng thái viền của mục điểm danh khi thay đổi
function updateAttendanceItemStatus(radioButton) {
    const attendanceItem = radioButton.closest('.attendance-item');
    
    if (radioButton.value === 'present') {
        attendanceItem.classList.add('present');
    } else {
        attendanceItem.classList.remove('present');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách lớp để điểm danh
    displayAttendanceClasses();
    
    // Xử lý form điểm danh
    const attendanceForm = document.getElementById('attendance-form');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendance);
    }
    
    // Thiết lập tabs cho điểm danh
    setupAttendanceTabs();
    
    // Hiển thị danh sách lớp học bù
    displayMakeupClasses();
    
    // Lắng nghe sự kiện thay đổi dữ liệu
    document.addEventListener('dataChanged', function() {
        console.log("Phát hiện thay đổi dữ liệu, cập nhật lại tab Điểm danh");
        displayAttendanceClasses();
        displayMakeupClasses();
    });
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
                <button class="teacher-absent-btn" data-id="${classData.id}" ${!isTodayClass ? 'disabled' : ''}>
                    GV vắng
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
    // Sự kiện cho nút điểm danh
    const attendanceButtons = document.querySelectorAll('.attendance-btn');
    attendanceButtons.forEach(button => {
        if (!button.disabled) {
            button.addEventListener('click', function() {
                const classId = this.dataset.id;
                openAttendanceModal(classId);
            });
        }
    });
    
    // Sự kiện cho nút GV vắng
    const teacherAbsentButtons = document.querySelectorAll('.teacher-absent-btn');
    teacherAbsentButtons.forEach(button => {
        if (!button.disabled) {
            button.addEventListener('click', function() {
                const classId = this.dataset.id;
                if (confirm('Xác nhận giáo viên vắng mặt? Tất cả học sinh sẽ được chuyển sang trạng thái GV nghỉ.')) {
                    markTeacherAbsent(classId);
                }
            });
        }
    });
}

// Đánh dấu giáo viên vắng mặt
function markTeacherAbsent(classId) {
    // Lấy ngày hiện tại
    const today = new Date().toISOString().split('T')[0];
    
    // Lấy danh sách học sinh của lớp
    const students = getStudents().filter(student => student.classId === classId);
    
    if (students.length === 0) {
        alert('Lớp này chưa có học sinh nào.');
        return;
    }
    
    // Lấy danh sách điểm danh hiện tại
    const attendance = getAttendance();
    
    // Kiểm tra xem đã có bản ghi điểm danh cho ngày hôm nay chưa
    let todayAttendance = attendance.find(record => 
        record.date === today && record.classId === classId
    );
    
    // Tạo danh sách học sinh với trạng thái "GV nghỉ"
    const attendanceStudents = students.map(student => ({
        id: student.id,
        status: 'teacher-absent'
    }));
    
    if (todayAttendance) {
        // Cập nhật bản ghi hiện có
        todayAttendance.students = attendanceStudents;
        
        // Đánh dấu là lớp cần học bù
        if (!todayAttendance.needMakeup) {
            todayAttendance.needMakeup = true;
            todayAttendance.makeupDate = null;
        }
    } else {
        // Tạo bản ghi mới
        todayAttendance = {
            id: generateId('attendance', 5),
            classId: classId,
            date: today,
            students: attendanceStudents,
            needMakeup: true,
            makeupDate: null
        };
        attendance.push(todayAttendance);
    }
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Hiển thị lại danh sách lớp
    displayAttendanceClasses();
    
    // Cập nhật danh sách lớp học bù
    displayMakeupClasses();
    
    // Hiển thị thông báo thành công
    showNotification('Đã đánh dấu giáo viên vắng mặt cho lớp này', 'success');
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

// Thiết lập tabs cho điểm danh
function setupAttendanceTabs() {
    const tabButtons = document.querySelectorAll('.attendance-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Xóa active class từ tất cả các tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.attendance-tab-content').forEach(content => content.classList.remove('active'));
            
            // Thêm active class cho tab được chọn
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Hiển thị danh sách lớp học bù
function displayMakeupClasses() {
    const makeupClassesContainer = document.getElementById('makeup-classes');
    const noMakeupMessage = document.getElementById('no-makeup-classes');
    
    if (!makeupClassesContainer) return;
    
    // Xóa nội dung hiện tại (trừ thông báo không có lớp học bù)
    Array.from(makeupClassesContainer.children).forEach(child => {
        if (child.id !== 'no-makeup-classes') {
            child.remove();
        }
    });
    
    // Lấy danh sách điểm danh
    const attendance = getAttendance();
    
    // Lọc ra các lớp cần học bù
    const needMakeupRecords = attendance.filter(record => record.needMakeup);
    
    // Hiển thị thông báo nếu không có lớp nào cần học bù
    if (needMakeupRecords.length === 0) {
        noMakeupMessage.style.display = 'block';
        return;
    }
    
    // Ẩn thông báo không có lớp học bù
    noMakeupMessage.style.display = 'none';
    
    // Hiển thị các lớp cần học bù
    needMakeupRecords.forEach(record => {
        const classData = getClassById(record.classId);
        if (!classData) return;
        
        const makeupCard = document.createElement('div');
        makeupCard.className = 'class-card';
        
        // Định dạng ngày
        const absentDate = formatDate(record.date);
        
        // Định dạng ngày học bù (nếu có)
        const makeupDate = record.makeupDate ? formatDate(record.makeupDate) : 'Chưa đặt lịch';
        
        makeupCard.innerHTML = `
            <h3>${classData.name}</h3>
            <div class="class-details">
                <div><span>Ngày nghỉ:</span> ${absentDate}</div>
                <div><span>Lịch học bù:</span> ${record.makeupDate ? makeupDate : '<span class="status-unpaid">Chưa đặt lịch</span>'}</div>
                <div><span>Thời gian:</span> ${formatTime(classData.timeStart)} - ${formatTime(classData.timeEnd)}</div>
                <div><span>Địa điểm:</span> ${classData.location}</div>
            </div>
            <div class="class-actions">
                ${!record.makeupDate ? 
                  `<button class="schedule-makeup-btn" data-id="${record.id}" data-class-id="${classData.id}" data-date="${record.date}">Đặt lịch học bù</button>` : 
                  `<button class="change-makeup-btn" data-id="${record.id}" data-class-id="${classData.id}" data-date="${record.date}">Thay đổi lịch học bù</button>`}
            </div>
        `;
        
        makeupClassesContainer.appendChild(makeupCard);
    });
    
    // Thêm sự kiện cho nút đặt lịch học bù
    document.querySelectorAll('.schedule-makeup-btn, .change-makeup-btn').forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.dataset.id;
            const classId = this.dataset.classId;
            const absentDate = this.dataset.date;
            
            // Mở modal đặt lịch học bù
            openScheduleMakeupModal(recordId, classId, absentDate);
        });
    });
}

// Mở modal đặt lịch học bù
function openScheduleMakeupModal(recordId, classId, absentDate) {
    // Hiển thị modal thông thường
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'schedule-makeup-modal';
    
    const classData = getClassById(classId);
    if (!classData) return;
    
    // Lấy bản ghi điểm danh
    const attendance = getAttendance();
    const record = attendance.find(r => r.id === recordId);
    
    if (!record) return;
    
    // Tính toán ngày học bù mặc định (1 tuần sau ngày nghỉ)
    const absentDateObj = new Date(absentDate);
    const suggestedDate = new Date(absentDateObj);
    suggestedDate.setDate(suggestedDate.getDate() + 7);
    
    // Format để dùng trong input date
    const suggestedDateFormatted = suggestedDate.toISOString().split('T')[0];
    const currentMakeupDate = record.makeupDate || suggestedDateFormatted;
    
    // Tạo nội dung modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="document.getElementById('schedule-makeup-modal').remove()">&times;</span>
            <h2>Đặt lịch học bù cho lớp ${classData.name}</h2>
            <form id="schedule-makeup-form">
                <input type="hidden" name="record-id" value="${recordId}">
                <div class="form-group">
                    <label>Ngày nghỉ:</label>
                    <input type="text" value="${formatDate(absentDate)}" disabled>
                </div>
                <div class="form-group">
                    <label>Ngày học bù:</label>
                    <input type="date" name="makeup-date" id="makeup-date" value="${currentMakeupDate}" min="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div id="date-conflict-warning" class="warning" style="display: none; color: red; margin-top: 10px;">
                    Cảnh báo: Ngày đã chọn trùng với lịch học hiện tại của lớp.
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Lưu lịch học bù</button>
                    <button type="button" class="cancel-btn" onclick="document.getElementById('schedule-makeup-modal').remove()">Hủy</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Hiển thị modal
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Xử lý thay đổi ngày để kiểm tra xung đột
    const makeupDateInput = document.getElementById('makeup-date');
    const dateConflictWarning = document.getElementById('date-conflict-warning');
    
    makeupDateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const dayOfWeek = selectedDate.getDay(); // 0: CN, 1: T2, ..., 6: T7
        
        // Chuyển đổi thứ trong tuần sang định dạng "Thứ X" hoặc "Chủ nhật"
        let dayInVietnamese;
        if (dayOfWeek === 0) {
            dayInVietnamese = "Chủ nhật";
        } else {
            dayInVietnamese = `Thứ ${dayOfWeek + 1}`;
        }
        
        // Kiểm tra xem ngày được chọn có trùng với lịch học của lớp không
        const hasScheduleConflict = classData.schedule.includes(dayInVietnamese);
        
        // Hiển thị cảnh báo nếu có xung đột
        dateConflictWarning.style.display = hasScheduleConflict ? 'block' : 'none';
    });
    
    // Kích hoạt sự kiện change để kiểm tra ngày mặc định
    const event = new Event('change');
    makeupDateInput.dispatchEvent(event);
    
    // Xử lý form đặt lịch học bù
    const scheduleMakeupForm = document.getElementById('schedule-makeup-form');
    if (scheduleMakeupForm) {
        scheduleMakeupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const recordId = this.elements['record-id'].value;
            const makeupDate = this.elements['makeup-date'].value;
            
            // Lưu lịch học bù
            saveScheduleMakeup(recordId, makeupDate);
            
            // Đóng modal
            document.getElementById('schedule-makeup-modal').remove();
        });
    }
}

// Lưu lịch học bù
function saveScheduleMakeup(recordId, makeupDate) {
    // Lấy danh sách điểm danh
    const attendance = getAttendance();
    
    // Tìm bản ghi cần cập nhật
    const record = attendance.find(r => r.id === recordId);
    
    if (!record) return;
    
    // Cập nhật ngày học bù
    record.makeupDate = makeupDate;
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Cập nhật danh sách lớp học bù
    displayMakeupClasses();
    
    // Hiển thị thông báo thành công
    showNotification('Đã đặt lịch học bù thành công', 'success');
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
