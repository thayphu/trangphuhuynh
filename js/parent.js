/**
 * Xử lý cho trang phụ huynh
 */

document.addEventListener('DOMContentLoaded', function() {
    // Xử lý form tìm kiếm
    const searchForm = document.getElementById('parent-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleParentSearch);
    }
    
    // Kiểm tra xem có tham số studentId trên URL không
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');
    
    if (studentId) {
        // Nếu có, hiển thị thông tin học sinh
        document.getElementById('student-id-input').value = studentId;
        displayStudentInfo(studentId);
    }
});

// Xử lý tìm kiếm học sinh
function handleParentSearch(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('student-id-input').value.trim();
    
    if (!studentId) {
        alert('Vui lòng nhập mã học sinh!');
        return;
    }
    
    displayStudentInfo(studentId);
    
    // Cập nhật URL với tham số studentId
    const url = new URL(window.location);
    url.searchParams.set('studentId', studentId);
    window.history.pushState({}, '', url);
}

// Hiển thị thông tin học sinh
function displayStudentInfo(studentId) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    
    const studentInfoContainer = document.getElementById('student-info');
    const studentNotFound = document.getElementById('student-not-found');
    
    if (!student) {
        // Nếu không tìm thấy học sinh
        if (studentInfoContainer) studentInfoContainer.classList.add('hidden');
        if (studentNotFound) studentNotFound.classList.remove('hidden');
        return;
    }
    
    // Nếu tìm thấy học sinh
    if (studentInfoContainer) studentInfoContainer.classList.remove('hidden');
    if (studentNotFound) studentNotFound.classList.add('hidden');
    
    // Lấy thông tin lớp học
    const classData = getClassById(student.classId);
    
    // Hiển thị thông tin cơ bản
    document.getElementById('student-name').textContent = student.name;
    document.getElementById('student-id').textContent = student.id;
    document.getElementById('student-class').textContent = classData ? classData.name : 'Không xác định';
    document.getElementById('student-register-date').textContent = formatDate(student.registerDate);
    document.getElementById('student-payment-cycle').textContent = student.paymentCycle;
    
    // Kiểm tra trạng thái thanh toán
    const paymentStatus = checkPaymentStatus(student);
    const statusText = getPaymentStatusText(paymentStatus);
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = statusText;
    statusElement.className = `info-value status-${paymentStatus}`;
    
    // Hiển thị thống kê điểm danh
    displayAttendanceSummary(student.id);
    
    // Hiển thị lịch sử điểm danh
    displayStudentAttendanceHistory(student.id);
    
    // Hiển thị lịch sử thanh toán
    displayStudentPaymentHistory(student.id);
    
    // Hiển thị thông tin thanh toán nếu học sinh chưa thanh toán
    if (paymentStatus === 'unpaid' || paymentStatus === 'overdue') {
        displayPaymentInfo(student, classData);
    } else {
        document.getElementById('payment-info').classList.add('hidden');
    }
}

// Hiển thị thống kê điểm danh
function displayAttendanceSummary(studentId) {
    const summary = calculateAttendanceSummary(studentId);
    
    document.getElementById('total-sessions').textContent = summary.total;
    document.getElementById('present-count').textContent = summary.present;
    document.getElementById('absent-count').textContent = summary.absent;
    document.getElementById('teacher-absent-count').textContent = summary.teacherAbsent;
    
    // Nếu không có dữ liệu điểm danh
    if (summary.total === 0) {
        document.getElementById('attendance-summary').innerHTML = '<p class="no-history">Chưa có dữ liệu điểm danh</p>';
    } else {
        document.getElementById('attendance-summary').classList.remove('hidden');
    }
}

// Hiển thị lịch sử điểm danh
function displayStudentAttendanceHistory(studentId) {
    const attendanceHistory = document.getElementById('attendance-history-list');
    if (!attendanceHistory) return;
    
    const studentAttendance = getStudentAttendance(studentId);
    
    if (studentAttendance.length === 0) {
        attendanceHistory.innerHTML = '<p class="no-history">Chưa có lịch sử điểm danh</p>';
        return;
    }
    
    // Sắp xếp theo ngày, mới nhất lên đầu
    studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    attendanceHistory.innerHTML = '';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Ngày</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    studentAttendance.forEach(record => {
        const row = document.createElement('tr');
        
        let statusText;
        let statusClass;
        
        switch(record.status) {
            case 'present':
                statusText = 'Có mặt';
                statusClass = 'status-paid';
                break;
            case 'absent':
                statusText = 'Vắng mặt';
                statusClass = 'status-overdue';
                break;
            case 'teacher-absent':
                statusText = 'GV nghỉ';
                statusClass = 'status-unpaid';
                break;
            default:
                statusText = 'Không xác định';
                statusClass = '';
        }
        
        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${getClassName(record.classId)}</td>
            <td><span class="student-status ${statusClass}">${statusText}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    attendanceHistory.appendChild(table);
}

// Hiển thị lịch sử thanh toán
function displayStudentPaymentHistory(studentId) {
    const paymentHistory = document.getElementById('payment-history-list');
    if (!paymentHistory) return;
    
    const payments = getPayments().filter(payment => payment.studentId === studentId);
    
    if (payments.length === 0) {
        paymentHistory.innerHTML = '<p class="no-history">Chưa có lịch sử thanh toán</p>';
        return;
    }
    
    // Sắp xếp theo ngày, mới nhất lên đầu
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    paymentHistory.innerHTML = '';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Số hóa đơn</th>
                <th>Ngày thanh toán</th>
                <th>Số tiền</th>
                <th>Chu kỳ thanh toán</th>
                <th>Hình thức</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.receiptNumber}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)} VND</td>
            <td>${payment.cycle}</td>
            <td>${payment.method}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    paymentHistory.appendChild(table);
}

// Hiển thị thông tin thanh toán
function displayPaymentInfo(student, classData) {
    const paymentInfo = document.getElementById('payment-info');
    if (!paymentInfo) return;
    
    paymentInfo.classList.remove('hidden');
    
    // Lấy số tiền cần thanh toán dựa vào chu kỳ
    let amount = 0;
    if (classData) {
        if (student.paymentCycle === '8 buổi') {
            amount = classData.fee * 8;
        } else if (student.paymentCycle === '10 buổi') {
            amount = classData.fee * 10;
        } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
            amount = classData.fee;
        }
    }
    
    // Hiển thị số tiền
    document.getElementById('payment-amount').textContent = formatCurrency(amount);
    
    // Tạo nội dung chuyển khoản
    const transferContent = `HP${student.id}`;
    document.getElementById('transfer-content').textContent = transferContent;
    
    // Tạo mã QR
    const qrCodeUrl = generatePaymentQRCode(student.id, amount);
    const qrCodeImg = document.getElementById('qr-code-img');
    qrCodeImg.src = qrCodeUrl;
    qrCodeImg.alt = 'QR Code Thanh toán';
}

// Các hàm tiện ích được sử dụng từ các file khác
function getClasses() {
    return JSON.parse(localStorage.getItem('classes')) || [];
}

function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

function getPayments() {
    return JSON.parse(localStorage.getItem('payments')) || [];
}

function getAttendance() {
    return JSON.parse(localStorage.getItem('attendance')) || [];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getClassName(classId) {
    const classes = getClasses();
    const classData = classes.find(cls => cls.id === classId);
    return classData ? classData.name : 'Không xác định';
}

function getClassById(classId) {
    const classes = getClasses();
    return classes.find(cls => cls.id === classId);
}

function getStudentById(studentId) {
    const students = getStudents();
    return students.find(student => student.id === studentId);
}

function checkPaymentStatus(student) {
    // Lấy danh sách thanh toán
    const payments = getPayments();
    
    // Lọc thanh toán của học sinh
    const studentPayments = payments.filter(payment => payment.studentId === student.id);
    
    if (studentPayments.length === 0) {
        return 'unpaid'; // Chưa từng thanh toán
    }
    
    // Sắp xếp theo ngày thanh toán gần nhất
    studentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestPayment = studentPayments[0];
    
    // Tính ngày hết hạn dựa vào chu kỳ thanh toán
    const expiryDate = new Date(calculateNextPaymentDate(latestPayment.date, latestPayment.cycle));
    const today = new Date();
    
    if (today > expiryDate) {
        return 'overdue'; // Quá hạn
    } else {
        return 'paid'; // Đã thanh toán và còn hạn
    }
}

function getPaymentStatusText(status) {
    switch(status) {
        case 'paid':
            return 'Đã thanh toán';
        case 'unpaid':
            return 'Chưa thanh toán';
        case 'overdue':
            return 'Quá hạn';
        default:
            return 'Không xác định';
    }
}

function calculateNextPaymentDate(currentDate, cycle) {
    const date = new Date(currentDate);
    
    switch(cycle) {
        case '1 tháng':
            date.setMonth(date.getMonth() + 1);
            break;
        case '8 buổi':
        case '10 buổi':
            // Giả định là 2 buổi mỗi tuần
            const numberOfWeeks = cycle === '8 buổi' ? 4 : 5;
            date.setDate(date.getDate() + (numberOfWeeks * 7));
            break;
        case 'Theo ngày':
            // Giả định là 1 ngày
            date.setDate(date.getDate() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

function generatePaymentQRCode(studentId, amount) {
    const bankAccountNumber = '9704229262085470';
    const bankName = 'MB Bank';
    const accountHolder = 'Tran Dong Phu';
    const transferContent = `HP${studentId}`;
    
    // Tạo URL VietQR
    const vietQRUrl = `https://img.vietqr.io/image/${bankName}-${bankAccountNumber}-compact.png?amount=${amount}&addInfo=${transferContent}&accountName=${accountHolder}`;
    
    return vietQRUrl;
}
