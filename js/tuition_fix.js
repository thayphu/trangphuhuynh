/**
 * Quản lý học phí
 */

document.addEventListener('DOMContentLoaded', function() {
    setupTuitionTabs();
    
    // Xử lý form thêm thanh toán
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', handleAddPayment);
    }
    
    // Nút thêm thanh toán
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => openAddPaymentModal());
    }
    
    // Nút xóa bộ lọc thanh toán
    const clearFilterBtn = document.getElementById('clear-payment-filter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearPaymentFilters);
    }
    
    // Xử lý lọc thanh toán
    const paymentSearchInput = document.getElementById('payment-search');
    const paymentClassFilter = document.getElementById('payment-class-filter');
    const paymentDateFilter = document.getElementById('payment-date-filter');
    
    if (paymentSearchInput && paymentClassFilter && paymentDateFilter) {
        paymentSearchInput.addEventListener('input', filterPayments);
        paymentClassFilter.addEventListener('change', filterPayments);
        paymentDateFilter.addEventListener('change', filterPayments);
    }
    
    // Nút lưu biên nhận thành hình ảnh
    const saveReceiptImageBtn = document.getElementById('save-receipt-image');
    if (saveReceiptImageBtn) {
        saveReceiptImageBtn.addEventListener('click', saveReceiptAsImage);
    }
    
    // Nút lưu biên nhận thành PDF
    const saveReceiptPdfBtn = document.getElementById('save-receipt-pdf');
    if (saveReceiptPdfBtn) {
        saveReceiptPdfBtn.addEventListener('click', saveReceiptAsPdf);
    }
    
    // Cập nhật lớp của bộ lọc
    updatePaymentClassFilter();
});

// Thiết lập các tab thanh toán
function setupTuitionTabs() {
    const tabButtons = document.querySelectorAll('.payment-tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa active class từ tất cả các nút
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm active class cho nút được nhấp
            this.classList.add('active');
            
            // Ẩn tất cả nội dung tab
            const tabContents = document.querySelectorAll('.payment-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Hiển thị nội dung tab được chọn
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'unpaid-students') {
                displayUnpaidStudents();
            } else if (tabId === 'payment-history') {
                displayPaymentHistory();
            }
        });
    });
    
    // Hiển thị tab học sinh chưa thanh toán mặc định
    displayUnpaidStudents();
}

// Hiển thị danh sách học sinh chưa thanh toán
function displayUnpaidStudents() {
    try {
        console.log("Đang hiển thị học sinh chưa thanh toán...");
        
        const students = getStudents();
        console.log("Tổng số học sinh:", students.length);
        
        const unpaidStudents = students.filter(student => {
            const paymentStatus = checkPaymentStatus(student);
            return paymentStatus === 'unpaid' || paymentStatus === 'overdue';
        });
        
        console.log("Số học sinh chưa thanh toán:", unpaidStudents.length);
        
        let unpaidStudentsTableBody = document.getElementById('unpaid-students-table-body');
        
        // Nếu không tìm thấy, có thể HTML chưa được tạo đúng
        if (!unpaidStudentsTableBody) {
            console.error("Không tìm thấy phần tử unpaid-students-table-body");
            
            // Tìm container chính
            const unpaidStudentsTab = document.getElementById('unpaid-students');
            if (!unpaidStudentsTab) {
                console.error("Không tìm thấy tab unpaid-students");
                return;
            }
            
            // Tạo lại cấu trúc HTML
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
            
            // Lấy lại thẻ tbody
            unpaidStudentsTableBody = document.getElementById('unpaid-students-table-body');
            if (!unpaidStudentsTableBody) {
                console.error("Vẫn không tìm thấy unpaid-students-table-body sau khi tạo lại");
                return;
            }
        }
        
        unpaidStudentsTableBody.innerHTML = '';
        
        unpaidStudents.forEach(student => {
            const classData = getClassById(student.classId);
            if (!classData) return;
            
            // Tính tổng học phí dựa trên chu kỳ
            let totalFee = classData.fee;
            if (classData.paymentCycle === '8 buổi') {
                totalFee = classData.fee * 8;
            } else if (classData.paymentCycle === '10 buổi') {
                totalFee = classData.fee * 10;
            }
            
            // Tính hạn thanh toán
            const paymentStatus = checkPaymentStatus(student);
            const dueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
            
            const row = document.createElement('tr');
            // Sử dụng hàm getShortName để lấy tên rút gọn (họ + tên)
            let shortName = getShortName(student.name);
            
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${shortName}</td>
                <td>${classData.name}</td>
                <td>${formatDate(student.registerDate)}</td>
                <td><span class="fee-highlight">${formatCurrency(totalFee)} VND</span></td>
                <td>${student.paymentCycle}</td>
                <td>${formatDate(dueDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn collect-payment-btn" data-id="${student.id}" title="Thu học phí"><i class="fas fa-money-bill-wave"></i></button>
                    </div>
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
    } catch (error) {
        console.error("Lỗi khi hiển thị học sinh chưa thanh toán:", error);
    }
}

// Hiển thị lịch sử thanh toán
function displayPaymentHistory(filteredPayments = null) {
    try {
        console.log("Đã lấy " + (filteredPayments ? filteredPayments.length : "tất cả") + " thanh toán từ localStorage");
        
        let paymentsTableBody = document.getElementById('payments-table-body');
        
        // Nếu không tìm thấy, có thể HTML chưa được tạo đúng
        if (!paymentsTableBody) {
            console.error("Không tìm thấy phần tử payments-table-body");
            
            // Tìm container chính
            const paymentHistoryTab = document.getElementById('payment-history');
            if (!paymentHistoryTab) {
                console.error("Không tìm thấy tab payment-history");
                return;
            }
            
            // Tạo lại cấu trúc HTML
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
                                <th>Mã biên nhận</th>
                                <th>Mã HS</th>
                                <th>Họ tên</th>
                                <th>Lớp</th>
                                <th>Ngày thanh toán</th>
                                <th>Số tiền</th>
                                <th>Chu kỳ thanh toán</th>
                                <th>Hình thức</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="payments-table-body"></tbody>
                    </table>
                </div>
            `;
            
            // Lấy lại thẻ tbody
            paymentsTableBody = document.getElementById('payments-table-body');
            if (!paymentsTableBody) {
                console.error("Vẫn không tìm thấy payments-table-body sau khi tạo lại");
                return;
            }
            
            console.log("Đã tạo lại cấu trúc HTML cho lịch sử thanh toán");
        }
        
        paymentsTableBody.innerHTML = '';
        
        // Lấy dữ liệu từ localStorage
        let payments = [];
        try {
            payments = filteredPayments || getPayments();
            console.log(`Số lượng thanh toán: ${payments.length}`);
        } catch (e) {
            console.error("Lỗi khi lấy dữ liệu thanh toán:", e);
            return;
        }
        
        // Sắp xếp thanh toán theo ngày, mới nhất lên đầu
        const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedPayments.forEach(payment => {
            console.log("Xử lý thanh toán:", payment);
            
            const student = getStudentById(payment.studentId);
            
            // Nếu học sinh không còn tồn tại, hiển thị thông tin chi tiết và bỏ qua
            if (!student) {
                console.error(`Không tìm thấy học sinh với ID: ${payment.studentId} cho thanh toán ${payment.id}`);
                return;
            }
            
            const row = document.createElement('tr');
            // Sử dụng hàm getShortName để lấy tên rút gọn (họ + tên)
            let shortName = getShortName(student.name);
            
            row.innerHTML = `
                <td>${payment.receiptNumber || ''}</td>
                <td>${payment.studentId}</td>
                <td>${shortName}</td>
                <td>${getClassName(student.classId)}</td>
                <td>${formatDate(payment.date)}</td>
                <td><span class="fee-highlight">${formatCurrency(payment.amount)} VND</span></td>
                <td>${payment.cycle}</td>
                <td>${payment.method}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-class-btn view-receipt-btn" data-id="${payment.id}" title="Xem biên nhận"><i class="fas fa-eye"></i></button>
                        <button class="icon-btn toggle-lock-class-btn edit-receipt-btn" data-id="${payment.id}" title="Sửa biên nhận"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn delete-class-btn delete-payment-btn" data-id="${payment.id}" title="Xóa biên nhận"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            
            paymentsTableBody.appendChild(row);
        });
        
        // Thêm sự kiện cho các nút
        attachPaymentButtonEvents();
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử thanh toán:", error);
    }
}

// Thêm phần còn lại của file js/tuition.js mà không thay đổi