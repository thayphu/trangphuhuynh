/**
 * Công cụ định dạng văn bản tự động cho HoEdu Solution
 * Tự động viết hoa các trường dữ liệu khi người dùng nhập
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Khởi tạo công cụ định dạng văn bản tự động...");
    applyTextFormatters();
});

/**
 * Áp dụng các bộ định dạng văn bản cho tất cả input và textarea
 */
function applyTextFormatters() {
    // Lấy tất cả các form trong trang
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Lấy tất cả các input trong form
        const inputs = form.querySelectorAll('input[type="text"], textarea');
        
        inputs.forEach(input => {
            // Xác định loại trường để áp dụng định dạng phù hợp
            const fieldName = input.name || input.id || '';
            
            if (fieldName.includes('name') || fieldName.includes('teacher') || fieldName.includes('description') || 
                fieldName.includes('address') || fieldName.includes('parent')) {
                // Trường tên, giáo viên, mô tả, địa chỉ, phụ huynh - viết hoa chữ cái đầu mỗi từ
                input.addEventListener('blur', function() {
                    this.value = toTitleCase(this.value);
                });
                
                // Thêm data attribute để đánh dấu loại định dạng
                input.dataset.formatter = 'title-case';
            } else if (fieldName.includes('phone')) {
                // Trường số điện thoại - chỉ giữ lại số
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
                
                // Thêm data attribute để đánh dấu loại định dạng
                input.dataset.formatter = 'phone-number';
            }
            
            // Bắt sự kiện submit để định dạng lại tất cả các trường trước khi gửi
            if (form) {
                form.addEventListener('submit', function(event) {
                    // Định dạng lại tất cả trường trước khi gửi
                    const allInputs = this.querySelectorAll('input[type="text"], textarea');
                    allInputs.forEach(input => {
                        if (input.dataset.formatter === 'title-case') {
                            input.value = toTitleCase(input.value);
                        }
                    });
                });
            }
        });
    });
    
    // Thêm trình xử lý cho tất cả modals
    addModalInputHandlers();
    
    console.log("Đã áp dụng bộ định dạng văn bản cho tất cả trường dữ liệu");
}

/**
 * Thêm sự kiện cho tất cả input trong modal
 */
function addModalInputHandlers() {
    // Bắt sự kiện DOM thay đổi để xử lý modal mới được mở
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Kiểm tra nếu modal được thêm vào DOM
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.classList && node.classList.contains('modal-container')) {
                        // Tìm tất cả input trong modal
                        const modalInputs = node.querySelectorAll('input[type="text"], textarea');
                        modalInputs.forEach(input => {
                            // Xác định loại trường để áp dụng định dạng phù hợp
                            const fieldName = input.name || input.id || '';
                            
                            if (fieldName.includes('name') || fieldName.includes('teacher') || 
                                fieldName.includes('description') || fieldName.includes('address') || 
                                fieldName.includes('parent')) {
                                // Trường tên, giáo viên, mô tả, địa chỉ, phụ huynh - viết hoa chữ cái đầu mỗi từ
                                input.addEventListener('blur', function() {
                                    this.value = toTitleCase(this.value);
                                });
                                
                                input.dataset.formatter = 'title-case';
                            } else if (fieldName.includes('phone')) {
                                // Trường số điện thoại - chỉ giữ lại số
                                input.addEventListener('input', function() {
                                    this.value = this.value.replace(/[^0-9]/g, '');
                                });
                                
                                input.dataset.formatter = 'phone-number';
                            }
                        });
                        
                        console.log("Đã áp dụng định dạng văn bản cho modal mới");
                    }
                }
            }
        });
    });

    // Cấu hình theo dõi toàn bộ DOM và các thay đổi sâu bên trong
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

/**
 * Chuyển đổi chuỗi văn bản sang định dạng viết hoa chữ cái đầu mỗi từ
 * @param {string} text - Chuỗi văn bản cần chuyển đổi 
 * @returns {string} - Chuỗi đã được viết hoa chữ cái đầu mỗi từ
 */
function toTitleCase(text) {
    if (!text) return text;
    
    // Xử lý tiếng Việt, đảm bảo các từ có dấu cũng được viết hoa đúng cách
    return text.toLowerCase()
        .split(' ')
        .map(function(word) {
            // Nếu từ trống, trả về nguyên dạng
            if (!word) return word;
            
            // Chuyển đổi chữ cái đầu tiên thành viết hoa
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Áp dụng định dạng cho một input cụ thể
 * @param {HTMLElement} input - Phần tử input cần áp dụng định dạng
 */
function applyFormatterToInput(input) {
    // Xác định loại trường để áp dụng định dạng phù hợp
    const fieldName = input.name || input.id || '';
    
    if (fieldName.includes('name') || fieldName.includes('teacher') || 
        fieldName.includes('description') || fieldName.includes('address') || 
        fieldName.includes('parent')) {
        // Trường tên, giáo viên, mô tả, địa chỉ, phụ huynh - viết hoa chữ cái đầu mỗi từ
        input.value = toTitleCase(input.value);
        input.dataset.formatter = 'title-case';
    }
}

/**
 * Hàm định dạng tất cả các trường dữ liệu hiện có
 * Gọi hàm này để định dạng dữ liệu hiện tại trên trang
 */
function formatAllExistingFields() {
    // Lấy tất cả input và textarea
    const allInputs = document.querySelectorAll('input[type="text"], textarea');
    
    // Áp dụng định dạng cho từng input
    allInputs.forEach(input => {
        if (input.value) {
            applyFormatterToInput(input);
        }
    });
    
    console.log("Đã định dạng tất cả các trường dữ liệu hiện có");
}

// Xuất các hàm để sử dụng từ các file khác
window.TextFormatter = {
    toTitleCase: toTitleCase,
    applyFormatterToInput: applyFormatterToInput,
    formatAllExistingFields: formatAllExistingFields
};