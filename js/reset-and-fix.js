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
    
    // Tạo lại tab buttons
    var tabButtons = document.createElement('div');
    tabButtons.className = 'payment-tab-buttons';
    tabButtons.innerHTML = `
        <button class="payment-tab-button active" data-tab="unpaid-students">Học sinh chưa thanh toán</button>
        <button class="payment-tab-button" data-tab="payment-history">Lịch sử thanh toán</button>
        <button class="payment-tab-button" data-tab="additional-fee">Thu thêm</button>
        <button class="payment-tab-button" data-tab="flexible-payment">Thanh toán linh hoạt</button>
    `;
    
    // Thêm lại toàn bộ nội dung
    paymentTabsContainer.appendChild(tabButtons);
    paymentTabsContainer.appendChild(unpaidStudents);
    paymentTabsContainer.appendChild(paymentHistory);
    
    // Thêm lại các tab còn lại nếu có
    if (additionalFeeTab) {
        paymentTabsContainer.appendChild(additionalFeeTab);
    }
    
    if (flexiblePaymentTab) {
        paymentTabsContainer.appendChild(flexiblePaymentTab);
    }
    
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
        
        // Chọn tab mặc định
        document.querySelector('.payment-tab-button[data-tab="unpaid-students"]').click();
    }, 500);
    
    alert('Đã khôi phục dữ liệu và sửa lỗi hiển thị. Hãy kiểm tra lại tab Học phí.');
}
