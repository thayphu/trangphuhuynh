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
    
    // Cập nhật thẻ đã thanh toán
    document.getElementById('paid-students-count').textContent = paidStudentsCount;
    document.getElementById('paid-students-amount').textContent = formatCurrency(paidStudentsAmount) + ' VND';
    
    // Cập nhật thẻ chưa thanh toán
    document.getElementById('unpaid-students-count').textContent = unpaidStudentsCount;
    document.getElementById('unpaid-students-amount').textContent = formatCurrency(unpaidStudentsAmount) + ' VND';
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
    
    // Cập nhật thẻ tổng số học sinh
    document.getElementById('total-students').textContent = students.length;
    
    // Cập nhật thẻ có mặt
    document.getElementById('present-students').textContent = presentCount;
    
    // Cập nhật thẻ vắng mặt
    document.getElementById('absent-students').textContent = absentCount;
    
    // Cập nhật thẻ GV vắng
    document.getElementById('teacher-absent-classes').textContent = teacherAbsentClasses.size;
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
    
    const studentsAttendance = [];
    
    students.forEach(student => {
        const attendanceSummary = calculateAttendanceSummary(student.id);
        const classData = classes.find(c => c.id === student.classId);
        
        // Tính tổng số tiền đã thanh toán
        let totalPaid = 0;
        payments.filter(p => p.studentId === student.id).forEach(payment => {
            totalPaid += payment.amount;
        });
        
        studentsAttendance.push({
            id: student.id,
            name: student.name,
            className: classData ? classData.name : 'Không xác định',
            paymentCycle: student.paymentCycle,
            totalSessions: attendanceSummary.total,
            present: attendanceSummary.present,
            absent: attendanceSummary.absent,
            totalPaid: totalPaid
        });
    });
    
    // Hiển thị modal
    const tableBody = document.getElementById('students-attendance-table-body');
    tableBody.innerHTML = '';
    
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
    
    // Hiển thị modal
    document.getElementById('students-attendance-modal').classList.remove('hidden');
}

// Hiển thị modal học sinh có mặt
function displayPresentStudentsModal() {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();
    
    const presentStudents = [];
    
    attendance.forEach(record => {
        const classData = classes.find(c => c.id === record.classId);
        
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
    tableBody.innerHTML = '';
    
    presentStudents.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.name}</td>
            <td>${record.className}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.note}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Hiển thị modal
    document.getElementById('present-students-modal').classList.remove('hidden');
}

// Hiển thị modal học sinh vắng mặt
function displayAbsentStudentsModal() {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();
    
    const absentStudents = [];
    
    attendance.forEach(record => {
        const classData = classes.find(c => c.id === record.classId);
        
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
    tableBody.innerHTML = '';
    
    absentStudents.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.name}</td>
            <td>${record.className}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.note}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Hiển thị modal
    document.getElementById('absent-students-modal').classList.remove('hidden');
}

// Hiển thị modal lớp giáo viên vắng
function displayTeacherAbsentClassesModal() {
    const classes = getClasses();
    const attendance = getAttendance();
    
    const teacherAbsentClasses = [];
    
    attendance.forEach(record => {
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
    tableBody.innerHTML = '';
    
    teacherAbsentClasses.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.className}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.makeupDate ? formatDate(record.makeupDate) : 'Chưa lên lịch'}</td>
            <td>${record.status}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Hiển thị modal
    document.getElementById('teacher-absent-classes-modal').classList.remove('hidden');
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
        // Áp dụng bộ lọc lớp
        if (classFilterValue && record.classId !== classFilterValue) {
            return;
        }
        
        const classData = classes.find(c => c.id === record.classId);
        
        record.students.forEach(studentAttendance => {
            // Áp dụng bộ lọc trạng thái
            if (statusFilterValue && studentAttendance.status !== statusFilterValue) {
                return;
            }
            
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
                    className: classData ? classData.name : 'Không xác định',
                    studentName: student.name,
                    status: statusText,
                    note: studentAttendance.note || ''
                });
            }
        });
    });
    
    // Sắp xếp theo ngày gần nhất
    attendanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Hiển thị danh sách
    const tableBody = document.getElementById('attendance-history-table-body');
    tableBody.innerHTML = '';
    
    if (attendanceHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Không có dữ liệu điểm danh phù hợp.</td>`;
        tableBody.appendChild(row);
    } else {
        attendanceHistory.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.className}</td>
                <td>${record.studentName}</td>
                <td>${record.status}</td>
                <td>${record.note}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}
