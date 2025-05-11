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
    
    // Hiển thị thông tin bổ sung
    document.getElementById('student-phone').textContent = student.phone || '';
    document.getElementById('student-birth-date').textContent = student.birthDate ? formatDate(student.birthDate) : '';
    document.getElementById('student-address').textContent = student.address || '';
    
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
        const paymentInfoElement = document.getElementById('payment-info');
        if (paymentInfoElement) {
            paymentInfoElement.classList.add('hidden');
        }
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
    if (!paymentHistory) {
        console.error("Không tìm thấy phần tử payment-history-list");
        return;
    }
    
    // Lấy tất cả các thanh toán
    const allPayments = getPayments();
    console.log(`Tổng số thanh toán: ${allPayments.length}`);
    
    // Lọc các thanh toán của học sinh
    const payments = allPayments.filter(payment => payment.studentId === studentId);
    console.log(`Số thanh toán của học sinh ${studentId}: ${payments.length}`);
    
    if (payments.length === 0) {
        paymentHistory.innerHTML = '<p class="no-history">Chưa có lịch sử thanh toán</p>';
        return;
    }
    
    // Sắp xếp theo ngày, mới nhất lên đầu
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    paymentHistory.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'data-table';
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
            <td>${payment.receiptNumber || 'N/A'}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)} VND</td>
            <td>${payment.cycle || 'N/A'}</td>
            <td>${payment.method || 'N/A'}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    paymentHistory.appendChild(table);
}

// Hiển thị thông tin thanh toán
function displayPaymentInfo(student, classData) {
    // Tìm phần tử thông tin thanh toán
    const paymentInfo = document.getElementById('payment-info');
    if (!paymentInfo) {
        console.error("Không tìm thấy phần tử payment-info trong trang");
        return;
    }
    
    // Đảm bảo phần tử hiển thị
    paymentInfo.classList.remove('hidden');
    console.log("Hiển thị thông tin thanh toán cho học sinh:", student.id, student.name);
    
    // Lấy số tiền cần thanh toán dựa vào chu kỳ
    let amount = 0;
    console.log("Thông tin lớp:", classData);
    
    if (classData) {
        // Sử dụng fee thay vì tuition nếu chưa có thuộc tính tuition
        const tuition = classData.tuition || classData.fee || 500000; // Mặc định là 500,000 VND nếu không có dữ liệu
        
        console.log(`Lớp ${classData.id} (${classData.name}), học phí: ${tuition}, chu kỳ: ${student.paymentCycle}`);
        
        if (student.paymentCycle === '8 buổi') {
            // Nếu chu kỳ là 8 buổi
            const sessionFee = Math.round(tuition / 8); // Giả sử 8 buổi = 1 tháng
            amount = sessionFee * 8;
        } else if (student.paymentCycle === '10 buổi') {
            // Nếu chu kỳ là 10 buổi
            const sessionFee = Math.round(tuition / 8); // Giả sử 8 buổi = 1 tháng
            amount = sessionFee * 10;
        } else if (student.paymentCycle === '1 tháng') {
            // Nếu chu kỳ là 1 tháng
            amount = tuition;
        } else if (student.paymentCycle === 'Theo ngày') {
            // Nếu chu kỳ là theo ngày, lấy học phí theo buổi
            amount = Math.round(tuition / 8);
        } else {
            // Trường hợp mặc định, sử dụng học phí 1 tháng
            amount = tuition;
        }
    } else {
        // Nếu không có thông tin lớp, đặt giá trị mặc định
        amount = 500000;
        console.warn("Không tìm thấy thông tin lớp học, sử dụng học phí mặc định:", amount);
    }
    
    // Thiết lập nội dung chuyển khoản
    const paymentDescription = document.getElementById('payment-description');
    if (paymentDescription) {
        paymentDescription.textContent = `HP${student.id}`;
    } else {
        console.error("Không tìm thấy phần tử payment-description");
    }
    
    // Hiển thị số tiền cần thanh toán
    const amountDueElement = document.getElementById('payment-amount-due');
    if (amountDueElement) {
        amountDueElement.textContent = formatCurrency(amount);
    } else {
        console.error("Không tìm thấy phần tử payment-amount-due");
    }
    
    // Tạo mã QR
    const qrCodeImage = document.getElementById('qr-code-image');
    if (qrCodeImage) {
        try {
            const qrCodeUrl = generatePaymentQRCode(student.id, amount);
            console.log("Đã tạo mã QR với URL:", qrCodeUrl);
            qrCodeImage.src = qrCodeUrl;
            qrCodeImage.style.width = "100%";
            qrCodeImage.style.maxWidth = "200px";
        } catch (error) {
            console.error("Lỗi khi tạo mã QR:", error);
            const qrCodeContainer = document.getElementById('payment-qr-code');
            if (qrCodeContainer) {
                qrCodeContainer.innerHTML = `<p class="error">Không thể tạo mã QR</p>`;
            }
        }
    } else {
        console.error("Không tìm thấy phần tử qr-code-image");
    }
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

// Lấy danh sách điểm danh của một học sinh
function getStudentAttendance(studentId) {
    const attendance = getAttendance();
    let studentAttendance = [];
    
    attendance.forEach(record => {
        // Tìm học sinh trong danh sách điểm danh của mỗi buổi học
        if (record.students && record.students.some(s => s.id === studentId)) {
            const studentRecord = record.students.find(s => s.id === studentId);
            studentAttendance.push({
                date: record.date,
                classId: record.classId,
                status: studentRecord.status
            });
        }
    });
    
    return studentAttendance;
}

// Tính toán thống kê điểm danh của học sinh
function calculateAttendanceSummary(studentId) {
    const studentAttendance = getStudentAttendance(studentId);
    
    let summary = {
        total: studentAttendance.length,
        present: 0,
        absent: 0,
        teacherAbsent: 0
    };
    
    studentAttendance.forEach(record => {
        if (record.status === 'present') {
            summary.present++;
        } else if (record.status === 'absent') {
            summary.absent++;
        } else if (record.status === 'teacher-absent') {
            summary.teacherAbsent++;
        }
    });
    
    return summary;
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
