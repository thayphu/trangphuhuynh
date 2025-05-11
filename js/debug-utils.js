/**
 * Công cụ debug cho HoEdu Solution
 */

// Hàm kiểm tra trạng thái phần tử
function checkElementStatus(selector) {
    const element = document.querySelector(selector);
    
    if (!element) {
        console.error(`Không tìm thấy phần tử: ${selector}`);
        return;
    }
    
    console.log(`Phần tử ${selector} tồn tại.`);
    console.log(`- Visibility: ${window.getComputedStyle(element).visibility}`);
    console.log(`- Display: ${window.getComputedStyle(element).display}`);
    console.log(`- Opacity: ${window.getComputedStyle(element).opacity}`);
    console.log(`- z-index: ${window.getComputedStyle(element).zIndex}`);
    console.log(`- Position: ${window.getComputedStyle(element).position}`);
    
    if (element.tagName === 'TABLE') {
        const rows = element.querySelectorAll('tbody tr');
        console.log(`- Số dòng trong bảng: ${rows.length}`);
    }
    
    return element;
}

// Kiểm tra trạng thái thanh toán
function debugPaymentStatus(studentId) {
    const student = getStudentById(studentId);
    
    if (!student) {
        console.error(`Không tìm thấy học sinh có ID: ${studentId}`);
        return;
    }
    
    console.log(`Thông tin học sinh: ${student.id} - ${student.name}`);
    console.log(`Lớp: ${getClassName(student.classId)}`);
    console.log(`Chu kỳ thanh toán: ${student.paymentCycle}`);
    console.log(`Ngày đăng ký: ${student.registerDate}`);
    
    const payments = getPayments().filter(payment => payment.studentId === studentId);
    console.log(`Tổng số lần thanh toán: ${payments.length}`);
    
    payments.forEach((payment, index) => {
        console.log(`Thanh toán #${index + 1}:`);
        console.log(`- Mã thanh toán: ${payment.id}`);
        console.log(`- Ngày thanh toán: ${payment.date}`);
        console.log(`- Số tiền: ${formatCurrency(payment.amount)} VND`);
        console.log(`- Chu kỳ: ${payment.cycle}`);
        console.log(`- Phương thức: ${payment.method}`);
    });
    
    const status = checkPaymentStatus(student);
    console.log(`Trạng thái thanh toán: ${status}`);
    
    if (status !== 'paid') {
        const nextDueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
        console.log(`Hạn thanh toán tiếp theo: ${nextDueDate}`);
    }
}

// Hàm hiển thị nội dung bảng
function debugTableData(tableId) {
    const table = document.getElementById(tableId);
    
    if (!table) {
        console.error(`Không tìm thấy bảng có ID: ${tableId}`);
        return;
    }
    
    const tbody = table.querySelector('tbody');
    
    if (!tbody) {
        console.error(`Không tìm thấy phần tbody trong bảng ${tableId}`);
        return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    console.log(`Số dòng trong bảng ${tableId}: ${rows.length}`);
    
    rows.forEach((row, index) => {
        console.log(`Dòng #${index + 1}:`);
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, cellIndex) => {
            console.log(`  - Cột #${cellIndex + 1}: ${cell.textContent.trim()}`);
        });
    });
}
