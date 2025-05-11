/**
 * Quản lý học sinh
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách học sinh
    displayStudents();
    
    // Cập nhật các select box chứa danh sách lớp
    updateClassSelectOptions();
    
    // Xử lý sự kiện thêm học sinh
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
    }
    
    // Xử lý form thêm học sinh
    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }
    
    // Xử lý form chỉnh sửa học sinh
    const editStudentForm = document.getElementById('edit-student-form');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', handleEditStudent);
    }
    
    // Xử lý tìm kiếm học sinh
    const studentSearch = document.getElementById('student-search');
    if (studentSearch) {
        studentSearch.addEventListener('input', filterStudents);
    }
    
    // Xử lý lọc theo lớp
    const classFilter = document.getElementById('class-filter');
    if (classFilter) {
        classFilter.addEventListener('change', filterStudents);
    }
    
    // Xử lý lọc theo trạng thái thanh toán
    const paymentStatusFilter = document.getElementById('payment-status-filter');
    if (paymentStatusFilter) {
        paymentStatusFilter.addEventListener('change', filterStudents);
    }
});

// Hiển thị danh sách học sinh
function displayStudents(filteredStudents = null) {
    const studentsTableBody = document.getElementById('students-table-body');
    if (!studentsTableBody) return;
    
    studentsTableBody.innerHTML = '';
    
    const students = filteredStudents || getStudents();
    
    if (students.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">Chưa có học sinh nào. Vui lòng thêm học sinh mới.</td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const paymentStatus = checkPaymentStatus(student);
        const statusText = getPaymentStatusText(paymentStatus);
        const statusClass = `status-${paymentStatus}`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${getClassName(student.classId)}</td>
            <td>${formatDate(student.registerDate)}</td>
            <td>${student.paymentCycle}</td>
            <td><span class="student-status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="edit-student-btn" data-id="${student.id}">Sửa</button>
                <button class="delete-student-btn" data-id="${student.id}">Xóa</button>
            </td>
        `;
        
        studentsTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút chỉnh sửa và xóa
    attachStudentButtonEvents();
}

// Gắn sự kiện cho các nút chỉnh sửa và xóa học sinh
function attachStudentButtonEvents() {
    // Gắn sự kiện cho nút chỉnh sửa
    const editButtons = document.querySelectorAll('.edit-student-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            openEditStudentModal(studentId);
        });
    });
    
    // Gắn sự kiện cho nút xóa
    const deleteButtons = document.querySelectorAll('.delete-student-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa học sinh này không?')) {
                deleteStudent(studentId);
            }
        });
    });
}

// Mở modal thêm học sinh
function openAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (!modal) return;
    
    // Reset form
    document.getElementById('add-student-form').reset();
    
    // Tạo mã học sinh mới
    const studentId = generateStudentId();
    document.getElementById('student-id').value = studentId;
    
    // Điền ngày đăng ký mặc định (hôm nay)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('student-register-date').value = today;
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Mở modal chỉnh sửa học sinh
function openEditStudentModal(studentId) {
    const modal = document.getElementById('edit-student-modal');
    if (!modal) return;
    
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (student) {
        // Điền thông tin học sinh vào form
        document.getElementById('edit-student-id').value = student.id;
        document.getElementById('edit-student-name').value = student.name;
        document.getElementById('edit-student-class').value = student.classId;
        document.getElementById('edit-student-register-date').value = student.registerDate;
        document.getElementById('edit-student-payment-cycle').value = student.paymentCycle;
        
        // Hiển thị modal
        modal.classList.remove('hidden');
    }
}

// Xử lý thêm học sinh mới
function handleAddStudent(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const name = document.getElementById('student-name').value;
    const id = document.getElementById('student-id').value;
    const classId = document.getElementById('student-class').value;
    const registerDate = document.getElementById('student-register-date').value;
    const paymentCycle = document.getElementById('student-payment-cycle').value;
    
    // Tạo đối tượng học sinh mới
    const newStudent = {
        id,
        name,
        classId,
        registerDate,
        paymentCycle
    };
    
    // Lấy danh sách học sinh hiện tại và thêm học sinh mới
    const students = getStudents();
    students.push(newStudent);
    
    // Lưu vào localStorage
    localStorage.setItem('students', JSON.stringify(students));
    
    // Đóng modal
    document.getElementById('add-student-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách học sinh
    displayStudents();
    
    // Cập nhật danh sách học sinh trong select box của thanh toán
    updateStudentSelectOptions();
}

// Xử lý chỉnh sửa học sinh
function handleEditStudent(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const id = document.getElementById('edit-student-id').value;
    const name = document.getElementById('edit-student-name').value;
    const classId = document.getElementById('edit-student-class').value;
    const registerDate = document.getElementById('edit-student-register-date').value;
    const paymentCycle = document.getElementById('edit-student-payment-cycle').value;
    
    // Lấy danh sách học sinh hiện tại
    let students = getStudents();
    
    // Tìm và cập nhật học sinh
    const index = students.findIndex(student => student.id === id);
    if (index !== -1) {
        students[index] = {
            id,
            name,
            classId,
            registerDate,
            paymentCycle
        };
        
        // Lưu vào localStorage
        localStorage.setItem('students', JSON.stringify(students));
    }
    
    // Đóng modal
    document.getElementById('edit-student-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách học sinh
    displayStudents();
    
    // Cập nhật danh sách học sinh trong select box của thanh toán
    updateStudentSelectOptions();
}

// Xóa học sinh
function deleteStudent(studentId) {
    // Kiểm tra xem học sinh có lịch sử thanh toán không
    const payments = getPayments();
    const hasPayments = payments.some(payment => payment.studentId === studentId);
    
    if (hasPayments) {
        if (!confirm('Học sinh này đã có lịch sử thanh toán. Xóa học sinh sẽ xóa tất cả lịch sử thanh toán. Bạn có chắc chắn muốn tiếp tục?')) {
            return;
        }
        
        // Xóa tất cả thanh toán của học sinh
        const updatedPayments = payments.filter(payment => payment.studentId !== studentId);
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
    }
    
    // Kiểm tra xem học sinh có lịch sử điểm danh không
    const attendance = getAttendance();
    const hasAttendance = attendance.some(record => 
        record.students.some(student => student.id === studentId)
    );
    
    if (hasAttendance) {
        if (!confirm('Học sinh này đã có lịch sử điểm danh. Xóa học sinh sẽ xóa tất cả lịch sử điểm danh của học sinh này. Bạn có chắc chắn muốn tiếp tục?')) {
            return;
        }
        
        // Cập nhật các bản ghi điểm danh để loại bỏ học sinh
        const updatedAttendance = attendance.map(record => {
            record.students = record.students.filter(student => student.id !== studentId);
            return record;
        });
        
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    }
    
    // Lấy danh sách học sinh hiện tại
    let students = getStudents();
    
    // Lọc bỏ học sinh cần xóa
    students = students.filter(student => student.id !== studentId);
    
    // Lưu vào localStorage
    localStorage.setItem('students', JSON.stringify(students));
    
    // Hiển thị lại danh sách học sinh
    displayStudents();
    
    // Cập nhật danh sách học sinh trong select box của thanh toán
    updateStudentSelectOptions();
}

// Lọc học sinh theo tìm kiếm và bộ lọc
function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const classFilter = document.getElementById('class-filter').value;
    const paymentStatusFilter = document.getElementById('payment-status-filter').value;
    
    let filteredStudents = getStudents();
    
    // Lọc theo tìm kiếm
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm) || 
            student.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Lọc theo lớp
    if (classFilter) {
        filteredStudents = filteredStudents.filter(student => student.classId === classFilter);
    }
    
    // Lọc theo trạng thái thanh toán
    if (paymentStatusFilter) {
        filteredStudents = filteredStudents.filter(student => 
            checkPaymentStatus(student) === paymentStatusFilter
        );
    }
    
    // Hiển thị kết quả lọc
    displayStudents(filteredStudents);
}

// Cập nhật danh sách học sinh trong select box của thanh toán
function updateStudentSelectOptions() {
    const students = getStudents();
    
    // Cập nhật select box học sinh trong form thêm thanh toán
    const paymentStudentSelect = document.getElementById('payment-student');
    if (paymentStudentSelect) {
        paymentStudentSelect.innerHTML = '';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.id} - ${getClassName(student.classId)})`;
            paymentStudentSelect.appendChild(option);
        });
    }
}
