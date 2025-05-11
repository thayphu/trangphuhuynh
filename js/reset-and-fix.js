/**
 * Reset dữ liệu và sửa lỗi hiển thị
 */

// Reset dữ liệu ứng dụng
function resetAndFixApp() {
    console.log("== BẮT ĐẦU RESET VÀ SỬA LỖI ==");
    
    // Clear localStorage
    localStorage.clear();
    console.log("✓ Đã xóa dữ liệu localStorage");
    
    // Khởi tạo lại dữ liệu mẫu
    initializeSampleData();
    
    // Tạo thanh toán mẫu mới
    const newPayments = [
        {
            id: 'PAY001',
            studentId: 'HS001',
            date: '2023-04-05',
            amount: 500000,
            method: 'Tiền mặt',
            cycle: '1 tháng',
            receiptNumber: 'BL2023001',
            additionalAmount: 0,
            additionalReason: '',
            discount: 0,
            discountReason: ''
        },
        {
            id: 'PAY002',
            studentId: 'HS002',
            date: '2023-04-10',
            amount: 450000,
            method: 'Chuyển khoản',
            cycle: '1 tháng',
            receiptNumber: 'BL2023002',
            additionalAmount: 0,
            additionalReason: '',
            discount: 0,
            discountReason: ''
        }
    ];
    
    // Lưu trực tiếp vào localStorage
    localStorage.setItem('payments', JSON.stringify(newPayments));
    
    console.log("✓ Đã khởi tạo dữ liệu mẫu");
    
    // Tìm container của tab
    var paymentTabsContainer = document.querySelector('.payment-tabs-container');
    if (!paymentTabsContainer) {
        console.error("Không tìm thấy .payment-tabs-container");
        alert("Lỗi: Không tìm thấy container tab thanh toán");
        return;
    }
    console.log("✓ Tìm thấy payment-tabs-container");
    
    // Tìm tab buttons
    var tabButtonsContainer = paymentTabsContainer.querySelector('.payment-tab-buttons');
    if (!tabButtonsContainer) {
        console.error("Không tìm thấy .payment-tab-buttons");
        alert("Lỗi: Không tìm thấy nút tab");
        return;
    }
    console.log("✓ Tìm thấy payment-tab-buttons");
    
    // Tạo lại nội dung các tab
    console.log("- Đang tạo lại tab unpaid-students");
    var unpaidStudents = document.getElementById('unpaid-students');
    if (unpaidStudents) {
        console.log("✓ Tìm thấy tab unpaid-students, xóa và tạo lại");
        unpaidStudents.remove();
    }
    
    console.log("- Đang tạo lại tab payment-history");
    var paymentHistory = document.getElementById('payment-history');
    if (paymentHistory) {
        console.log("✓ Tìm thấy tab payment-history, xóa và tạo lại");
        paymentHistory.remove();
    }
    
    // Tạo mới tab unpaid-students
    unpaidStudents = document.createElement('div');
    unpaidStudents.id = 'unpaid-students';
    unpaidStudents.className = 'payment-tab-content active';
    unpaidStudents.innerHTML = `
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
    
    // Tạo mới tab payment-history
    paymentHistory = document.createElement('div');
    paymentHistory.id = 'payment-history';
    paymentHistory.className = 'payment-tab-content';
    paymentHistory.innerHTML = `
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
                        <th>Số hóa đơn</th>
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
    
    // Thêm các tab vào container
    var additionalFeeTab = document.getElementById('additional-fee');
    var flexiblePaymentTab = document.getElementById('flexible-payment');
    
    // Tạo mới container
    var tabContentContainer = document.createElement('div');
    
    // Thêm các tab vào container
    tabContentContainer.appendChild(unpaidStudents);
    tabContentContainer.appendChild(paymentHistory);
    
    if (additionalFeeTab) {
        console.log("✓ Giữ lại tab additional-fee");
        tabContentContainer.appendChild(additionalFeeTab);
    }
    
    if (flexiblePaymentTab) {
        console.log("✓ Giữ lại tab flexible-payment");
        tabContentContainer.appendChild(flexiblePaymentTab);
    }
    
    // Xóa nội dung container cũ
    while (paymentTabsContainer.childNodes.length > 0) {
        paymentTabsContainer.removeChild(paymentTabsContainer.firstChild);
    }
    
    // Tạo lại tab buttons - chỉ giữ 2 tab chính
    var tabButtons = document.createElement('div');
    tabButtons.className = 'payment-tab-buttons';
    tabButtons.innerHTML = `
        <button class="payment-tab-button active" data-tab="unpaid-students">Học sinh chưa thanh toán</button>
        <button class="payment-tab-button" data-tab="payment-history">Lịch sử thanh toán</button>
    `;
    
    // Thêm lại toàn bộ nội dung
    paymentTabsContainer.appendChild(tabButtons);
    paymentTabsContainer.appendChild(unpaidStudents);
    paymentTabsContainer.appendChild(paymentHistory);
    
    // Không thêm các tab Thu thêm và Thanh toán linh hoạt
    
    console.log("✓ Đã tạo lại toàn bộ tab thanh toán");
    
    // Khởi tạo lại tab thanh toán
    setupTuitionTabs();
    console.log("✓ Đã thiết lập lại tabs thanh toán");
    
    // Khởi tạo sự kiện cho tab
    const tabButtons2 = document.querySelectorAll('.payment-tab-button');
    tabButtons2.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            console.log("Đã click tab:", tabId);
            
            // Xóa active class từ tất cả tab buttons
            tabButtons2.forEach(btn => btn.classList.remove('active'));
            
            // Thêm active class cho tab được chọn
            this.classList.add('active');
            
            // Ẩn tất cả tab content
            const tabContents = document.querySelectorAll('.payment-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Hiển thị tab content tương ứng
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.classList.add('active');
                
                // Nếu là tab học sinh chưa thanh toán, hiển thị lại danh sách
                if (tabId === 'unpaid-students') {
                    displayUnpaidStudents();
                }
                
                // Nếu là tab lịch sử thanh toán, hiển thị lại danh sách
                if (tabId === 'payment-history') {
                    displayPaymentHistory();
                }
            } else {
                console.error(`Không tìm thấy phần tử có ID: ${tabId}`);
            }
        });
    });
    
    // Hiển thị lại dữ liệu
    displayUnpaidStudents();
    displayPaymentHistory();
    console.log("✓ Đã hiển thị lại dữ liệu");
    
    // Kiểm tra xem các phần tử đã được tạo chưa
    setTimeout(() => {
        console.log("KIỂM TRA PHẦN TỬ SAU KHI TẠO:");
        checkElementStatus('#unpaid-students');
        checkElementStatus('#unpaid-students-table-body');
        checkElementStatus('#payment-history');
        checkElementStatus('#payments-table-body');
        
        // Hiển thị trực tiếp
        forceDisplayUnpaidStudents();
        forceDisplayPaymentHistory();
        
        // Chọn tab mặc định
        document.querySelector('.payment-tab-button[data-tab="unpaid-students"]').click();
    }, 500);
    
    // Khoảng thời gian để đảm bảo dữ liệu đã được tải
    setTimeout(() => {
        // Chọn tab unpaid-students để kích hoạt lại hiển thị
        document.querySelector('.payment-tab-button[data-tab="unpaid-students"]').click();
    }, 1000);
    
    // Thêm các hàm force display
}

function forceDisplayUnpaidStudents() {
    // Lấy container unpaid-students
    const unpaidStudentsTab = document.getElementById('unpaid-students');
    if (!unpaidStudentsTab) {
        console.error("Không tìm thấy container unpaid-students");
        return;
    }
    
    // Tìm bảng trong tab
    const tableBody = unpaidStudentsTab.querySelector('tbody') || document.getElementById('unpaid-students-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy tbody trong unpaid-students");
        return;
    }
    
    // Xóa nội dung hiện tại
    tableBody.innerHTML = '';
    
    // Lấy danh sách học sinh
    const students = JSON.parse(localStorage.getItem('students')) || [];
    console.log(`Đang hiển thị FORCE ${students.length} học sinh`);
    
    // Lọc học sinh chưa thanh toán
    const unpaidStudents = students.filter(student => {
        const status = checkPaymentStatus(student);
        return status === 'unpaid' || status === 'overdue';
    });
    
    if (unpaidStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">Không có học sinh nào chưa thanh toán.</td></tr>';
        return;
    }
    
    // Hiển thị từng học sinh
    unpaidStudents.forEach(student => {
        const classData = getClassById(student.classId);
        if (!classData) return;
        
        // Tính tổng học phí
        let totalFee = 0;
        if (student.paymentCycle === '1 tháng') {
            totalFee = classData.monthlyFee;
        } else if (student.paymentCycle === '8 buổi') {
            totalFee = classData.sessionFee * 8;
        } else {
            totalFee = classData.sessionFee;
        }
        
        // Tính hạn thanh toán
        const paymentStatus = checkPaymentStatus(student);
        const dueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
        
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
        
        tableBody.appendChild(row);
    });
    
    console.log("✓ FORCE: Đã hiển thị danh sách học sinh chưa thanh toán");
}

function forceDisplayPaymentHistory() {
    // Lấy container payment-history
    const paymentHistoryTab = document.getElementById('payment-history');
    if (!paymentHistoryTab) {
        console.error("Không tìm thấy container payment-history");
        return;
    }
    
    // Tìm bảng trong tab
    const tableBody = paymentHistoryTab.querySelector('tbody') || document.getElementById('payments-table-body');
    if (!tableBody) {
        console.error("Không tìm thấy tbody trong payment-history");
        return;
    }
    
    // Xóa nội dung hiện tại
    tableBody.innerHTML = '';
    
    // Lấy danh sách thanh toán
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    console.log(`Đang hiển thị FORCE ${payments.length} thanh toán`);
    
    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="no-data">Chưa có thanh toán nào.</td></tr>';
        return;
    }
    
    // Sắp xếp thanh toán theo ngày, mới nhất lên đầu
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Hiển thị từng thanh toán
    sortedPayments.forEach(payment => {
        const student = getStudentById(payment.studentId);
        
        // Nếu học sinh không còn tồn tại, hiển thị thông tin thiếu
        const studentName = student ? student.name : '[Đã xóa]';
        const className = student ? getClassName(student.classId) : '[Đã xóa]';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.receiptNumber || ''}</td>
            <td>${payment.studentId}</td>
            <td>${studentName}</td>
            <td>${className}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)} VND</td>
            <td>${payment.cycle}</td>
            <td>${payment.method}</td>
            <td>
                <button class="btn-icon view-receipt-btn" data-id="${payment.id}" title="Xem biên nhận">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon delete-payment-btn" data-id="${payment.id}" title="Xóa thanh toán">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log("✓ FORCE: Đã hiển thị lịch sử thanh toán");
}

alert('Đã khôi phục dữ liệu và sửa lỗi hiển thị. Hãy kiểm tra lại tab Học phí.');
}
