/**
 * Quản lý học phí
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách thanh toán
    displayPayments();
    
    // Cập nhật danh sách học sinh trong select box
    updateStudentSelectOptions();
    
    // Xử lý sự kiện thêm thanh toán
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', openAddPaymentModal);
    }
    
    // Xử lý sự kiện khi chọn học sinh trong form thanh toán
    const paymentStudent = document.getElementById('payment-student');
    if (paymentStudent) {
        paymentStudent.addEventListener('change', function() {
            const studentId = this.value;
            const student = getStudentById(studentId);
            
            if (student) {
                // Đặt chu kỳ thanh toán dựa vào học sinh
                document.getElementById('payment-cycle').value = student.paymentCycle;
                
                // Tính toán học phí
                const classData = getClassById(student.classId);
                if (classData) {
                    let amount = classData.fee;
                    
                    // Tính toán học phí dựa vào chu kỳ
                    if (student.paymentCycle === '8 buổi') {
                        amount = classData.fee * 8;
                    } else if (student.paymentCycle === '10 buổi') {
                        amount = classData.fee * 10;
                    } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
                        amount = classData.fee;
                    }
                    
                    document.getElementById('payment-amount').value = amount;
                }
            }
        });
    }
    
    // Xử lý form thêm thanh toán
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', handleAddPayment);
    }
    
    // Xử lý tìm kiếm thanh toán
    const paymentSearch = document.getElementById('payment-search');
    if (paymentSearch) {
        paymentSearch.addEventListener('input', filterPayments);
    }
    
    // Xử lý lọc theo lớp
    const paymentClassFilter = document.getElementById('payment-class-filter');
    if (paymentClassFilter) {
        paymentClassFilter.addEventListener('change', filterPayments);
    }
    
    // Xử lý lọc theo ngày
    const paymentDateFilter = document.getElementById('payment-date-filter');
    if (paymentDateFilter) {
        paymentDateFilter.addEventListener('change', filterPayments);
    }
    
    // Xử lý nút xóa bộ lọc
    const clearPaymentFilter = document.getElementById('clear-payment-filter');
    if (clearPaymentFilter) {
        clearPaymentFilter.addEventListener('click', clearPaymentFilters);
    }
    
    // Xử lý các nút trong modal biên nhận
    const saveReceiptImage = document.getElementById('save-receipt-image');
    if (saveReceiptImage) {
        saveReceiptImage.addEventListener('click', saveReceiptAsImage);
    }
    
    const saveReceiptPdf = document.getElementById('save-receipt-pdf');
    if (saveReceiptPdf) {
        saveReceiptPdf.addEventListener('click', saveReceiptAsPdf);
    }
});

// Hiển thị danh sách thanh toán
function displayPayments(filteredPayments = null) {
    const paymentsTableBody = document.getElementById('payments-table-body');
    if (!paymentsTableBody) return;
    
    paymentsTableBody.innerHTML = '';
    
    const payments = filteredPayments || getPayments();
    
    if (payments.length === 0) {
        paymentsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">Chưa có thanh toán nào. Vui lòng thêm thanh toán mới.</td>
            </tr>
        `;
        return;
    }
    
    // Sắp xếp thanh toán theo ngày, mới nhất lên đầu
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    payments.forEach(payment => {
        const student = getStudentById(payment.studentId);
        
        // Nếu học sinh không còn tồn tại, bỏ qua
        if (!student) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.receiptNumber}</td>
            <td>${payment.studentId}</td>
            <td>${student.name}</td>
            <td>${getClassName(student.classId)}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)} VND</td>
            <td>${payment.cycle}</td>
            <td>${payment.method}</td>
            <td>
                <button class="view-receipt-btn" data-id="${payment.id}">Xem biên nhận</button>
                <button class="delete-payment-btn" data-id="${payment.id}">Xóa</button>
            </td>
        `;
        
        paymentsTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút
    attachPaymentButtonEvents();
}

// Gắn sự kiện cho các nút trong bảng thanh toán
function attachPaymentButtonEvents() {
    // Gắn sự kiện cho nút xem biên nhận
    const viewButtons = document.querySelectorAll('.view-receipt-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            openReceiptModal(paymentId);
        });
    });
    
    // Gắn sự kiện cho nút xóa
    const deleteButtons = document.querySelectorAll('.delete-payment-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa thanh toán này không?')) {
                deletePayment(paymentId);
            }
        });
    });
}

// Mở modal thêm thanh toán
function openAddPaymentModal() {
    const modal = document.getElementById('add-payment-modal');
    if (!modal) return;
    
    // Reset form
    document.getElementById('add-payment-form').reset();
    
    // Điền ngày thanh toán mặc định (hôm nay)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
    
    // Nếu đã chọn học sinh
    const studentSelect = document.getElementById('payment-student');
    if (studentSelect && studentSelect.value) {
        const studentId = studentSelect.value;
        const student = getStudentById(studentId);
        
        // Tự động điền chu kỳ thanh toán theo học sinh
        if (student) {
            const cycleSelect = document.getElementById('payment-cycle');
            cycleSelect.value = student.paymentCycle;
            
            // Thêm event listener cho thay đổi chu kỳ
            cycleSelect.addEventListener('change', function() {
                const selectedCycle = this.value;
                const classData = getClassById(student.classId);
                
                if (classData) {
                    let amount = classData.fee;
                    
                    // Tính toán học phí dựa vào chu kỳ đã chọn
                    if (selectedCycle === '8 buổi') {
                        amount = classData.fee * 8;
                    } else if (selectedCycle === '10 buổi') {
                        amount = classData.fee * 10;
                    } else if (selectedCycle === '1 tháng' || selectedCycle === 'Theo ngày') {
                        amount = classData.fee;
                    }
                    
                    document.getElementById('payment-amount').value = amount;
                }
            });
            
            // Tự động điền số tiền theo lớp học và chu kỳ thanh toán
            const classData = getClassById(student.classId);
            if (classData) {
                let amount = classData.fee;
                
                // Tính toán học phí dựa vào chu kỳ
                if (student.paymentCycle === '8 buổi') {
                    amount = classData.fee * 8;
                } else if (student.paymentCycle === '10 buổi') {
                    amount = classData.fee * 10;
                } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
                    amount = classData.fee;
                }
                
                document.getElementById('payment-amount').value = amount;
            }
        }
    }
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Xử lý thêm thanh toán mới
function handleAddPayment(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const studentId = document.getElementById('payment-student').value;
    const amount = parseInt(document.getElementById('payment-amount').value);
    const date = document.getElementById('payment-date').value;
    const cycle = document.getElementById('payment-cycle').value;
    const method = document.getElementById('payment-method').value;
    
    // Tạo mã biên nhận
    const receiptNumber = generateReceiptNumber();
    
    // Tạo đối tượng thanh toán mới
    const newPayment = {
        id: generateId('payment', 5),
        receiptNumber,
        studentId,
        amount,
        date,
        cycle,
        method
    };
    
    // Lấy danh sách thanh toán hiện tại và thêm thanh toán mới
    const payments = getPayments();
    payments.push(newPayment);
    
    // Lưu vào localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Đóng modal
    document.getElementById('add-payment-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách thanh toán
    displayPayments();
    
    // Mở modal biên nhận
    openReceiptModal(newPayment.id);
}

// Xóa thanh toán
function deletePayment(paymentId) {
    // Lấy danh sách thanh toán hiện tại
    let payments = getPayments();
    
    // Lọc bỏ thanh toán cần xóa
    payments = payments.filter(payment => payment.id !== paymentId);
    
    // Lưu vào localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Hiển thị lại danh sách thanh toán
    displayPayments();
}

// Lọc thanh toán theo tìm kiếm và bộ lọc
function filterPayments() {
    const searchTerm = document.getElementById('payment-search').value.toLowerCase();
    const classFilter = document.getElementById('payment-class-filter').value;
    const dateFilter = document.getElementById('payment-date-filter').value;
    
    let filteredPayments = getPayments();
    
    // Lọc theo tìm kiếm
    if (searchTerm) {
        filteredPayments = filteredPayments.filter(payment => {
            const student = getStudentById(payment.studentId);
            if (!student) return false;
            
            return payment.studentId.toLowerCase().includes(searchTerm) || 
                  student.name.toLowerCase().includes(searchTerm) ||
                  payment.receiptNumber.toLowerCase().includes(searchTerm);
        });
    }
    
    // Lọc theo lớp
    if (classFilter) {
        filteredPayments = filteredPayments.filter(payment => {
            const student = getStudentById(payment.studentId);
            return student && student.classId === classFilter;
        });
    }
    
    // Lọc theo ngày
    if (dateFilter) {
        filteredPayments = filteredPayments.filter(payment => 
            payment.date === dateFilter
        );
    }
    
    // Hiển thị kết quả lọc
    displayPayments(filteredPayments);
}

// Xóa bộ lọc thanh toán
function clearPaymentFilters() {
    document.getElementById('payment-search').value = '';
    document.getElementById('payment-class-filter').value = '';
    document.getElementById('payment-date-filter').value = '';
    
    // Hiển thị lại tất cả thanh toán
    displayPayments();
}

// Mở modal biên nhận
function openReceiptModal(paymentId) {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;
    
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) return;
    
    const student = getStudentById(payment.studentId);
    if (!student) return;
    
    const classData = getClassById(student.classId);
    if (!classData) return;
    
    // Điền thông tin vào biên nhận
    document.getElementById('receipt-no').textContent = payment.receiptNumber;
    document.getElementById('receipt-amount').textContent = formatCurrency(payment.amount);
    document.getElementById('receipt-amount-text').textContent = numberToWords(payment.amount);
    document.getElementById('receipt-student-name').textContent = student.name;
    document.getElementById('receipt-student-id').textContent = student.id;
    document.getElementById('receipt-class').textContent = classData.name;
    document.getElementById('receipt-payment-cycle').textContent = payment.cycle;
    document.getElementById('receipt-next-payment').textContent = formatDate(calculateNextPaymentDate(payment.date, payment.cycle));
    document.getElementById('receipt-payment-method').textContent = payment.method;
    document.getElementById('receipt-date').textContent = formatDate(payment.date);
    
    // Hiển thị lịch sử điểm danh
    displayAttendanceHistory(student.id);
    
    // Hiển thị lịch sử thanh toán
    displayPaymentHistory(student.id, payment.id);
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Hiển thị lịch sử điểm danh trong biên nhận
function displayAttendanceHistory(studentId) {
    const attendanceHistoryContainer = document.getElementById('receipt-attendance-history');
    if (!attendanceHistoryContainer) return;
    
    // Lấy dữ liệu điểm danh
    const attendance = getAttendance();
    
    // Lọc theo học sinh và sắp xếp theo ngày, mới nhất lên đầu
    const studentAttendance = attendance
        .filter(record => record.students.some(student => student.id === studentId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Hiển thị lịch sử điểm danh
    if (studentAttendance.length === 0) {
        attendanceHistoryContainer.innerHTML = '<p class="no-history">Chưa có lịch sử điểm danh</p>';
        return;
    }
    
    const attendanceGrid = document.createElement('div');
    attendanceGrid.className = 'attendance-grid';
    
    // Giới hạn hiển thị 10 bản ghi gần nhất
    const recentAttendance = studentAttendance.slice(0, 10);
    
    recentAttendance.forEach(record => {
        const studentRecord = record.students.find(student => student.id === studentId);
        if (!studentRecord) return;
        
        const attendanceItem = document.createElement('div');
        attendanceItem.className = `attendance-item-receipt ${studentRecord.status}`;
        
        let statusText;
        switch(studentRecord.status) {
            case 'present':
                statusText = 'Có mặt';
                break;
            case 'absent':
                statusText = 'Vắng mặt';
                break;
            case 'teacher-absent':
                statusText = 'GV nghỉ';
                break;
            default:
                statusText = 'Không xác định';
        }
        
        attendanceItem.textContent = `${formatDate(record.date)}: ${statusText}`;
        attendanceGrid.appendChild(attendanceItem);
    });
    
    attendanceHistoryContainer.innerHTML = '';
    attendanceHistoryContainer.appendChild(attendanceGrid);
}

// Hiển thị lịch sử thanh toán trong biên nhận
function displayPaymentHistory(studentId, currentPaymentId) {
    const paymentHistoryContainer = document.getElementById('receipt-payment-history');
    if (!paymentHistoryContainer) return;
    
    // Lấy dữ liệu thanh toán
    const payments = getPayments();
    
    // Lọc theo học sinh và sắp xếp theo ngày, mới nhất lên đầu
    const studentPayments = payments
        .filter(payment => payment.studentId === studentId && payment.id !== currentPaymentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Hiển thị lịch sử thanh toán
    if (studentPayments.length === 0) {
        paymentHistoryContainer.innerHTML = '<p class="no-history">Chưa có lịch sử thanh toán</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'payment-history-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Số biên nhận</th>
                <th>Ngày thanh toán</th>
                <th>Số tiền</th>
                <th>Hình thức</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Giới hạn hiển thị 5 bản ghi gần nhất
    const recentPayments = studentPayments.slice(0, 5);
    
    recentPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.receiptNumber}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)} VND</td>
            <td>${payment.method}</td>
        `;
        tbody.appendChild(row);
    });
    
    paymentHistoryContainer.innerHTML = '';
    paymentHistoryContainer.appendChild(table);
}

// Lưu biên nhận thành hình ảnh
function saveReceiptAsImage() {
    const receiptContainer = document.getElementById('receipt-container');
    
    if (receiptContainer) {
        html2canvas(receiptContainer).then(canvas => {
            const link = document.createElement('a');
            link.download = 'bien-nhan.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
}

// Lưu biên nhận thành PDF
function saveReceiptAsPdf() {
    const receiptContainer = document.getElementById('receipt-container');
    
    if (receiptContainer) {
        html2canvas(receiptContainer).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('bien-nhan.pdf');
        });
    }
}
