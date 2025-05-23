/**
 * File chính khởi động ứng dụng
 * Xử lý khởi tạo và điều phối các chức năng
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu mẫu nếu cần thiết
    initializeSampleData();
    
    // Thêm nút reset dữ liệu (chỉ hiển thị trong chế độ phát triển)
    const devModeContainer = document.createElement('div');
    devModeContainer.className = 'dev-mode-container';
    devModeContainer.style.position = 'fixed';
    devModeContainer.style.bottom = '10px';
    devModeContainer.style.right = '10px';
    devModeContainer.style.zIndex = '9999';
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Dữ Liệu';
    resetButton.className = 'action-btn danger-btn';
    resetButton.addEventListener('click', resetAndFixApp);
    
    devModeContainer.appendChild(resetButton);
    document.body.appendChild(devModeContainer);
    
    // Hiển thị ngày hiện tại
    displayCurrentDate();
    
    // Hiển thị năm hiện tại trong footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Xử lý điều hướng tab
    initTabs();
    
    // Cập nhật các select box chứa danh sách lớp và học sinh
    updateClassSelectOptions();
    updateStudentSelectOptions();
    
    // Hiển thị dữ liệu ban đầu
    displayClasses();
    displayStudents();
    displayPayments();
    displayAttendanceClasses();
    
    // Lắng nghe sự kiện thay đổi dữ liệu để cập nhật giao diện
    document.addEventListener('dataChanged', function(e) {
        // Cập nhật danh sách điểm danh khi dữ liệu thay đổi
        if (typeof displayAttendanceClasses === 'function') {
            displayAttendanceClasses();
        }
        
        // Cập nhật danh sách học phí khi dữ liệu thay đổi
        if (typeof displayPayments === 'function') {
            displayPayments();
        }
        
        // Cập nhật báo cáo nếu đang xem tab báo cáo
        const reportsTab = document.querySelector('.tab[data-tab="reports"]');
        if (reportsTab && reportsTab.classList.contains('active') && typeof setupReportsTab === 'function') {
            setupReportsTab();
        }
    });
});

// Hiển thị ngày hiện tại
function displayCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = today.toLocaleDateString('vi-VN', options);
    }
}

// Khởi tạo điều hướng tab
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Xóa lớp active khỏi tất cả các tab và tab-pane
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
            
            // Thêm lớp active cho tab được chọn
            this.classList.add('active');
            
            // Hiển thị tab-pane tương ứng
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.remove('hidden');
            }
            
            // Nếu chọn tab Phụ huynh, mở trang phụ huynh trong tab mới
            if (tabId === 'parent-link') {
                // Mở trang phụ huynh trong một tab mới nếu click vào đường dẫn
                const parentLink = document.querySelector('.parent-link a');
                if (parentLink) {
                    parentLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.open(this.href, '_blank');
                    });
                }
            }
            
            // Cập nhật dữ liệu báo cáo nếu chọn tab Báo cáo
            if (tabId === 'reports') {
                if (typeof setupReportsTab === 'function') {
                    setupReportsTab();
                } else {
                    console.error('Hàm setupReportsTab chưa được định nghĩa');
                }
            }
        });
    });
}

// Xử lý khi window load
window.addEventListener('load', function() {
    // Đóng tất cả các modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Xử lý ESC để đóng modal
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
    
    // Thiết lập sự kiện đóng cho tất cả nút đóng trong modal
    document.querySelectorAll('.close-btn').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Tiện ích để hiển thị thông báo
function showNotification(message, type = 'success') {
    // Kiểm tra xem đã có phần tử thông báo chưa
    let notification = document.querySelector('.notification');
    
    // Nếu chưa có, tạo mới
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Thiết lập loại thông báo
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Hiển thị thông báo
    notification.classList.add('show');
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
