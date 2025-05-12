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
    // Thiết lập ngày mặc định cho bộ chọn ngày điểm danh
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const dateSelector = document.getElementById('attendance-date-selector');
    if (dateSelector) {
        dateSelector.value = formattedDate;
        dateSelector.addEventListener('change', function() {
            displayAttendanceClasses();
        });
    }
    
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
    
    // Lấy ngày từ bộ chọn ngày hoặc sử dụng ngày hiện tại
    const dateSelector = document.getElementById('attendance-date-selector');
    let selectedDate;
    let formattedDate;
    
    if (dateSelector && dateSelector.value) {
        selectedDate = new Date(dateSelector.value);
        formattedDate = dateSelector.value;
    } else {
        selectedDate = new Date();
        formattedDate = selectedDate.toISOString().split('T')[0];
    }
    
    // Xác định thứ trong tuần của ngày đã chọn
    const dayOfWeek = selectedDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    
    // Lấy danh sách lớp (chỉ lấy các lớp chưa bị khóa)
    const classes = getClasses().filter(cls => !cls.locked);
    
    if (classes.length === 0) {
        attendanceClasses.innerHTML = '<p class="no-data">Chưa có lớp học đang hoạt động nào. Vui lòng thêm lớp học hoặc mở khóa lớp đã khóa.</p>';
        return;
    }
    
    // Số lớp học có lịch vào ngày đã chọn
    let classesForSelectedDay = 0;
    
    // Sắp xếp lớp có lịch học vào ngày đã chọn lên đầu
    classes.sort((a, b) => {
        const aHasClass = isClassOnDay(a, dayOfWeek);
        const bHasClass = isClassOnDay(b, dayOfWeek);
        
        if (aHasClass && !bHasClass) return -1;
        if (!aHasClass && bHasClass) return 1;
        return 0;
    });
    
    // Lấy dữ liệu điểm danh
    const attendance = getAttendance();
    
    classes.forEach(classData => {
        const hasClassOnSelectedDay = isClassOnDay(classData, dayOfWeek);
        
        // Kiểm tra nếu lớp có lịch học vào ngày đã chọn
        if (hasClassOnSelectedDay) {
            classesForSelectedDay++;
        }
        
        // Chỉ hiển thị lớp có lịch học vào ngày đã chọn và có học sinh
        const students = getStudents().filter(student => student.classId === classData.id);
        const studentCount = students.length;
        
        if (hasClassOnSelectedDay && studentCount > 0) {
            const classCard = document.createElement('div');
            classCard.className = `class-card ${hasClassOnSelectedDay ? 'today-class' : ''}`;
            
            // Log để debug
            console.log(`Kiểm tra điểm danh lớp ${classData.name} - ID: ${classData.id}`);
            console.log(`Lịch học lớp: ${classData.schedule.join(', ')}`);
            console.log(`Có lịch học vào ngày đã chọn: ${hasClassOnSelectedDay}`);
            console.log(`Ngày đã chọn: ${formattedDate}`);
            
            // Kiểm tra xem lớp đã được điểm danh cho ngày đã chọn chưa
            const classAttendance = attendance.find(record => 
                record.date === formattedDate && record.classId === classData.id
            );
            
            // Đếm số học sinh đã điểm danh
            let attendedCount = 0;
            if (classAttendance && classAttendance.students) {
                attendedCount = classAttendance.students.length;
            }
            
            const allAttended = classAttendance && attendedCount === studentCount;
            const attendanceStatus = classAttendance ? `Đã điểm danh (${attendedCount}/${studentCount})` : 'Chưa điểm danh';
            const attendanceStatusClass = classAttendance ? 'status-paid' : 'status-unpaid';
            
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
                    <button class="attendance-btn" data-id="${classData.id}">
                        ${allAttended ? 'Đã điểm danh đủ' : '<span class="blink">Điểm danh</span>'}
                    </button>
                    <button class="teacher-absent-btn" data-id="${classData.id}">
                        GV vắng
                    </button>
                </div>
            `;
            
            attendanceClasses.appendChild(classCard);
        }
    });
    
    // Gắn sự kiện cho các nút
    attachAttendanceButtonEvents();
    
    // Hiển thị thông báo nếu không có lớp nào có lịch học vào ngày đã chọn
    if (classesForSelectedDay === 0) {
        const noClassMessage = document.createElement('p');
        noClassMessage.className = 'no-data';
        noClassMessage.textContent = `Không có lớp nào có lịch học vào ${formatDate(formattedDate)}.`;
        attendanceClasses.appendChild(noClassMessage);
    } else if (attendanceClasses.children.length === 0) {
        // Nếu có lớp học vào ngày đã chọn nhưng không có lớp nào có học sinh
        const noStudentsMessage = document.createElement('p');
        noStudentsMessage.className = 'no-data';
        noStudentsMessage.textContent = `Có ${classesForSelectedDay} lớp học vào ${formatDate(formattedDate)}, nhưng không có lớp nào có học sinh. Vui lòng thêm học sinh vào lớp.`;
        attendanceClasses.appendChild(noStudentsMessage);
    }
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
                
                // Lấy ngày từ bộ chọn ngày
                const dateSelector = document.getElementById('attendance-date-selector');
                let selectedDate = new Date().toISOString().split('T')[0]; // Mặc định là hôm nay
                
                if (dateSelector && dateSelector.value) {
                    selectedDate = dateSelector.value;
                }
                
                if (confirm(`Xác nhận giáo viên vắng mặt vào ngày ${formatDate(selectedDate)}? Tất cả học sinh sẽ được chuyển sang trạng thái GV nghỉ.`)) {
                    markTeacherAbsent(classId, selectedDate);
                }
            });
        }
    });
}

// Đánh dấu giáo viên vắng mặt
function markTeacherAbsent(classId, selectedDate) {
    // Nếu không có ngày được chọn, sử dụng ngày hiện tại
    if (!selectedDate) {
        selectedDate = new Date().toISOString().split('T')[0];
    }
    
    // Lấy danh sách học sinh của lớp
    const students = getStudents().filter(student => student.classId === classId);
    
    if (students.length === 0) {
        alert('Lớp này chưa có học sinh nào.');
        return;
    }
    
    // Lấy danh sách điểm danh hiện tại
    const attendance = getAttendance();
    
    // Kiểm tra xem đã có bản ghi điểm danh cho ngày đã chọn chưa
    let dayAttendance = attendance.find(record => 
        record.date === selectedDate && record.classId === classId
    );
    
    // Tạo danh sách học sinh với trạng thái "GV nghỉ"
    const attendanceStudents = students.map(student => ({
        id: student.id,
        status: 'teacher-absent'
    }));
    
    if (dayAttendance) {
        // Cập nhật bản ghi hiện có
        dayAttendance.students = attendanceStudents;
        dayAttendance.teacherAbsent = true;
        
        // Đánh dấu là lớp cần học bù
        if (!dayAttendance.needMakeup) {
            dayAttendance.needMakeup = true;
            dayAttendance.makeupDate = null;
        }
    } else {
        // Tạo bản ghi mới
        dayAttendance = {
            id: generateId('attendance', 5),
            classId: classId,
            date: selectedDate,
            students: attendanceStudents,
            teacherAbsent: true,
            needMakeup: true,
            makeupDate: null
        };
        attendance.push(dayAttendance);
    }
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Hiển thị lại danh sách lớp
    displayAttendanceClasses();
    
    // Cập nhật danh sách lớp học bù
    displayMakeupClasses();
    
    // Hiển thị thông báo thành công
    showNotification(`Đã đánh dấu giáo viên vắng mặt cho lớp này vào ngày ${formatDate(selectedDate)}`, 'success');
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
    
    // Lấy ngày từ bộ chọn ngày
    const dateSelector = document.getElementById('attendance-date-selector');
    let selectedDate = new Date();
    let formattedDate = selectedDate.toISOString().split('T')[0];
    
    if (dateSelector && dateSelector.value) {
        formattedDate = dateSelector.value;
    }
    
    // Điền thông tin lớp vào modal
    document.getElementById('attendance-class-name').textContent = classData.name;
    document.getElementById('attendance-date').textContent = formatDate(formattedDate);
    
    // Ghi log debug
    console.log(`Modal điểm danh cho lớp ${classData.name} - ID: ${classData.id}`);
    console.log(`Lịch học lớp: ${classData.schedule.join(', ')}`);
    console.log(`Ngày điểm danh: ${formattedDate}`);
    console.log(`Học sinh trong lớp: ${students.length}`);
    
    // Tạo danh sách học sinh để điểm danh
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';
    
    // Kiểm tra xem lớp đã được điểm danh cho ngày đã chọn chưa
    const attendance = getAttendance();
    
    // Hiển thị dữ liệu điểm danh để debug
    console.log(`Tổng số bản ghi điểm danh: ${attendance.length}`);
    attendance.forEach(record => {
        console.log(`Bản ghi: Lớp=${record.classId}, Ngày=${record.date}, Học sinh=${record.students ? record.students.length : 0}`);
    });
    
    const dateAttendance = attendance.find(record => 
        record.date === formattedDate && record.classId === classId
    );
    console.log(`Đã tìm thấy bản ghi điểm danh cho ngày đã chọn: ${dateAttendance ? 'Có' : 'Không'}`);
    
    students.forEach(student => {
        const attendanceItem = document.createElement('div');
        
        // Nếu đã điểm danh, sử dụng dữ liệu đã lưu
        let studentStatus = 'present'; // Mặc định là có mặt
        let isPresent = true;
        
        if (dateAttendance) {
            const studentRecord = dateAttendance.students.find(s => s.id === student.id);
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
        if (!classData || classData.locked) return; // Bỏ qua lớp đã khóa
        
        const makeupCard = document.createElement('div');
        makeupCard.className = 'class-card makeup-card';
        
        // Lấy thông tin lớp và danh sách học sinh
        const students = getStudents().filter(student => student.classId === record.classId);
        
        // Tính số học sinh có trạng thái "GV nghỉ"
        const teacherAbsentCount = record.students ? record.students.filter(student => student.status === 'teacher-absent').length : 0;
        
        makeupCard.innerHTML = `
            <h3>${classData.name} - Ngày nghỉ: ${formatDate(record.date)}</h3>
            <div class="class-details">
                <div><span>Ngày nghỉ:</span> ${formatDate(record.date)}</div>
                <div><span>Số học sinh:</span> ${students.length}</div>
                <div><span>Số HS nhận "GV nghỉ":</span> ${teacherAbsentCount}</div>
                ${record.makeupDate ? 
                  `<div><span>Ngày học bù:</span> ${formatDate(record.makeupDate)}</div>` : 
                  '<div><span>Trạng thái:</span> <span class="status-unpaid">Chưa học bù</span></div>'}
            </div>
            <div class="class-actions">
                ${record.makeupDate ? 
                  `<button class="view-makeup-btn" data-id="${record.id}">Xem chi tiết</button>` :
                  `<button class="schedule-makeup-btn" data-id="${record.id}" data-class-id="${record.classId}" data-absent-date="${record.date}">Lên lịch học bù</button>`}
            </div>
        `;
        
        makeupClassesContainer.appendChild(makeupCard);
    });
    
    // Gắn sự kiện cho các nút
    const scheduleMakeupButtons = document.querySelectorAll('.schedule-makeup-btn');
    scheduleMakeupButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.dataset.id;
            const classId = this.dataset.classId;
            const absentDate = this.dataset.absentDate;
            openScheduleMakeupModal(recordId, classId, absentDate);
        });
    });
}

// Mở modal lên lịch học bù
function openScheduleMakeupModal(recordId, classId, absentDate) {
    const modal = document.getElementById('schedule-makeup-modal');
    if (!modal) return;
    
    // Lấy thông tin lớp học
    const classData = getClassById(classId);
    if (!classData) return;
    
    // Điền thông tin vào modal
    document.getElementById('makeup-class-name').textContent = classData.name;
    document.getElementById('makeup-absent-date').textContent = formatDate(absentDate);
    
    // Thiết lập ngày tối thiểu cho bộ chọn ngày (ngày sau ngày vắng)
    const absentDateObj = new Date(absentDate);
    absentDateObj.setDate(absentDateObj.getDate() + 1);
    const minDate = absentDateObj.toISOString().split('T')[0];
    document.getElementById('makeup-date').min = minDate;
    
    // Reset giá trị
    document.getElementById('makeup-date').value = '';
    
    // Gán sự kiện cho nút lưu
    const saveBtn = document.getElementById('save-makeup-btn');
    saveBtn.onclick = function() {
        const makeupDate = document.getElementById('makeup-date').value;
        if (!makeupDate) {
            alert('Vui lòng chọn ngày học bù.');
            return;
        }
        
        saveScheduleMakeup(recordId, makeupDate);
        modal.classList.add('hidden');
    };
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Lưu lịch học bù
function saveScheduleMakeup(recordId, makeupDate) {
    // Lấy danh sách điểm danh
    const attendance = getAttendance();
    
    // Tìm bản ghi cần cập nhật
    const recordIndex = attendance.findIndex(record => record.id === recordId);
    
    if (recordIndex === -1) {
        alert('Không tìm thấy bản ghi điểm danh này.');
        return;
    }
    
    // Cập nhật ngày học bù
    attendance[recordIndex].makeupDate = makeupDate;
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Hiển thị lại danh sách lớp học bù
    displayMakeupClasses();
    
    // Hiển thị thông báo thành công
    showNotification('Đã lên lịch học bù thành công', 'success');
}

// Xử lý điểm danh
function handleAttendance(event) {
    event.preventDefault();
    
    // Lấy classId từ form
    const classId = document.querySelector('input[name="class-id"]').value;
    
    // Lấy ngày điểm danh từ form
    const attendanceDate = document.querySelector('input[name="attendance-date"]').value;
    
    // Lấy danh sách học sinh và trạng thái
    const studentIds = document.querySelectorAll('input[name="student-id"]');
    const students = [];
    
    studentIds.forEach(input => {
        const studentId = input.value;
        const status = document.querySelector(`input[name="status-${studentId}"]:checked`).value;
        
        students.push({
            id: studentId,
            status: status
        });
    });
    
    // Kiểm tra xem tất cả học sinh đều có trạng thái "GV nghỉ" không
    const allTeacherAbsent = students.every(student => student.status === 'teacher-absent');
    
    // Lấy danh sách điểm danh hiện tại
    const attendance = getAttendance();
    
    // Kiểm tra xem đã có bản ghi điểm danh cho ngày đã chọn chưa
    let existingRecord = attendance.find(record => 
        record.date === attendanceDate && record.classId === classId
    );
    
    if (existingRecord) {
        // Cập nhật bản ghi hiện có
        existingRecord.students = students;
        existingRecord.teacherAbsent = allTeacherAbsent;
        
        // Nếu tất cả học sinh là "GV nghỉ", đánh dấu là cần học bù
        if (allTeacherAbsent && !existingRecord.needMakeup) {
            existingRecord.needMakeup = true;
            existingRecord.makeupDate = null;
        }
    } else {
        // Tạo bản ghi mới
        const newRecord = {
            id: generateId('attendance', 5),
            classId: classId,
            date: attendanceDate,
            students: students,
            teacherAbsent: allTeacherAbsent,
            needMakeup: allTeacherAbsent
        };
        
        attendance.push(newRecord);
    }
    
    // Lưu vào localStorage
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Đóng modal
    document.getElementById('attendance-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách lớp
    displayAttendanceClasses();
    
    // Nếu tất cả học sinh đều có trạng thái "GV nghỉ", cập nhật danh sách lớp học bù
    if (allTeacherAbsent) {
        displayMakeupClasses();
    }
    
    // Hiển thị thông báo thành công
    showNotification('Đã cập nhật điểm danh thành công', 'success');
}

// Lấy thông tin điểm danh của học sinh
function getStudentAttendance(studentId) {
    const attendance = getAttendance();
    
    // Lọc các bản ghi có chứa studentId
    return attendance.filter(record => {
        if (!record.students) return false;
        return record.students.some(student => student.id === studentId);
    });
}

// Tính tổng kết điểm danh của học sinh
function calculateAttendanceSummary(studentId) {
    const studentAttendance = getStudentAttendance(studentId);
    
    // Tính số buổi có mặt, vắng mặt và GV nghỉ
    let present = 0;
    let absent = 0;
    let teacherAbsent = 0;
    
    studentAttendance.forEach(record => {
        const studentRecord = record.students.find(student => student.id === studentId);
        if (studentRecord) {
            if (studentRecord.status === 'present') present++;
            else if (studentRecord.status === 'absent') absent++;
            else if (studentRecord.status === 'teacher-absent') teacherAbsent++;
        }
    });
    
    // Tính tổng số buổi học
    const total = present + absent + teacherAbsent;
    
    // Tính tỷ lệ điểm danh
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return {
        present,
        absent,
        teacherAbsent,
        total,
        attendanceRate
    };
}