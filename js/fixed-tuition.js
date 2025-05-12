/**
 * Phiên bản sửa lỗi - js/fixed-tuition.js
 * Tệp này chứa các hàm đã được sửa để hiển thị danh sách học sinh chưa thanh toán
 * và lịch sử thanh toán đúng cách
 */

// Khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    console.log("Phiên bản sửa lỗi - fixed-tuition.js đã được tải");
    
    // Sự kiện click cho các tab thanh toán
    const paymentTabButtons = document.querySelectorAll('.payment-tab-button');
    if (paymentTabButtons.length > 0) {
        console.log("Đã tìm thấy " + paymentTabButtons.length + " nút tab thanh toán");
        
        paymentTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Lấy ID tab cần hiển thị
                const tabId = this.dataset.tab;
                console.log("Người dùng đã click tab:", tabId);
                
                // Xóa active class từ tất cả buttons
                paymentTabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Thêm active class cho button được click
                this.classList.add('active');
                
                // Ẩn tất cả nội dung tab
                const tabContents = document.querySelectorAll('.payment-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Hiển thị nội dung tab được chọn
                const selectedTab = document.getElementById(tabId);
                if (selectedTab) {
                    selectedTab.classList.add('active');
                    
                    // Nếu là tab học sinh chưa thanh toán
                    if (tabId === 'unpaid-students') {
                        fixedDisplayUnpaidStudents();
                    }
                    
                    // Nếu là tab lịch sử thanh toán
                    if (tabId === 'payment-history') {
                        fixedDisplayPaymentHistory();
                    }
                } else {
                    console.error("Không tìm thấy tab với ID:", tabId);
                }
            });
        });
    } else {
        console.error("Không tìm thấy nút tab thanh toán");
    }
    
    // Hiển thị danh sách học sinh chưa thanh toán một lần khi tải trang
    fixedDisplayUnpaidStudents();
});

// Hiển thị danh sách học sinh chưa thanh toán - phiên bản sửa lỗi
function fixedDisplayUnpaidStudents() {
    console.log("Đang hiển thị học sinh chưa thanh toán (phiên bản sửa lỗi)...");
    
    // Kiểm tra xem tab unpaid-students có tồn tại không
    const unpaidStudentsTab = document.getElementById('unpaid-students');
    if (!unpaidStudentsTab) {
        console.error("Không tìm thấy tab unpaid-students");
        return;
    }
    
    // Đảm bảo rằng tab này đang hiển thị
    unpaidStudentsTab.classList.add('active');
    
    // Tạo lại toàn bộ cấu trúc HTML cho tab này
    unpaidStudentsTab.innerHTML = `
        <div id="unpaid-students-list" class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Mã HS</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Ngày đăng ký</th>
                        <th>Tổng học phí</th>
                        <th>Chu kỳ thanh toán</th>
                        <th>Hạn đóng học phí</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody id="unpaid-students-table-body"></tbody>
            </table>
        </div>
    `;
    
    // Lấy tbody để điền dữ liệu
    const unpaidStudentsTableBody = document.getElementById('unpaid-students-table-body');
    if (!unpaidStudentsTableBody) {
        console.error("Không thể tạo phần tử unpaid-students-table-body");
        return;
    }
    
    // Lấy dữ liệu học sinh từ localStorage
    let students = [];
    try {
        students = JSON.parse(localStorage.getItem('students')) || [];
        console.log("Đã tìm thấy " + students.length + " học sinh trong dữ liệu");
    } catch (e) {
        console.error("Lỗi khi đọc dữ liệu học sinh:", e);
        students = [];
    }
    
    // Lọc học sinh chưa thanh toán
    const unpaidStudents = students.filter(student => {
        const paymentStatus = checkPaymentStatus(student);
        console.log(`Học sinh ${student.id}: ${student.name}, trạng thái: ${paymentStatus}`);
        return paymentStatus === 'unpaid' || paymentStatus === 'overdue';
    });
    
    console.log("Số học sinh chưa thanh toán: " + unpaidStudents.length);
    
    // Nếu không có học sinh chưa thanh toán
    if (unpaidStudents.length === 0) {
        unpaidStudentsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">Không có học sinh cần thanh toán. Tất cả học sinh đã thanh toán đầy đủ.</td>
            </tr>
        `;
        return;
    }
    
    // Hiển thị học sinh chưa thanh toán
    unpaidStudents.forEach(student => {
        // Lấy thông tin lớp học
        const classData = getClassById(student.classId);
        if (!classData) {
            console.error(`Không tìm thấy lớp với ID: ${student.classId} cho học sinh ${student.id}`);
            return;
        }
        
        // Tính tổng học phí dựa trên chu kỳ
        let totalFee = 0;
        if (student.paymentCycle === '1 tháng') {
            totalFee = classData.fee;
        } else if (student.paymentCycle === '8 buổi') {
            totalFee = classData.fee * 8 / 4; // Giả sử 1 tháng có 4 buổi
        }
        
        // Tính hạn thanh toán
        const paymentStatus = checkPaymentStatus(student);
        const dueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
        
        // Tạo hàng dữ liệu
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${classData.name}</td>
            <td>${formatDate(student.registerDate)}</td>
            <td><span class="fee-highlight">${formatCurrency(totalFee)} VND</span></td>
            <td>${student.paymentCycle}</td>
            <td>${formatDate(dueDate)}</td>
            <td>
                <button class="btn primary-btn collect-payment-btn" data-id="${student.id}">Thu học phí</button>
            </td>
        `;
        
        unpaidStudentsTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút thu học phí
    document.querySelectorAll('.collect-payment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            openAddPaymentModal(studentId);
        });
    });
}

// Hiển thị lịch sử thanh toán - phiên bản sửa lỗi
function fixedDisplayPaymentHistory(filteredPayments = null) {
    console.log("Đang hiển thị lịch sử thanh toán (phiên bản sửa lỗi)...");
    
    // Kiểm tra tab payment-history
    const paymentHistoryTab = document.getElementById('payment-history');
    if (!paymentHistoryTab) {
        console.error("Không tìm thấy tab payment-history");
        return;
    }
    
    // Đảm bảo tab đang hiển thị
    document.querySelectorAll('.payment-tab-content').forEach(tab => tab.classList.remove('active'));
    paymentHistoryTab.classList.add('active');
    
    // Tạo lại cấu trúc HTML cho tab này
    paymentHistoryTab.innerHTML = `
        <div class="search-filter">
            <input type="text" id="payment-search" placeholder="Tìm kiếm thanh toán...">
            <select id="payment-class-filter">
                <option value="">Tất cả lớp</option>
            </select>
            <input type="date" id="payment-date-filter" placeholder="dd/mm/yyyy">
            <button id="clear-payment-filter" class="btn-icon"><i class="fas fa-times"></i> Xóa lọc</button>
        </div>
        <div id="payments-list" class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã Biên nhận</th>
                        <th>Ngày thanh toán</th>
                        <th>Số tiền</th>
                        <th>Hình thức thanh toán</th>
                        <th>Mã HS</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody id="payments-table-body"></tbody>
            </table>
        </div>
    `;
    
    // Lấy tbody để điền dữ liệu
    const paymentsTableBody = document.getElementById('payments-table-body');
    if (!paymentsTableBody) {
        console.error("Không thể tạo phần tử payments-table-body");
        return;
    }
    
    // Lấy dữ liệu thanh toán
    let payments = [];
    try {
        payments = filteredPayments || JSON.parse(localStorage.getItem('payments')) || [];
        console.log(`Đã tìm thấy ${payments.length} thanh toán trong dữ liệu`);
    } catch (e) {
        console.error("Lỗi khi đọc dữ liệu thanh toán:", e);
        payments = [];
    }
    
    // Nếu không có dữ liệu thanh toán
    if (payments.length === 0) {
        paymentsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">Chưa có thanh toán nào. Vui lòng thêm thanh toán mới.</td>
            </tr>
        `;
        return;
    }
    
    // Sắp xếp thanh toán theo ngày, mới nhất lên đầu
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Hiển thị dữ liệu thanh toán
    sortedPayments.forEach((payment, index) => {
        const student = getStudentById(payment.studentId);
        
        // Nếu học sinh không còn tồn tại
        if (!student) {
            console.error(`Không tìm thấy học sinh với ID: ${payment.studentId} cho thanh toán ${payment.id}`);
            return;
        }
        
        const classData = getClassById(student.classId);
        const className = classData ? classData.name : 'Không xác định';
        
        // Tạo hàng dữ liệu
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${payment.receiptNumber || ''}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${payment.method || 'Tiền mặt'}</td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${className}</td>
            <td>
                <button class="btn-icon view-receipt-btn" data-id="${payment.id}" title="Xem biên lai">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button class="btn-icon delete-payment-btn" data-id="${payment.id}" title="Xóa">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        paymentsTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút hành động
    document.querySelectorAll('.view-receipt-btn').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            openReceiptModal(paymentId);
        });
    });
    
    document.querySelectorAll('.delete-payment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            deletePayment(paymentId);
        });
    });
    
    // Thêm sự kiện cho bộ lọc
    const paymentSearch = document.getElementById('payment-search');
    const paymentClassFilter = document.getElementById('payment-class-filter');
    const paymentDateFilter = document.getElementById('payment-date-filter');
    const clearPaymentFilter = document.getElementById('clear-payment-filter');
    
    // Điền danh sách lớp cho select
    const classes = getClasses();
    classes.forEach(classData => {
        const option = document.createElement('option');
        option.value = classData.id;
        option.textContent = classData.name;
        paymentClassFilter.appendChild(option);
    });
    
    // Thêm sự kiện lọc
    if (paymentSearch) {
        paymentSearch.addEventListener('input', filterPayments);
    }
    
    if (paymentClassFilter) {
        paymentClassFilter.addEventListener('change', filterPayments);
    }
    
    if (paymentDateFilter) {
        paymentDateFilter.addEventListener('change', filterPayments);
    }
    
    if (clearPaymentFilter) {
        clearPaymentFilter.addEventListener('click', clearPaymentFilters);
    }
}

// Hàm lọc thanh toán theo các điều kiện
function filterPayments() {
    const searchText = document.getElementById('payment-search').value.toLowerCase();
    const classFilter = document.getElementById('payment-class-filter').value;
    const dateFilter = document.getElementById('payment-date-filter').value;
    
    console.log(`Đang lọc thanh toán: Tìm kiếm='${searchText}', Lớp='${classFilter}', Ngày='${dateFilter}'`);
    
    // Lấy tất cả thanh toán
    let payments = getPayments();
    
    // Lọc theo các điều kiện
    let filteredPayments = payments.filter(payment => {
        const student = getStudentById(payment.studentId);
        if (!student) return false;
        
        const studentClass = getClassById(student.classId);
        if (!studentClass) return false;
        
        // Kiểm tra điều kiện tìm kiếm
        const matchSearch = !searchText || 
            payment.receiptNumber.toLowerCase().includes(searchText) || 
            student.id.toLowerCase().includes(searchText) || 
            student.name.toLowerCase().includes(searchText);
        
        // Kiểm tra điều kiện lớp
        const matchClass = !classFilter || student.classId === classFilter;
        
        // Kiểm tra điều kiện ngày
        const matchDate = !dateFilter || payment.date === dateFilter;
        
        return matchSearch && matchClass && matchDate;
    });
    
    console.log(`Kết quả: ${filteredPayments.length} thanh toán phù hợp với điều kiện`);
    
    // Hiển thị kết quả
    fixedDisplayPaymentHistory(filteredPayments);
}

// Hàm xóa các điều kiện lọc
function clearPaymentFilters() {
    const paymentSearch = document.getElementById('payment-search');
    const paymentClassFilter = document.getElementById('payment-class-filter');
    const paymentDateFilter = document.getElementById('payment-date-filter');
    
    if (paymentSearch) paymentSearch.value = '';
    if (paymentClassFilter) paymentClassFilter.value = '';
    if (paymentDateFilter) paymentDateFilter.value = '';
    
    fixedDisplayPaymentHistory();
}