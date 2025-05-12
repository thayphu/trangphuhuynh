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
            <h3>${classData.name} ${isLocked ? '<span class="status-unpaid">(Đã khóa)</span>' : ''}</h3>
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
            <div class="class-actions">
                <button class="edit-class-btn" data-id="${classData.id}" ${isLocked ? 'disabled' : ''}>Chỉnh sửa</button>
                <button class="delete-class-btn" data-id="${classData.id}" ${isLocked ? 'disabled' : ''}>Xóa</button>
                <button class="toggle-lock-class-btn" data-id="${classData.id}" data-locked="${isLocked}">
                    ${isLocked ? 'Mở khóa lớp' : 'Khóa lớp'}
                </button>
            </div>
        `;
        
        classesList.appendChild(classCard);
    });
    
    // Thêm sự kiện cho các nút
    attachClassButtonEvents();
}

// Gắn sự kiện cho các nút chỉnh sửa và xóa lớp
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
    
    if (classData) {
        // Điền thông tin lớp vào form
        document.getElementById('edit-class-id').value = classData.id;
        document.getElementById('edit-class-name').value = classData.name;
        document.getElementById('edit-class-time-start').value = classData.timeStart;
        document.getElementById('edit-class-time-end').value = classData.timeEnd;
        document.getElementById('edit-class-location').value = classData.location;
        document.getElementById('edit-class-fee').value = classData.fee;
        document.getElementById('edit-class-payment-cycle').value = classData.paymentCycle;
        
        // Đánh dấu các ngày trong lịch học
        const scheduleCheckboxes = document.querySelectorAll('input[name="edit-schedule"]');
        scheduleCheckboxes.forEach(checkbox => {
            checkbox.checked = classData.schedule.includes(checkbox.value);
        });
        
        // Hiển thị modal
        modal.classList.remove('hidden');
    }
}

// Xử lý thêm lớp mới
function handleAddClass(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    let name = document.getElementById('class-name').value;
    const timeStart = document.getElementById('class-time-start').value;
    const timeEnd = document.getElementById('class-time-end').value;
    let location = document.getElementById('class-location').value;
    const fee = parseInt(document.getElementById('class-fee').value);
    const paymentCycle = document.getElementById('class-payment-cycle').value;
    
    // Áp dụng định dạng viết hoa
    if (window.TextFormatter) {
        name = window.TextFormatter.toTitleCase(name);
        location = window.TextFormatter.toTitleCase(location);
    } else {
        // Định dạng cơ bản nếu không có TextFormatter
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        location = location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    // Lấy lịch học được chọn
    const scheduleCheckboxes = document.querySelectorAll('input[name="schedule"]:checked');
    const schedule = Array.from(scheduleCheckboxes).map(checkbox => checkbox.value);
    
    // Tạo đối tượng lớp học mới
    const newClass = {
        id: generateId('class', 3),
        name,
        schedule,
        timeStart,
        timeEnd,
        location,
        fee,
        paymentCycle
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
    
    // Thông báo dữ liệu đã thay đổi
    document.dispatchEvent(new Event('dataChanged'));
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
    
    // Áp dụng định dạng viết hoa
    if (window.TextFormatter) {
        name = window.TextFormatter.toTitleCase(name);
        location = window.TextFormatter.toTitleCase(location);
    } else {
        // Định dạng cơ bản nếu không có TextFormatter
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        location = location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    // Lấy lịch học được chọn
    const scheduleCheckboxes = document.querySelectorAll('input[name="edit-schedule"]:checked');
    const schedule = Array.from(scheduleCheckboxes).map(checkbox => checkbox.value);
    
    // Lấy danh sách lớp hiện tại
    let classes = getClasses();
    
    // Tìm và cập nhật lớp học
    const index = classes.findIndex(cls => cls.id === id);
    if (index !== -1) {
        classes[index] = {
            id,
            name,
            schedule,
            timeStart,
            timeEnd,
            location,
            fee,
            paymentCycle
        };
        
        // Lưu vào localStorage
        localStorage.setItem('classes', JSON.stringify(classes));
    }
    
    // Đóng modal
    document.getElementById('edit-class-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Thông báo dữ liệu đã thay đổi
    document.dispatchEvent(new Event('dataChanged'));
}

// Xóa lớp học
function deleteClass(classId) {
    // Kiểm tra xem có học sinh nào đang học lớp này không
    const students = getStudents();
    const hasStudents = students.some(student => student.classId === classId);
    
    if (hasStudents) {
        alert('Không thể xóa lớp này vì có học sinh đang học. Vui lòng chuyển học sinh sang lớp khác trước khi xóa.');
        return;
    }
    
    // Lấy danh sách lớp hiện tại
    let classes = getClasses();
    
    // Lọc bỏ lớp cần xóa
    classes = classes.filter(cls => cls.id !== classId);
    
    // Lưu vào localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Hiển thị lại danh sách lớp
    displayClasses();
    
    // Cập nhật danh sách lớp trong các select box
    updateClassSelectOptions();
    
    // Thông báo dữ liệu đã thay đổi
    document.dispatchEvent(new Event('dataChanged'));
}

// Cập nhật các select box chứa danh sách lớp
function updateClassSelectOptions() {
    const classes = getClasses();
    
    // Cập nhật select box lớp học trong form thêm học sinh
    const studentClassSelect = document.getElementById('student-class');
    if (studentClassSelect) {
        studentClassSelect.innerHTML = '';
        classes.forEach(cls => {
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
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            editStudentClassSelect.appendChild(option);
        });
    }
    
    // Cập nhật select box lọc theo lớp trong tab học sinh
    const classFilter = document.getElementById('class-filter');
    if (classFilter) {
        classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classFilter.appendChild(option);
        });
    }
    
    // Cập nhật select box lọc theo lớp trong tab học phí
    const paymentClassFilter = document.getElementById('payment-class-filter');
    if (paymentClassFilter) {
        paymentClassFilter.innerHTML = '<option value="">Tất cả lớp</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            paymentClassFilter.appendChild(option);
        });
    }
}
