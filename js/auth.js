/**
 * Quản lý xác thực người dùng
 */

// Thông tin tài khoản admin mặc định
const defaultAdmin = {
    username: 'dongphubte',
    password: '@Bentre2013',
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
    const adminPassword = localStorage.getItem('adminPassword');
    
    // Kiểm tra nếu chưa có mật khẩu admin, thì lưu mật khẩu mặc định
    if (!adminPassword) {
        localStorage.setItem('adminPassword', defaultAdmin.password);
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

// Xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const storedPassword = localStorage.getItem('adminPassword') || defaultAdmin.password;
    
    // Kiểm tra thông tin đăng nhập
    if (username === defaultAdmin.username && password === storedPassword) {
        // Đăng nhập thành công
        localStorage.setItem('authenticated', 'true');
        checkAuthentication();
    } else {
        // Đăng nhập thất bại
        const loginError = document.getElementById('login-error');
        loginError.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        loginError.classList.remove('hidden');
    }
}

// Xử lý đăng xuất
function handleLogout() {
    localStorage.removeItem('authenticated');
    checkAuthentication();
}

// Mở modal đổi mật khẩu
function openChangePasswordModal() {
    const modal = document.getElementById('change-password-container');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Xử lý đổi mật khẩu
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const storedPassword = localStorage.getItem('adminPassword') || defaultAdmin.password;
    const passwordError = document.getElementById('password-error');
    
    // Kiểm tra mật khẩu hiện tại
    if (currentPassword !== storedPassword) {
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
    
    // Lưu mật khẩu mới
    localStorage.setItem('adminPassword', newPassword);
    
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
