/**
 * Quản lý báo cáo và thống kê
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật dữ liệu báo cáo khi tab báo cáo được hiển thị
    const reportsTab = document.querySelector('.tab[data-tab="reports"]');
    if (reportsTab) {
        reportsTab.addEventListener('click', setupReportsTab);
    }
    
    // Thiết lập các tab báo cáo
    setupReportTabs();
    
    // Thiết lập sự kiện cho các thẻ thống kê
    setupReportCardEvents();
    
    // Thiết lập bộ lọc lịch sử điểm danh
    setupAttendanceHistoryFilters();
});

// Thiết lập các tab báo cáo
function setupReportTabs() {
    const tabButtons = document.querySelectorAll('.report-tab');
    const tabContents = document.querySelectorAll('.report-tab-content');
    
    if (tabButtons.length === 0 || tabContents.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa active class khỏi tất cả tab buttons và contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Thêm active class cho tab button được click
            button.classList.add('active');
            
            // Hiển thị tab content tương ứng
            const targetTab = button.getAttribute('data-tab');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Nếu là tab lịch sử điểm danh, cập nhật dữ liệu
                if (targetTab === 'attendance-history') {
                    displayAttendanceHistory();
                }
            }
        });
    });
}

// Thiết lập sự kiện cho các thẻ báo cáo
function setupReportCardEvents() {
    // Thẻ học sinh đã thanh toán
    const paidStudentsCard = document.getElementById('paid-students-card');
    if (paidStudentsCard) {
        paidStudentsCard.addEventListener('click', () => {
            displayPaidStudentsModal();
        });
    }
    
    // Thẻ học sinh chưa thanh toán
    const unpaidStudentsCard = document.getElementById('unpaid-students-card');
    if (unpaidStudentsCard) {
        unpaidStudentsCard.addEventListener('click', () => {
            displayUnpaidStudentsModal();
        });
    }
    
    // Thẻ tổng hợp học sinh
    const totalStudentsCard = document.getElementById('total-students-card');
    if (totalStudentsCard) {
        totalStudentsCard.addEventListener('click', () => {
            displayStudentsAttendanceModal();
        });
    }
    
    // Thẻ học sinh có mặt
    const presentStudentsCard = document.getElementById('present-students-card');
    if (presentStudentsCard) {
        presentStudentsCard.addEventListener('click', () => {
            displayPresentStudentsModal();
        });
    }
    
    // Thẻ học sinh vắng mặt
    const absentStudentsCard = document.getElementById('absent-students-card');
    if (absentStudentsCard) {
        absentStudentsCard.addEventListener('click', () => {
            displayAbsentStudentsModal();
        });
    }
    
    // Thẻ GV vắng
    const teacherAbsentCard = document.getElementById('teacher-absent-card');
    if (teacherAbsentCard) {
        teacherAbsentCard.addEventListener('click', () => {
            displayTeacherAbsentClassesModal();
        });
    }
}

// Thiết lập bộ lọc lịch sử điểm danh
function setupAttendanceHistoryFilters() {
    // Thiết lập các tùy chọn lớp
    const classFilter = document.getElementById('attendance-history-class-filter');
    if (classFilter) {
        const classes = getClasses();
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classFilter.appendChild(option);
        });
    }
    
    // Nút áp dụng bộ lọc
    const applyFilterBtn = document.getElementById('apply-attendance-filter');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            displayAttendanceHistory(true);
        });
    }
    
    // Nút xóa bộ lọc
    const clearFilterBtn = document.getElementById('clear-attendance-filter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            if (classFilter) classFilter.value = '';
            const statusFilter = document.getElementById('attendance-history-status-filter');
            if (statusFilter) statusFilter.value = '';
            displayAttendanceHistory();
        });
    }
}

// Thiết lập tab báo cáo khi tab chính được hiển thị
function setupReportsTab() {
    // Cập nhật dữ liệu báo cáo tài chính
    updateFinancialReport();
    
    // Cập nhật dữ liệu thống kê điểm danh
    updateAttendanceStats();
    
    // Hiển thị lớp đã khóa
    displayLockedClasses();
}

// Cập nhật dữ liệu báo cáo tài chính
function updateFinancialReport() {
    const students = getStudents();
    const payments = getPayments();
    
    let paidStudentsCount = 0;
    let paidStudentsAmount = 0;
    let unpaidStudentsCount = 0;
    let unpaidStudentsAmount = 0;
    
    students.forEach(student => {
        const status = checkPaymentStatus(student);
        
        if (status === 'paid') {
            paidStudentsCount++;
            // Tính tổng số tiền đã thanh toán
            const studentPayments = payments.filter(p => p.studentId === student.id);
            studentPayments.forEach(payment => {
                paidStudentsAmount += payment.amount;
            });
        } else if (status === 'unpaid' || status === 'overdue') {
            unpaidStudentsCount++;
            // Ước tính số tiền dự kiến từ học phí của học sinh
            const classData = getClassById(student.classId);
            if (classData) {
                unpaidStudentsAmount += classData.tuition;
            }
        }
    });
    
    const paidStudentsCountElement = document.getElementById('paid-students-count');
    const paidStudentsAmountElement = document.getElementById('paid-students-amount');
    const unpaidStudentsCountElement = document.getElementById('unpaid-students-count');
    const unpaidStudentsAmountElement = document.getElementById('unpaid-students-amount');
    
    // Cập nhật thẻ đã thanh toán (nếu phần tử tồn tại)
    if (paidStudentsCountElement) {
        paidStudentsCountElement.textContent = paidStudentsCount;
    }
    
    if (paidStudentsAmountElement) {
        paidStudentsAmountElement.textContent = formatCurrency(paidStudentsAmount) + ' VND';
    }
    
    // Cập nhật thẻ chưa thanh toán (nếu phần tử tồn tại)
    if (unpaidStudentsCountElement) {
        unpaidStudentsCountElement.textContent = unpaidStudentsCount;
    }
    
    if (unpaidStudentsAmountElement) {
        unpaidStudentsAmountElement.textContent = formatCurrency(unpaidStudentsAmount) + ' VND';
    }
}

// Cập nhật dữ liệu thống kê điểm danh
function updateAttendanceStats() {
    const students = getStudents();
    const attendance = getAttendance();
    
    let presentCount = 0;
    let absentCount = 0;
    let teacherAbsentCount = 0;
    
    // Số lớp có giáo viên vắng
    const teacherAbsentClasses = new Set();
    
    attendance.forEach(record => {
        let hasTeacherAbsent = false;
        
        record.students.forEach(student => {
            switch(student.status) {
                case 'present':
                    presentCount++;
                    break;
                case 'absent':
                    absentCount++;
                    break;
                case 'teacher-absent':
                    hasTeacherAbsent = true;
                    break;
            }
        });
        
        if (hasTeacherAbsent) {
            teacherAbsentClasses.add(record.classId + '-' + record.date);
        }
    });
    
    const totalStudentsElement = document.getElementById('total-students');
    const presentStudentsElement = document.getElementById('present-students');
    const absentStudentsElement = document.getElementById('absent-students');
    const teacherAbsentClassesElement = document.getElementById('teacher-absent-classes');
    
    // Cập nhật thẻ tổng số học sinh (nếu phần tử tồn tại)
    if (totalStudentsElement) {
        totalStudentsElement.textContent = students.length;
    }
    
    // Cập nhật thẻ có mặt (nếu phần tử tồn tại)
    if (presentStudentsElement) {
        presentStudentsElement.textContent = presentCount;
    }
    
    // Cập nhật thẻ vắng mặt (nếu phần tử tồn tại)
    if (absentStudentsElement) {
        absentStudentsElement.textContent = absentCount;
    }
    
    // Cập nhật thẻ GV vắng (nếu phần tử tồn tại)
    if (teacherAbsentClassesElement) {
        teacherAbsentClassesElement.textContent = teacherAbsentClasses.size;
    }
}

// Hiển thị danh sách lớp đã khóa
function displayLockedClasses() {
    const lockedClassesContainer = document.getElementById('locked-classes-container');
    const noLockedClassesMessage = document.getElementById('no-locked-classes');
    
    if (!lockedClassesContainer) return;
    
    // Xóa nội dung hiện tại (trừ thông báo không có lớp khóa)
    Array.from(lockedClassesContainer.children).forEach(child => {
        if (child.id !== 'no-locked-classes') {
            child.remove();
        }
    });
    
    // Lấy danh sách lớp đã khóa
    const classes = getClasses().filter(cls => cls.locked === true);
    
    // Hiển thị thông báo nếu không có lớp nào bị khóa
    if (classes.length === 0) {
        noLockedClassesMessage.style.display = 'block';
        return;
    }
    
    // Ẩn thông báo không có lớp bị khóa
    noLockedClassesMessage.style.display = 'none';
    
    // Hiển thị các lớp đã khóa
    classes.forEach(classData => {
        // Đếm số học sinh trong lớp
        const students = getStudents().filter(student => student.classId === classData.id);
        const studentCount = students.length;
        
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
        
        const classCard = document.createElement('div');
        classCard.className = 'class-card locked-class';
        
        classCard.innerHTML = `
            <h3>${classData.name} <span class="status-unpaid">(Đã khóa)</span></h3>
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
                    <span>Số học sinh:</span> ${studentCount}
                </div>
            </div>
            <div class="class-actions">
                <button class="toggle-lock-class-btn" data-id="${classData.id}" data-locked="true">
                    Mở khóa lớp
                </button>
            </div>
        `;
        
        lockedClassesContainer.appendChild(classCard);
    });
    
    // Gắn sự kiện cho các nút mở khóa
    const unlockButtons = document.querySelectorAll('#locked-classes-container .toggle-lock-class-btn');
    unlockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classId = this.dataset.id;
            
            if (confirm('Bạn có chắc chắn muốn mở khóa lớp học này? Lớp học sẽ hoạt động trở lại và có thể được thêm học sinh mới.')) {
                toggleClassLock(classId, false);
                displayLockedClasses(); // Cập nhật lại danh sách
            }
        });
    });
}

// Hiển thị modal học sinh đã thanh toán
function displayPaidStudentsModal() {
    const students = getStudents();
    const payments = getPayments();
    const classes = getClasses();
    
    const paidStudents = [];
    
    students.forEach(student => {
        const status = checkPaymentStatus(student);
        
        if (status === 'paid') {
            // Tìm thanh toán mới nhất của học sinh
            const studentPayments = payments.filter(p => p.studentId === student.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (studentPayments.length > 0) {
                const latestPayment = studentPayments[0];
                const classData = classes.find(c => c.id === student.classId);
                
                paidStudents.push({
                    id: student.id,
                    name: student.name,
                    className: classData ? classData.name : 'Không xác định',
                    paymentCycle: student.paymentCycle,
                    paymentDate: latestPayment.date,
                    amount: latestPayment.amount
                });
            }
        }
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('paid-students-table-body');
    tableBody.innerHTML = '';
    
    paidStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${student.paymentCycle}</td>
            <td>${formatDate(student.paymentDate)}</td>
            <td>${formatCurrency(student.amount)} VND</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Hiển thị modal
    document.getElementById('paid-students-modal').classList.remove('hidden');
}

// Hiển thị modal học sinh chưa thanh toán
function displayUnpaidStudentsModal() {
    const students = getStudents();
    const classes = getClasses();
    
    const unpaidStudents = [];
    
    students.forEach(student => {
        const status = checkPaymentStatus(student);
        
        if (status === 'unpaid' || status === 'overdue') {
            const classData = classes.find(c => c.id === student.classId);
            const nextPaymentDate = calculateNextPaymentDate(student.lastPaymentDate, student.paymentCycle);
            
            unpaidStudents.push({
                id: student.id,
                name: student.name,
                className: classData ? classData.name : 'Không xác định',
                paymentCycle: student.paymentCycle,
                dueDate: nextPaymentDate,
                estimatedAmount: classData ? classData.tuition : 0
            });
        }
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('unpaid-students-report-table-body');
    tableBody.innerHTML = '';
    
    unpaidStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${student.paymentCycle}</td>
            <td>${formatDate(student.dueDate)}</td>
            <td>${formatCurrency(student.estimatedAmount)} VND</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Hiển thị modal
    document.getElementById('unpaid-students-modal').classList.remove('hidden');
}

// Hiển thị modal thống kê điểm danh học sinh
function displayStudentsAttendanceModal() {
    const students = getStudents();
    const classes = getClasses();
    const payments = getPayments();
    const attendance = getAttendance();
    
    const studentsAttendance = [];
    
    students.forEach(student => {
        const classData = classes.find(c => c.id === student.classId);
        
        // Tính tổng số tiền đã thanh toán
        let totalPaid = 0;
        const studentPayments = payments.filter(p => p.studentId === student.id);
        if (studentPayments && studentPayments.length > 0) {
            studentPayments.forEach(payment => {
                if (payment && typeof payment.amount === 'number') {
                    totalPaid += payment.amount;
                }
            });
        }
        
        // Tính thống kê điểm danh cho học sinh này
        let totalSessions = 0;
        let presentCount = 0;
        let absentCount = 0;
        
        attendance.forEach(record => {
            if (record.students && Array.isArray(record.students)) {
                const studentRecord = record.students.find(s => s.studentId === student.id);
                if (studentRecord) {
                    totalSessions++;
                    
                    if (studentRecord.status === 'present') {
                        presentCount++;
                    } else if (studentRecord.status === 'absent') {
                        absentCount++;
                    }
                }
            }
        });
        
        studentsAttendance.push({
            id: student.id,
            name: student.name,
            className: classData ? classData.name : 'Không xác định',
            paymentCycle: student.paymentCycle,
            totalSessions: totalSessions,
            present: presentCount,
            absent: absentCount,
            totalPaid: totalPaid
        });
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('students-attendance-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #students-attendance-table-body");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (studentsAttendance.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" class="text-center">Không có dữ liệu điểm danh.</td>`;
        tableBody.appendChild(row);
    } else {
        studentsAttendance.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.className}</td>
                <td>${student.paymentCycle}</td>
                <td>${student.totalSessions}</td>
                <td>${student.present}</td>
                <td>${student.absent}</td>
                <td>${formatCurrency(student.totalPaid)} VND</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Hiển thị modal
    const modal = document.getElementById('students-attendance-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("Không tìm thấy phần tử #students-attendance-modal");
    }
}

// Hiển thị modal học sinh có mặt
function displayPresentStudentsModal() {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();
    
    const presentStudents = [];
    
    attendance.forEach(record => {
        const classData = classes.find(c => c.id === record.classId);
        
        // Kiểm tra cấu trúc dữ liệu attendance
        if (!record.students || !Array.isArray(record.students)) {
            return;
        }
        
        record.students.forEach(studentAttendance => {
            if (studentAttendance.status === 'present') {
                const student = students.find(s => s.id === studentAttendance.studentId);
                
                if (student) {
                    presentStudents.push({
                        id: student.id,
                        name: student.name,
                        className: classData ? classData.name : 'Không xác định',
                        date: record.date,
                        note: studentAttendance.note || ''
                    });
                }
            }
        });
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('present-students-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #present-students-table-body");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (presentStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Không có dữ liệu học sinh có mặt.</td>`;
        tableBody.appendChild(row);
    } else {
        // Sắp xếp theo ngày gần nhất
        presentStudents.sort((a, b) => {
            try {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return 0; // Giữ nguyên thứ tự nếu ngày không hợp lệ
                }
                
                return dateB - dateA;
            } catch (e) {
                console.error("Lỗi khi so sánh ngày:", e);
                return 0;
            }
        });
        
        presentStudents.forEach(record => {
            const row = document.createElement('tr');
            const formattedDate = formatDate(record.date);
            
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.className}</td>
                <td>${formattedDate}</td>
                <td>${record.note}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Hiển thị modal
    const modal = document.getElementById('present-students-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("Không tìm thấy phần tử #present-students-modal");
    }
}

// Hiển thị modal học sinh vắng mặt
function displayAbsentStudentsModal() {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();
    
    const absentStudents = [];
    
    attendance.forEach(record => {
        const classData = classes.find(c => c.id === record.classId);
        
        // Kiểm tra cấu trúc dữ liệu attendance
        if (!record.students || !Array.isArray(record.students)) {
            return;
        }
        
        record.students.forEach(studentAttendance => {
            if (studentAttendance.status === 'absent') {
                const student = students.find(s => s.id === studentAttendance.studentId);
                
                if (student) {
                    absentStudents.push({
                        id: student.id,
                        name: student.name,
                        className: classData ? classData.name : 'Không xác định',
                        date: record.date,
                        note: studentAttendance.note || ''
                    });
                }
            }
        });
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('absent-students-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #absent-students-table-body");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (absentStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Không có dữ liệu học sinh vắng mặt.</td>`;
        tableBody.appendChild(row);
    } else {
        // Sắp xếp theo ngày gần nhất
        absentStudents.sort((a, b) => {
            try {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return 0; // Giữ nguyên thứ tự nếu ngày không hợp lệ
                }
                
                return dateB - dateA;
            } catch (e) {
                console.error("Lỗi khi so sánh ngày:", e);
                return 0;
            }
        });
        
        absentStudents.forEach(record => {
            const row = document.createElement('tr');
            const formattedDate = formatDate(record.date);
            
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.className}</td>
                <td>${formattedDate}</td>
                <td>${record.note}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Hiển thị modal
    const modal = document.getElementById('absent-students-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("Không tìm thấy phần tử #absent-students-modal");
    }
}

// Hiển thị modal lớp giáo viên vắng
function displayTeacherAbsentClassesModal() {
    const classes = getClasses();
    const attendance = getAttendance();
    
    const teacherAbsentClasses = [];
    
    attendance.forEach(record => {
        // Kiểm tra cấu trúc dữ liệu attendance
        if (!record.students || !Array.isArray(record.students)) {
            return;
        }
        
        // Kiểm tra xem lớp này có giáo viên vắng không
        const hasTeacherAbsent = record.students.some(student => student.status === 'teacher-absent');
        
        if (hasTeacherAbsent) {
            const classData = classes.find(c => c.id === record.classId);
            
            // Tìm lịch học bù (nếu có)
            const makeupSchedule = record.makeupDate || '';
            const makeupStatus = record.makeupDate ? 'Đã lên lịch' : 'Chưa lên lịch';
            
            teacherAbsentClasses.push({
                className: classData ? classData.name : 'Không xác định',
                date: record.date,
                makeupDate: makeupSchedule,
                status: makeupStatus
            });
        }
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('teacher-absent-classes-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #teacher-absent-classes-table-body");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (teacherAbsentClasses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">Không có dữ liệu lớp giáo viên vắng.</td>`;
        tableBody.appendChild(row);
    } else {
        // Sắp xếp theo ngày gần nhất
        teacherAbsentClasses.sort((a, b) => {
            try {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return 0; // Giữ nguyên thứ tự nếu ngày không hợp lệ
                }
                
                return dateB - dateA;
            } catch (e) {
                console.error("Lỗi khi so sánh ngày:", e);
                return 0;
            }
        });
        
        teacherAbsentClasses.forEach(record => {
            const row = document.createElement('tr');
            const formattedDate = formatDate(record.date);
            const formattedMakeupDate = record.makeupDate ? formatDate(record.makeupDate) : 'Chưa lên lịch';
            
            row.innerHTML = `
                <td>${record.className}</td>
                <td>${formattedDate}</td>
                <td>${formattedMakeupDate}</td>
                <td>${record.status}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Hiển thị modal
    const modal = document.getElementById('teacher-absent-classes-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("Không tìm thấy phần tử #teacher-absent-classes-modal");
    }
}

// Hiển thị lịch sử điểm danh
function displayAttendanceHistory(useFilters = false) {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();
    
    // Lấy giá trị bộ lọc
    let classFilterValue = '';
    let statusFilterValue = '';
    
    if (useFilters) {
        const classFilter = document.getElementById('attendance-history-class-filter');
        if (classFilter) classFilterValue = classFilter.value;
        
        const statusFilter = document.getElementById('attendance-history-status-filter');
        if (statusFilter) statusFilterValue = statusFilter.value;
    }
    
    // Tạo danh sách lịch sử điểm danh
    const attendanceHistory = [];
    
    attendance.forEach(record => {
        const classData = classes.find(c => c.id === record.classId);
        // Bỏ qua nếu không tìm thấy lớp hoặc lớp bị lọc
        if (!classData || (classFilterValue && record.classId !== classFilterValue)) {
            return;
        }
        
        // Kiểm tra xem có học sinh nào trong bản ghi không
        if (!record.students || !Array.isArray(record.students)) {
            return;
        }
        
        // Biến để kiểm tra xem có học sinh nào có trạng thái 'teacher-absent'
        let hasTeacherAbsent = false;
        
        record.students.forEach(studentAttendance => {
            // Kiểm tra có phải GV vắng không
            if (studentAttendance.status === 'teacher-absent') {
                hasTeacherAbsent = true;
            }
            
            // Áp dụng bộ lọc trạng thái
            if (statusFilterValue && studentAttendance.status !== statusFilterValue) {
                return;
            }
            
            // Tìm thông tin học sinh
            const student = students.find(s => s.id === studentAttendance.studentId);
            
            if (student) {
                let statusText = '';
                switch(studentAttendance.status) {
                    case 'present':
                        statusText = 'Có mặt';
                        break;
                    case 'absent':
                        statusText = 'Vắng mặt';
                        break;
                    case 'teacher-absent':
                        statusText = 'GV vắng';
                        break;
                    default:
                        statusText = 'Không xác định';
                }
                
                attendanceHistory.push({
                    date: record.date,
                    className: classData.name,
                    studentName: student.name,
                    studentId: student.id,
                    status: statusText,
                    statusCode: studentAttendance.status,
                    note: studentAttendance.note || ''
                });
            }
        });
        
        // Nếu không có trạng thái teacher-absent trong record, nhưng có một phần tử 'teacher-absent'
        // thì bổ sung bản ghi GV vắng cho tất cả học sinh trong lớp (nếu không có bộ lọc trạng thái hoặc bộ lọc là 'teacher-absent')
        if (hasTeacherAbsent && (!statusFilterValue || statusFilterValue === 'teacher-absent')) {
            students.forEach(student => {
                if (student.classId === record.classId) {
                    // Kiểm tra xem đã có bản ghi nào cho học sinh này trong ngày này chưa
                    const existingRecord = attendanceHistory.find(
                        r => r.studentId === student.id && r.date === record.date
                    );
                    
                    // Nếu chưa có, thêm bản ghi mới
                    if (!existingRecord) {
                        attendanceHistory.push({
                            date: record.date,
                            className: classData.name,
                            studentName: student.name,
                            studentId: student.id,
                            status: 'GV vắng',
                            statusCode: 'teacher-absent',
                            note: 'Giáo viên vắng mặt'
                        });
                    }
                }
            });
        }
    });
    
    // Sắp xếp theo ngày gần nhất
    attendanceHistory.sort((a, b) => {
        // Thử so sánh ngày
        try {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Kiểm tra xem ngày có hợp lệ không
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0; // Giữ nguyên thứ tự nếu ngày không hợp lệ
            }
            
            return dateB - dateA;
        } catch (e) {
            console.error("Lỗi khi so sánh ngày:", e);
            return 0; // Giữ nguyên thứ tự nếu có lỗi
        }
    });
    
    // Hiển thị danh sách nếu có phần tử tbody
    const tableBody = document.getElementById('attendance-history-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #attendance-history-table-body");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (attendanceHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Không có dữ liệu điểm danh phù hợp.</td>`;
        tableBody.appendChild(row);
    } else {
        attendanceHistory.forEach(record => {
            const row = document.createElement('tr');
            const formattedDate = formatDate(record.date);
            
            // Thêm class màu sắc dựa trên trạng thái
            row.className = record.statusCode || '';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${record.className}</td>
                <td>${record.studentName}</td>
                <td>${record.status}</td>
                <td>${record.note}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}
