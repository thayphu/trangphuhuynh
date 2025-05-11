/**
 * Reset dữ liệu và sửa lỗi hiển thị
 */

// Reset dữ liệu ứng dụng
function resetAndFixApp() {
    // Clear localStorage
    localStorage.clear();
    
    // Xóa đánh dấu đã khởi tạo
    localStorage.removeItem('initialized');
    
    // Khởi tạo HTML trực tiếp
    var unpaidStudents = document.createElement('div');
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
    
    var paymentHistory = document.createElement('div');
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
    
    // Thay thế nội dung hiện tại
    var paymentTabsContainer = document.querySelector('.payment-tabs-container');
    if (paymentTabsContainer) {
        var tabButtons = paymentTabsContainer.querySelector('.payment-tab-buttons');
        
        // Xóa tất cả nội dung sau tab buttons
        while (paymentTabsContainer.childNodes.length > 1) {
            paymentTabsContainer.removeChild(paymentTabsContainer.lastChild);
        }
        
        // Thêm các tab đã tạo
        paymentTabsContainer.appendChild(unpaidStudents);
        paymentTabsContainer.appendChild(paymentHistory);
    }
    
    // Khởi tạo lại dữ liệu mẫu
    initializeSampleData();
    
    // Khởi tạo lại tab thanh toán
    setupTuitionTabs();
    
    // Hiển thị lại dữ liệu
    displayUnpaidStudents();
    displayPaymentHistory();
    
    alert('Đã khôi phục dữ liệu và sửa lỗi hiển thị. Hãy kiểm tra lại tab Học phí.');
}
