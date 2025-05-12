/**
 * Quản lý lớp học
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tạo dữ liệu mẫu nếu cần
    initializeSampleData();
    
    // Hiển thị danh sách lớp
    displayClasses();
    
    // Xử lý sự kiện thêm lớp
    const addClassBtn = document.getElementById('add-class-btn');
    if (addClassBtn) {
        addClassBtn.addEventListener('click', openAddClassModal);
    }
    
    // Xử lý form thêm lớp
    const addClassForm = document.getElementById('add-class-form');
    if (addClassForm) {
        addClassForm.addEventListener('submit', handleAddClass);
    }
    
    // Xử lý form chỉnh sửa lớp
    const editClassForm = document.getElementById('edit-class-form');
    if (editClassForm) {
        editClassForm.addEventListener('submit', handleEditClass);
    }
});

// Hiển thị danh sách lớp
function displayClasses() {
    const classesList = document.getElementById('classes-list');
    if (!classesList) return;
    
    classesList.innerHTML = '';
    
    const classes = getClasses();
    
    if (classes.length === 0) {
        classesList.innerHTML = '<p class="no-data">Chưa có lớp học nào. Vui lòng thêm lớp học mới.</p>';
        return;
    }
    
    // Sắp xếp lớp có lịch học hôm nay lên đầu và phân tách lớp đã khóa xuống dưới
    classes.sort((a, b) => {
        // Lớp đã khóa luôn ở dưới
        if (!a.locked && b.locked) return -1;
        if (a.locked && !b.locked) return 1;
        
        // Nếu cùng trạng thái khóa, sắp xếp theo lớp có lịch hôm nay
        if (!a.locked && !b.locked) {
            const aTodayClass = isClassToday(a);
            const bTodayClass = isClassToday(b);
            
            if (aTodayClass && !bTodayClass) return -1;
            if (!aTodayClass && bTodayClass) return 1;
        }
        
        return 0;
    });
    
    classes.forEach(classData => {
        const isTodayClass = isClassToday(classData);
        const isLocked = classData.locked === true;
        
        const classCard = document.createElement('div');
        classCard.className = `class-card ${isTodayClass ? 'today-class' : ''} ${isLocked ? 'locked-class' : ''}`;
        
        // Tính học phí theo buổi dựa vào chu kỳ
        let sessionFee = 0;
        let totalFee = classData.fee;
        
        if (classData.paymentCycle === '1 tháng') {
            // Nếu chu kỳ là 1 tháng, học phí/buổi = học phí ÷ 8
            sessionFee = Math.round(classData.fee / 8);
        } else if (classData.paymentCycle === '8 buổi') {
            // Nếu chu kỳ là 8 buổi, số tiền đã nhập là học phí/buổi, tổng học phí = fee × 8
            sessionFee = classData.fee;
            totalFee = classData.fee * 8;
        } else if (classData.paymentCycle === '10 buổi') {
            // Nếu chu kỳ là 10 buổi, số tiền đã nhập là học phí/buổi, tổng học phí = fee × 10
            sessionFee = classData.fee;
            totalFee = classData.fee * 10;
        } else if (classData.paymentCycle === 'Theo ngày') {
            // Nếu chu kỳ là Theo ngày, học phí/buổi = học phí đã nhập
            sessionFee = classData.fee;
        }
        
        classCard.innerHTML = `
            <div class="class-header">
                <h3>${classData.name} ${isLocked ? '<span class="status-unpaid">(Đã khóa)</span>' : ''}</h3>
                <div class="class-action-buttons">
                    <button class="icon-btn edit-class-btn" data-id="${classData.id}" ${isLocked ? 'disabled' : ''} title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn toggle-lock-class-btn" data-id="${classData.id}" data-locked="${isLocked}" title="${isLocked ? 'Mở khóa lớp' : 'Khóa lớp'}">
                        <i class="fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i>
                    </button>
                    <button class="icon-btn delete-class-btn" data-id="${classData.id}" ${isLocked ? 'disabled' : ''} title="Xóa">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="class-details">
                <div>
                    <span>Lịch học:</span> ${formatSchedule(classData.schedule)}
                </div>
                <div>
                    <span>Giờ học:</span> ${formatTime(classData.timeStart)} - ${formatTime(classData.timeEnd)}
                </div>
                <div>
                    <span>Địa điểm:</span> ${classData.location}
                </div>
                <div>
                    <span>Tổng học phí:</span> <span class="fee-highlight">${formatCurrency(totalFee)} VND</span>
                </div>
                <div>
                    <span>Chu kỳ:</span> ${classData.paymentCycle}
                </div>
                <div>
                    <span>Học phí/buổi:</span> ${formatCurrency(sessionFee)} VND
                </div>
                <div>
                    <span>Trạng thái:</span> <span class="${isLocked ? 'status-unpaid' : 'status-paid'}">${isLocked ? 'Lớp này đã đóng' : 'Đang hoạt động'}</span>
                </div>
            </div>
        `;
        
        classesList.appendChild(classCard);
    });
    
    // Thêm sự kiện cho các nút
    attachClassButtonEvents();
}

// Gắn sự kiện cho các nút chỉnh sửa, xóa và khóa/mở khóa lớp
function attachClassButtonEvents() {
    // Gắn sự kiện cho nút chỉnh sửa
    const editButtons = document.querySelectorAll('.edit-class-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classId = this.dataset.id;
            openEditClassModal(classId);
        });
    });
    
    // Gắn sự kiện cho nút xóa
    const deleteButtons = document.querySelectorAll('.delete-class-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classId = this.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa lớp học này không?')) {
                deleteClass(classId);
            }
        });
    });
    
    // Gắn sự kiện cho nút khóa/mở khóa lớp
    const toggleLockButtons = document.querySelectorAll('.toggle-lock-class-btn');
    toggleLockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classId = this.dataset.id;
            const isLocked = this.dataset.locked === 'true';
            
            const confirmMessage = isLocked 
                ? 'Bạn có chắc chắn muốn mở khóa lớp học này? Lớp học sẽ hoạt động trở lại và có thể được thêm học sinh mới.'
                : 'Bạn có chắc chắn muốn khóa lớp học này? Các học sinh trong lớp sẽ không được tính chu kỳ thanh toán và lớp sẽ không hiển thị trong tab điểm danh.';
                
            if (confirm(confirmMessage)) {
                toggleClassLock(classId, !isLocked);
            }
        });
    });
}

// Mở modal thêm lớp
function openAddClassModal() {
    const modal = document.getElementById('add-class-modal');
    if (modal) {
        // Reset form
        document.getElementById('add-class-form').reset();
        
        // Hiển thị modal
        modal.classList.remove('hidden');
    }
}

// Mở modal chỉnh sửa lớp
function openEditClassModal(classId) {
    const modal = document.getElementById('edit-class-modal');
    if (!modal) return;
    
    const classes = getClasses();
    const classData = classes.find(cls => cls.id === classId);
    
    if (!classData) {
        alert('Không tìm thấy thông tin lớp học.');
        return;
    }
    
    // Điền thông tin lớp vào form
    document.getElementById('edit-class-id').value = classData.id;
    document.getElementById('edit-class-name').value = classData.name;
    document.getElementById('edit-class-location').value = classData.location;
    document.getElementById('edit-class-time-start').value = classData.timeStart;
    document.getElementById('edit-class-time-end').value = classData.timeEnd;
    document.getElementById('edit-class-fee').value = classData.fee;
    document.getElementById('edit-class-payment-cycle').value = classData.paymentCycle;
    
    // Bỏ chọn tất cả các checkbox
    const scheduleCheckboxes = document.querySelectorAll('input[name="edit-schedule"]');
    scheduleCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Chọn các ngày trong lịch học
    classData.schedule.forEach(day => {
        const checkbox = document.querySelector(`input[name="edit-schedule"][value="${day}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Xử lý thêm lớp
function handleAddClass(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    let name = document.getElementById('class-name').value;
    const timeStart = document.getElementById('class-time-start').value;
    const timeEnd = document.getElementById('class-time-end').value;
    let location = document.getElementById('class-location').value;
    const fee = parseInt(document.getElementById('class-fee').value);
    const paymentCycle = document.getElementById('class-payment-cycle').value;
    
    // Lấy lịch học từ các checkbox
    const scheduleCheckboxes = document.querySelectorAll('input[name="schedule"]:checked');
    const schedule = Array.from(scheduleCheckboxes).map(checkbox => checkbox.value);
    
    if (schedule.length === 0) {
        alert('Vui lòng chọn ít nhất một ngày trong tuần cho lịch học.');
        return;
    }
    
    // Tạo lớp mới
    const newClass = {
        id: generateId('class', 3),
        name,
        schedule,
        timeStart,
        timeEnd,
        location,
        fee,
        paymentCycle,
        locked: false  // Lớp mới mặc định không bị khóa
    };
    
    // Lấy danh sách lớp hiện tại và thêm lớp mới
    const classes = getClasses();
    classes.push(newClass);
    
    // Lưu vào localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Đóng modal
    document.getElementById('add-class-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Hiển thị thông báo thành công
    showNotification('Đã thêm lớp học mới thành công', 'success');
}

// Xử lý chỉnh sửa lớp
function handleEditClass(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const id = document.getElementById('edit-class-id').value;
    let name = document.getElementById('edit-class-name').value;
    const timeStart = document.getElementById('edit-class-time-start').value;
    const timeEnd = document.getElementById('edit-class-time-end').value;
    let location = document.getElementById('edit-class-location').value;
    const fee = parseInt(document.getElementById('edit-class-fee').value);
    const paymentCycle = document.getElementById('edit-class-payment-cycle').value;
    
    // Lấy lịch học từ các checkbox
    const scheduleCheckboxes = document.querySelectorAll('input[name="edit-schedule"]:checked');
    const schedule = Array.from(scheduleCheckboxes).map(checkbox => checkbox.value);
    
    if (schedule.length === 0) {
        alert('Vui lòng chọn ít nhất một ngày trong tuần cho lịch học.');
        return;
    }
    
    // Lấy danh sách lớp hiện tại
    const classes = getClasses();
    
    // Tìm lớp cần cập nhật
    const classIndex = classes.findIndex(cls => cls.id === id);
    
    if (classIndex === -1) {
        alert('Không tìm thấy lớp học cần cập nhật.');
        return;
    }
    
    // Lưu trạng thái khóa hiện tại
    const lockedStatus = classes[classIndex].locked || false;
    
    // Cập nhật thông tin lớp
    classes[classIndex] = {
        id,
        name,
        schedule,
        timeStart,
        timeEnd,
        location,
        fee,
        paymentCycle,
        locked: lockedStatus // Giữ nguyên trạng thái khóa
    };
    
    // Lưu vào localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Đóng modal
    document.getElementById('edit-class-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Hiển thị thông báo thành công
    showNotification('Đã cập nhật lớp học thành công', 'success');
}

// Xóa lớp
function deleteClass(classId) {
    // Lấy danh sách lớp
    const classes = getClasses();
    
    // Kiểm tra xem có học sinh nào đang học lớp này không
    const students = getStudents();
    const classStudents = students.filter(student => student.classId === classId);
    
    if (classStudents.length > 0) {
        alert(`Không thể xóa lớp này vì có ${classStudents.length} học sinh đang theo học. Vui lòng chuyển các học sinh sang lớp khác trước khi xóa.`);
        return;
    }
    
    // Lấy danh sách lớp hiện tại
    let classesList = getClasses();
    
    // Lọc bỏ lớp cần xóa
    classesList = classesList.filter(cls => cls.id !== classId);
    
    // Lưu vào localStorage
    localStorage.setItem('classes', JSON.stringify(classesList));
    
    // Hiển thị lại danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Hiển thị thông báo thành công
    showNotification('Đã xóa lớp học thành công', 'success');
}

// Cập nhật các select box chứa danh sách lớp
function updateClassSelectOptions() {
    const classes = getClasses();
    const unlockedClasses = classes.filter(cls => !cls.locked);
    
    // Cập nhật select box lớp học trong form thêm học sinh
    const studentClassSelect = document.getElementById('student-class');
    if (studentClassSelect) {
        studentClassSelect.innerHTML = '';
        unlockedClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            studentClassSelect.appendChild(option);
        });
    }
    
    // Cập nhật select box lớp học trong form chỉnh sửa học sinh
    const editStudentClassSelect = document.getElementById('edit-student-class');
    if (editStudentClassSelect) {
        editStudentClassSelect.innerHTML = '';
        unlockedClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            editStudentClassSelect.appendChild(option);
        });
    }
    
    // Cập nhật select box lọc theo lớp trong tab học phí
    const paymentClassFilter = document.getElementById('payment-class-filter');
    if (paymentClassFilter) {
        paymentClassFilter.innerHTML = '<option value="">Tất cả lớp</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name + (cls.locked ? ' (Đã khóa)' : '');
            paymentClassFilter.appendChild(option);
        });
    }
    
    // Cập nhật select box lọc trong báo cáo
    const attendanceHistoryClassFilter = document.getElementById('attendance-history-class-filter');
    if (attendanceHistoryClassFilter) {
        attendanceHistoryClassFilter.innerHTML = '<option value="">Tất cả lớp</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name + (cls.locked ? ' (Đã khóa)' : '');
            attendanceHistoryClassFilter.appendChild(option);
        });
    }
}

// Khóa hoặc mở khóa lớp học
function toggleClassLock(classId, lockStatus) {
    let classes = getClasses();
    
    // Tìm lớp cần thay đổi trạng thái
    const classIndex = classes.findIndex(cls => cls.id === classId);
    
    if (classIndex === -1) {
        alert('Không tìm thấy lớp học.');
        return;
    }
    
    // Thay đổi trạng thái khóa
    classes[classIndex].locked = lockStatus;
    
    // Lưu lại vào localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Cập nhật danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Hiển thị thông báo
    const message = lockStatus 
        ? `Đã khóa lớp ${classes[classIndex].name} thành công` 
        : `Đã mở khóa lớp ${classes[classIndex].name} thành công`;
    
    showNotification(message, 'success');
    
    // Cập nhật trạng thái điểm danh nếu có
    if (typeof displayAttendanceClasses === 'function') {
        displayAttendanceClasses();
    }
    
    // Cập nhật báo cáo nếu đang ở tab báo cáo
    if (document.querySelector('.tab[data-tab="reports"].active')) {
        setupReportsTab();
    }
}