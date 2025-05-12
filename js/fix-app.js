/**
 * Script sửa lỗi HoEdu Solution
 * Sử dụng file updated_tuition_fix.js thay vì tuition_fix.js
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Tải script sửa lỗi HoEdu Solution...");
    
    // Thay thế các script lỗi
    replaceScript('tuition_fix.js', 'updated_tuition_fix.js');
    
    // Thêm nút Sửa lỗi vào navbar
    addFixButton();
});

// Thay thế script
function replaceScript(oldScriptName, newScriptName) {
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes(oldScriptName)) {
            // Tạo script mới
            const newScript = document.createElement('script');
            newScript.src = src.replace(oldScriptName, newScriptName);
            newScript.onload = function() {
                console.log(`Đã thay thế ${oldScriptName} bằng ${newScriptName}`);
                
                // Khởi tạo các chức năng học phí đã được sửa lỗi
                setupTuitionTabs();
            };
            
            // Thay thế script cũ
            script.parentNode.replaceChild(newScript, script);
        }
    });
}

// Thêm nút Sửa lỗi vào navbar
function addFixButton() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const fixButton = document.createElement('button');
    fixButton.className = 'btn btn-warning';
    fixButton.textContent = 'Sửa lỗi';
    fixButton.style.marginLeft = '10px';
    fixButton.onclick = function() {
        fixApp();
    };
    
    navbar.appendChild(fixButton);
}

// Sửa lỗi ứng dụng
function fixApp() {
    console.log("Đang áp dụng bản sửa lỗi...");
    
    // Thay thế script tuition_fix.js bằng updated_tuition_fix.js
    replaceScript('tuition_fix.js', 'updated_tuition_fix.js');
    
    // Khởi tạo lại các chức năng học phí
    if (typeof setupTuitionTabs === 'function') {
        setupTuitionTabs();
    }
    
    // Hiển thị thông báo
    alert("Đã áp dụng bản sửa lỗi thành công!");
}