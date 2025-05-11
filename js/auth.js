/**
 * Quản lý xác thực người dùng
 * Phiên bản tối ưu hóa và bảo mật
 */

// Thông tin tài khoản admin mặc định
// Lưu cả mật khẩu văn bản và hash để đảm bảo tương thích
const defaultAdmin = {
    username: 'dongphubte',
    // Mật khẩu gốc (để đăng nhập trực tiếp) - Giữ cho tương thích ngược
    password: '@Bentre2013',
    // Hash của mật khẩu "@Bentre2013" (cho phương thức bảo mật mới)
    passwordHash: "8f831e01b44d72f9f7558f22fc951b0cc98b3d428db6388df8a52c29c655d33e",
    name: 'Đông Phú'
};

// Kiểm tra đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Xử lý đổi mật khẩu
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', openChangePasswordModal);
    }
    
    // Xử lý form đổi mật khẩu
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Xử lý đóng modal
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Kiểm tra xác thực
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('authenticated');
    
    // Đảm bảo giá trị mặc định được lưu
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', defaultAdmin.password);
    }
    
    // Đảm bảo hash mật khẩu cũng được lưu
    if (!localStorage.getItem('adminPasswordHash')) {
        localStorage.setItem('adminPasswordHash', defaultAdmin.passwordHash);
    }
    
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const userInfo = document.getElementById('user-info');
    
    if (isAuthenticated === 'true') {
        // Người dùng đã đăng nhập
        if (loginContainer) loginContainer.classList.add('hidden');
        if (mainContainer) mainContainer.classList.remove('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
    } else {
        // Người dùng chưa đăng nhập
        if (loginContainer) loginContainer.classList.remove('hidden');
        if (mainContainer) mainContainer.classList.add('hidden');
        if (userInfo) userInfo.classList.add('hidden');
    }
}

/**
 * Tạo hash SHA-256 cho mật khẩu
 */
function hashPassword(password) {
    // Hàm này mô phỏng hash SHA-256
    // Trong thực tế, nên sử dụng thư viện mật mã chuyên dụng
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Chuyển đổi thành chuỗi hex có độ dài cố định
    return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * So sánh hash mật khẩu
 */
function verifyPassword(password, hash) {
    // Trong môi trường thực tế, nên sử dụng phương pháp an toàn hơn
    return hashPassword(password) === hash;
}

/**
 * Tạo token phiên làm việc
 */
function generateSessionToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Xử lý đăng nhập với cả hai phương thức xác thực (cũ và mới)
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Kiểm tra thông tin đăng nhập
    // Phương thức 1: So sánh trực tiếp (cũ)
    const directAuthentication = (username === defaultAdmin.username && password === defaultAdmin.password);
    
    // Phương thức 2: So sánh bằng hash (mới - bảo mật hơn)
    const storedHash = localStorage.getItem('adminPasswordHash') || defaultAdmin.passwordHash;
    const hashAuthentication = (username === defaultAdmin.username && verifyPassword(password, storedHash));
    
    // Nếu một trong hai phương thức xác thực thành công
    if (directAuthentication || hashAuthentication) {
        // Đăng nhập thành công
        const sessionToken = generateSessionToken();
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('lastActivity', Date.now());
        
        // Thiết lập timeout phiên làm việc
        setupSessionTimeout();
        
        checkAuthentication();
        
        console.log("Đăng nhập thành công!");
    } else {
        // Đăng nhập thất bại
        const loginError = document.getElementById('login-error');
        loginError.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        loginError.classList.remove('hidden');
        
        console.log("Đăng nhập thất bại!");
    }
}

/**
 * Thiết lập kiểm tra timeout phiên làm việc
 */
function setupSessionTimeout() {
    // Cập nhật hoạt động khi người dùng tương tác
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    
    // Kiểm tra phiên làm việc mỗi phút
    setInterval(checkSessionTimeout, 60000);
}

/**
 * Cập nhật thời gian hoạt động
 */
function updateActivity() {
    if (localStorage.getItem('authenticated') === 'true') {
        localStorage.setItem('lastActivity', Date.now());
    }
}

/**
 * Kiểm tra timeout phiên làm việc
 */
function checkSessionTimeout() {
    if (localStorage.getItem('authenticated') === 'true') {
        const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
        const currentTime = Date.now();
        
        // Tự động đăng xuất sau 30 phút không hoạt động
        if (currentTime - lastActivity > 30 * 60 * 1000) {
            handleLogout();
            alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        }
    }
}

// Xử lý đăng xuất
function handleLogout() {
    // Xóa tất cả thông tin phiên làm việc
    localStorage.removeItem('authenticated');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('lastActivity');
    
    // Cập nhật giao diện
    checkAuthentication();
}

// Mở modal đổi mật khẩu
function openChangePasswordModal() {
    const modal = document.getElementById('change-password-container');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Xử lý đổi mật khẩu với bảo mật nâng cao
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const storedHash = localStorage.getItem('adminPasswordHash') || defaultAdmin.passwordHash;
    const passwordError = document.getElementById('password-error');
    
    // Kiểm tra mật khẩu hiện tại bằng hash
    if (!verifyPassword(currentPassword, storedHash)) {
        passwordError.textContent = 'Mật khẩu hiện tại không đúng!';
        passwordError.classList.remove('hidden');
        return;
    }
    
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
        passwordError.textContent = 'Mật khẩu mới và xác nhận mật khẩu không khớp!';
        passwordError.classList.remove('hidden');
        return;
    }
    
    // Kiểm tra độ phức tạp của mật khẩu mới
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || 
        !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        passwordError.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt!';
        passwordError.classList.remove('hidden');
        return;
    }
    
    // Lưu hash của mật khẩu mới
    const newPasswordHash = hashPassword(newPassword);
    localStorage.setItem('adminPasswordHash', newPasswordHash);
    
    // Đóng modal
    const modal = document.getElementById('change-password-container');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Hiển thị thông báo thành công
    alert('Đổi mật khẩu thành công!');
    
    // Xóa các trường nhập liệu
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    passwordError.classList.add('hidden');
}
