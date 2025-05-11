/**
 * Công cụ sửa chữa dữ liệu và hiển thị
 */

// Hàm sửa chữa và reset dữ liệu ứng dụng
function resetAndFixApp() {
    console.log("== BẮT ĐẦU QUÁ TRÌNH RESET VÀ SỬA LỖI ==");
    
    try {
        // Xóa dữ liệu cũ
        localStorage.clear();
        console.log("✓ Đã xóa dữ liệu localStorage");
        
        // Khởi tạo lại dữ liệu mẫu cho lớp học và học sinh
        const sampleClasses = [
            {
                id: 'class001',
                name: 'Lớp Toán nâng cao',
                teacher: 'Nguyễn Văn Giáo',
                description: 'Lớp học dành cho học sinh khá giỏi, thi HSG',
                schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
                timeStart: '18:00',
                timeEnd: '19:30',
                fee: 500000,
                feeCycle: '1 tháng'
            },
            {
                id: 'class002',
                name: 'Lớp Tiếng Anh giao tiếp',
                teacher: 'Trần Thị Anh',
                description: 'Rèn luyện kỹ năng giao tiếp tiếng Anh',
                schedule: ['Thứ 3', 'Thứ 5'],
                timeStart: '17:30',
                timeEnd: '19:00',
                fee: 450000,
                feeCycle: '1 tháng'
            }
        ];
        
        const sampleStudents = [
            {
                id: 'HS001',
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                birthdate: '2013-05-10',
                parentName: 'Nguyễn Văn Phụ huynh',
                parentPhone: '0987654321',
                address: '123 Đường ABC, Quận 1',
                classId: 'class001',
                registerDate: '2023-01-01',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS002',
                name: 'Trần Thị B',
                phone: '0923456789',
                birthdate: '2014-02-15',
                parentName: 'Trần Văn Phụ huynh',
                parentPhone: '0976543210',
                address: '456 Đường XYZ, Quận 2',
                classId: 'class002',
                registerDate: '2023-01-15',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS003',
                name: 'Phạm Văn C',
                phone: '0934567890',
                birthdate: '2013-11-20',
                parentName: 'Phạm Thị Phụ huynh',
                parentPhone: '0965432109',
                address: '789 Đường DEF, Quận 3',
                classId: 'class001',
                registerDate: '2023-02-01',
                paymentCycle: '8 buổi'
            }
        ];
        
        // Tạo thanh toán mẫu mới
        const samplePayments = [
            {
                id: 'PAY001',
                studentId: 'HS001',
                date: '2023-01-05',
                amount: 500000,
                method: 'Tiền mặt',
                cycle: '1 tháng',
                receiptNumber: 'BL0001',
                additionalAmount: 0,
                additionalReason: '',
                discount: 0,
                discountReason: ''
            },
            {
                id: 'PAY002',
                studentId: 'HS002',
                date: '2023-01-15',
                amount: 450000,
                method: 'Chuyển khoản',
                cycle: '1 tháng',
                receiptNumber: 'BL0002',
                additionalAmount: 0,
                additionalReason: '',
                discount: 0,
                discountReason: ''
            }
        ];
        
        // Tạo dữ liệu điểm danh mẫu
        const sampleAttendance = [
            {
                id: 'ATT001',
                classId: 'class001',
                date: '2023-01-05',
                students: [
                    { id: 'HS001', status: 'present' },
                    { id: 'HS003', status: 'present' }
                ]
            },
            {
                id: 'ATT002',
                classId: 'class002',
                date: '2023-01-03',
                students: [
                    { id: 'HS002', status: 'present' }
                ]
            }
        ];
        
        // Lưu dữ liệu vào localStorage
        localStorage.setItem('classes', JSON.stringify(sampleClasses));
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        localStorage.setItem('payments', JSON.stringify(samplePayments));
        localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
        localStorage.setItem('initialized', 'true');
        
        console.log("✓ Đã lưu dữ liệu mẫu vào localStorage");
        
        // Tạo lại cấu trúc tab học phí
        createPaymentTabs();
        
        // Hiển thị dữ liệu học sinh chưa thanh toán
        console.log("Hiển thị học sinh chưa thanh toán...");
        displayUnpaidStudents();
        
        // Hiển thị lịch sử thanh toán
        console.log("Hiển thị lịch sử thanh toán...");
        displayPaymentHistory();
        
        // Thông báo hoàn thành
        alert('Đã reset dữ liệu và sửa lỗi hiển thị. Hãy kiểm tra lại tab Học phí.');
        console.log("== HOÀN THÀNH RESET VÀ SỬA LỖI ==");
        
    } catch (error) {
        console.error("Lỗi khi reset dữ liệu:", error);
        alert('Đã xảy ra lỗi khi reset dữ liệu: ' + error.message);
    }
}

// Hàm tạo lại cấu trúc tab học phí
function createPaymentTabs() {
    const paymentTabsContainer = document.querySelector('.payment-tabs-container');
    
    if (!paymentTabsContainer) {
        console.error("Không tìm thấy container tab học phí");
        return;
    }
    
    // Xóa nội dung cũ
    paymentTabsContainer.innerHTML = '';
    
    // Tạo tab buttons
    const tabButtons = document.createElement('div');
    tabButtons.className = 'payment-tab-buttons';
    tabButtons.innerHTML = `
        <button class="payment-tab-button active" data-tab="unpaid-students">Học sinh chưa thanh toán</button>
        <button class="payment-tab-button" data-tab="payment-history">Lịch sử thanh toán</button>
    `;
    
    // Tạo tab content cho học sinh chưa thanh toán
    const unpaidStudentsTab = document.createElement('div');
    unpaidStudentsTab.id = 'unpaid-students';
    unpaidStudentsTab.className = 'payment-tab-content active';
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
    
    // Tạo tab content cho lịch sử thanh toán
    const paymentHistoryTab = document.createElement('div');
    paymentHistoryTab.id = 'payment-history';
    paymentHistoryTab.className = 'payment-tab-content';
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
    
    // Thêm các thành phần vào container
    paymentTabsContainer.appendChild(tabButtons);
    paymentTabsContainer.appendChild(unpaidStudentsTab);
    paymentTabsContainer.appendChild(paymentHistoryTab);
    
    // Thêm sự kiện click cho tab
    document.querySelectorAll('.payment-tab-button').forEach(button => {
        button.addEventListener('click', function() {
            // Lấy ID tab cần hiển thị
            const tabId = this.dataset.tab;
            console.log("Đã click tab:", tabId);
            
            // Loại bỏ trạng thái active khỏi tất cả tab buttons
            document.querySelectorAll('.payment-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Thêm trạng thái active cho tab button được click
            this.classList.add('active');
            
            // Ẩn tất cả tab content
            document.querySelectorAll('.payment-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Hiện tab content tương ứng
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                
                // Nếu là tab học sinh chưa thanh toán, hiển thị danh sách
                if (tabId === 'unpaid-students') {
                    displayUnpaidStudents();
                }
                
                // Nếu là tab lịch sử thanh toán, hiển thị danh sách
                if (tabId === 'payment-history') {
                    displayPaymentHistory();
                }
            }
        });
    });
    
    console.log("✓ Đã tạo lại cấu trúc tab học phí");
}
