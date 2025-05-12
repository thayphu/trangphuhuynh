/**
 * HoEdu Solution - Hệ thống quản lý học phí
 * File này chứa tất cả các chức năng liên quan đến quản lý thanh toán học phí
 * Phiên bản mới nhất được tối ưu và sửa lỗi
 */

// Khởi tạo hệ thống khi tài liệu đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hệ thống quản lý học phí đã được khởi động');
    
    // Khởi tạo các chức năng
    setupTuitionTabs();
    displayUnpaidStudents();
    
    // Gán sự kiện cho nút thêm thanh toán
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            openAddPaymentModal();
        });
    }
    
    // Gán sự kiện cho form thanh toán
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleAddPayment(event);
        });
    }
    
    // Gán sự kiện cho nút xác nhận thanh toán
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Đã nhấp vào nút xác nhận thanh toán");
            handleAddPayment(new Event('submit'));
        });
    }
    
    // Gán sự kiện cho nút lọc thanh toán
    const filterBtn = document.getElementById('filter-payments-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', filterPayments);
    }
    
    // Gán sự kiện cho nút xóa bộ lọc
    const clearFilterBtn = document.getElementById('clear-payment-filter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearPaymentFilters);
    }
    
    // Gán sự kiện cho các trường dữ liệu bộ lọc
    const filterFields = [
        'payment-filter-student',
        'payment-filter-class',
        'payment-filter-from',
        'payment-filter-to'
    ];
    
    filterFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', filterPayments);
        }
    });
});

/**
 * Thiết lập các tab học phí
 */
function setupTuitionTabs() {
    try {
        // Tìm các phần tử tab
        const tabButtons = document.querySelectorAll('.tuition-tab-button');
        if (tabButtons.length === 0) {
            console.log("Không tìm thấy tab thanh toán");
            return;
        }
        
        console.log(`Đã tìm thấy ${tabButtons.length} nút tab thanh toán`);
        
        // Thiết lập sự kiện cho các nút tab
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Ẩn tất cả nội dung tab
                document.querySelectorAll('.tuition-tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                
                // Bỏ active tất cả nút tab
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Hiển thị tab được chọn
                const tabId = this.getAttribute('data-tab');
                console.log(`Người dùng đã click tab: "${tabId}"`);
                
                this.classList.add('active');
                const targetTab = document.getElementById(tabId);
                
                if (targetTab) {
                    targetTab.classList.remove('hidden');
                    
                    // Xử lý các tab cụ thể
                    if (tabId === 'unpaid-students') {
                        displayUnpaidStudents();
                    } else if (tabId === 'payment-history') {
                        displayPaymentHistory();
                    }
                }
            });
        });
        
        // Hiển thị tab đầu tiên mặc định
        const defaultTab = document.querySelector('.tuition-tab-button');
        if (defaultTab) {
            defaultTab.click();
        }
    } catch (error) {
        console.error("Lỗi khi thiết lập tab học phí:", error);
    }
}

/**
 * Hiển thị danh sách học sinh chưa thanh toán
 */
function displayUnpaidStudents() {
    try {
        console.log('Đang hiển thị học sinh chưa thanh toán...');
        
        // Lấy tất cả học sinh
        const students = getStudents();
        console.log(`Đã tìm thấy ${students.length} học sinh trong dữ liệu`);
        
        // Lọc học sinh chưa thanh toán
        const unpaidStudents = students.filter(student => {
            const status = checkPaymentStatus(student);
            console.log(`Học sinh ${student.id}: ${student.name}, trạng thái: ${status}`);
            return status === 'unpaid' || status === 'overdue';
        });
        
        // Hiển thị danh sách học sinh
        const tableBody = document.getElementById('unpaid-students-table-body');
        if (!tableBody) {
            console.error("Không tìm thấy phần tử #unpaid-students-table-body");
            return;
        }
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Hiển thị số lượng học sinh chưa thanh toán
        console.log(`Số học sinh chưa thanh toán: ${unpaidStudents.length}`);
        
        // Nếu không có học sinh nào chưa thanh toán
        if (unpaidStudents.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 6;
            emptyCell.textContent = 'Không có học sinh nào chưa thanh toán';
            emptyCell.className = 'empty-table';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Hiển thị dữ liệu mới
        unpaidStudents.forEach(student => {
            const classData = getClassById(student.classId);
            if (!classData) return;
            
            const row = document.createElement('tr');
            
            // Mã học sinh
            const idCell = document.createElement('td');
            idCell.textContent = student.id;
            row.appendChild(idCell);
            
            // Tên học sinh
            const nameCell = document.createElement('td');
            nameCell.textContent = student.name;
            row.appendChild(nameCell);
            
            // Lớp học
            const classCell = document.createElement('td');
            classCell.textContent = classData.name;
            row.appendChild(classCell);
            
            // Ngày thanh toán gần nhất
            const lastPaymentCell = document.createElement('td');
            lastPaymentCell.textContent = student.lastPaymentDate ? formatDate(student.lastPaymentDate) : 'Chưa thanh toán';
            row.appendChild(lastPaymentCell);
            
            // Ngày thanh toán tiếp theo
            const nextPaymentCell = document.createElement('td');
            
            if (classData.locked) {
                // Nếu lớp đã khóa, hiển thị thông báo
                nextPaymentCell.textContent = 'Lớp đã đóng';
                nextPaymentCell.style.backgroundColor = '#d9534f';
                nextPaymentCell.style.color = 'white';
                nextPaymentCell.style.fontWeight = 'bold';
                nextPaymentCell.style.borderRadius = '3px';
                nextPaymentCell.style.padding = '2px 5px';
                nextPaymentCell.style.textAlign = 'center';
            } else {
                // Tính ngày thanh toán tiếp theo
                if (student.lastPaymentDate) {
                    const nextPaymentDate = calculateNextPaymentDate(student.lastPaymentDate, student.paymentCycle, student.id);
                    nextPaymentCell.textContent = formatDate(nextPaymentDate);
                    
                    // Kiểm tra nếu đã quá hạn, hiển thị màu đỏ
                    const today = new Date();
                    const paymentDay = new Date(nextPaymentDate);
                    if (paymentDay < today) {
                        nextPaymentCell.style.color = 'red';
                        nextPaymentCell.style.fontWeight = 'bold';
                    }
                } else {
                    nextPaymentCell.textContent = 'Chưa xác định';
                }
            }
            
            row.appendChild(nextPaymentCell);
            
            // Nút hành động
            const actionCell = document.createElement('td');
            actionCell.className = 'action-buttons';
            
            // Nút thu học phí
            const collectBtn = document.createElement('button');
            collectBtn.className = 'icon-btn collect-payment-btn';
            collectBtn.innerHTML = '<i class="fas fa-cash-register"></i>';
            collectBtn.title = 'Thu học phí';
            collectBtn.dataset.id = student.id;
            collectBtn.addEventListener('click', function() {
                openAddPaymentModal(this.dataset.id);
            });
            
            actionCell.appendChild(collectBtn);
            row.appendChild(actionCell);
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi hiển thị học sinh chưa thanh toán:", error);
    }
}

/**
 * Hiển thị lịch sử thanh toán
 */
function displayPaymentHistory(filteredPayments = null) {
    try {
        console.log('Đang hiển thị lịch sử thanh toán...');
        
        // Lấy thanh toán từ localStorage hoặc sử dụng danh sách đã lọc
        const payments = filteredPayments || getPayments();
        console.log(`Đã tìm thấy ${payments.length} thanh toán trong dữ liệu`);
        
        // Sắp xếp theo ngày mới nhất
        payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Hiển thị thanh toán
        const tableBody = document.getElementById('payment-history-table-body');
        if (!tableBody) {
            console.error("Không tìm thấy phần tử #payment-history-table-body");
            return;
        }
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Nếu không có thanh toán nào
        if (payments.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 8;
            emptyCell.textContent = 'Không có thanh toán nào';
            emptyCell.className = 'empty-table';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Hiển thị dữ liệu mới
        payments.forEach(payment => {
            const student = getStudentById(payment.studentId);
            if (!student) return;
            
            const row = document.createElement('tr');
            
            // Mã thanh toán
            const idCell = document.createElement('td');
            idCell.textContent = payment.id;
            row.appendChild(idCell);
            
            // Tên học sinh
            const nameCell = document.createElement('td');
            nameCell.textContent = student.name;
            row.appendChild(nameCell);
            
            // Lớp học
            const classCell = document.createElement('td');
            classCell.textContent = getClassName(student.classId);
            row.appendChild(classCell);
            
            // Ngày thanh toán
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(payment.date);
            row.appendChild(dateCell);
            
            // Chu kỳ
            const cycleCell = document.createElement('td');
            cycleCell.textContent = payment.cycle || student.paymentCycle;
            row.appendChild(cycleCell);
            
            // Phương thức thanh toán
            const methodCell = document.createElement('td');
            methodCell.textContent = payment.method;
            row.appendChild(methodCell);
            
            // Số tiền
            const amountCell = document.createElement('td');
            amountCell.textContent = formatCurrency(payment.amount);
            amountCell.style.textAlign = 'right';
            row.appendChild(amountCell);
            
            // Nút hành động
            const actionCell = document.createElement('td');
            actionCell.className = 'action-buttons';
            
            // Nút xem biên nhận
            const viewBtn = document.createElement('button');
            viewBtn.className = 'icon-btn view-receipt-btn';
            viewBtn.innerHTML = '<i class="fas fa-receipt"></i>';
            viewBtn.title = 'Xem biên nhận';
            viewBtn.dataset.id = payment.id;
            viewBtn.addEventListener('click', function() {
                openReceiptModal(this.dataset.id);
            });
            
            // Nút xóa
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-btn delete-payment-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Xóa thanh toán';
            deleteBtn.dataset.id = payment.id;
            deleteBtn.addEventListener('click', function() {
                if (confirm('Bạn có chắc chắn muốn xóa thanh toán này không?')) {
                    deletePayment(this.dataset.id);
                }
            });
            
            actionCell.appendChild(viewBtn);
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử thanh toán:", error);
    }
}

/**
 * Lọc thanh toán
 */
function filterPayments() {
    try {
        const studentFilter = document.getElementById('payment-filter-student');
        const classFilter = document.getElementById('payment-filter-class');
        const fromDateFilter = document.getElementById('payment-filter-from');
        const toDateFilter = document.getElementById('payment-filter-to');
        
        if (!studentFilter || !classFilter || !fromDateFilter || !toDateFilter) {
            console.error("Không tìm thấy trường bộ lọc");
            return;
        }
        
        const studentValue = studentFilter.value.toLowerCase();
        const classValue = classFilter.value;
        const fromDateValue = fromDateFilter.value;
        const toDateValue = toDateFilter.value;
        
        // Định dạng ngày cho so sánh
        const fromDate = fromDateValue ? new Date(fromDateValue) : null;
        const toDate = toDateValue ? new Date(toDateValue) : null;
        
        // Lấy danh sách thanh toán
        const payments = getPayments();
        
        // Lọc thanh toán
        const filteredPayments = payments.filter(payment => {
            const student = getStudentById(payment.studentId);
            if (!student) return false;
            
            // Lọc theo tên học sinh
            if (studentValue && !student.name.toLowerCase().includes(studentValue)) {
                return false;
            }
            
            // Lọc theo lớp
            if (classValue && student.classId !== classValue) {
                return false;
            }
            
            // Lọc theo ngày thanh toán
            const paymentDate = new Date(payment.date);
            if (fromDate && paymentDate < fromDate) {
                return false;
            }
            if (toDate && paymentDate > toDate) {
                return false;
            }
            
            return true;
        });
        
        // Hiển thị kết quả lọc
        displayPaymentHistory(filteredPayments);
        
        // Hiển thị số lượng kết quả
        const resultCount = document.getElementById('payment-filter-result-count');
        if (resultCount) {
            resultCount.textContent = `Đã tìm thấy ${filteredPayments.length} kết quả`;
            resultCount.style.display = 'block';
        }
    } catch (error) {
        console.error("Lỗi khi lọc thanh toán:", error);
    }
}

/**
 * Xóa bộ lọc thanh toán
 */
function clearPaymentFilters() {
    try {
        const studentFilter = document.getElementById('payment-filter-student');
        const classFilter = document.getElementById('payment-filter-class');
        const fromDateFilter = document.getElementById('payment-filter-from');
        const toDateFilter = document.getElementById('payment-filter-to');
        
        if (studentFilter) studentFilter.value = '';
        if (classFilter) classFilter.value = '';
        if (fromDateFilter) fromDateFilter.value = '';
        if (toDateFilter) toDateFilter.value = '';
        
        // Hiển thị lại tất cả thanh toán
        displayPaymentHistory();
        
        // Ẩn số lượng kết quả
        const resultCount = document.getElementById('payment-filter-result-count');
        if (resultCount) {
            resultCount.style.display = 'none';
        }
    } catch (error) {
        console.error("Lỗi khi xóa bộ lọc thanh toán:", error);
    }
}

/**
 * Xử lý thêm thanh toán mới
 */
function handleAddPayment(event) {
    try {
        event.preventDefault();
        console.log("Đang xử lý thanh toán...");
        
        // Lấy dữ liệu từ form
        const paymentId = document.getElementById('payment-id')?.value || 'payment' + Math.floor(Math.random() * 100000);
        const receiptNumber = document.getElementById('payment-receipt-number')?.value || generateReceiptNumber();
        const studentId = document.getElementById('payment-student')?.value;
        const date = document.getElementById('payment-date')?.value || new Date().toISOString().split('T')[0];
        const method = document.getElementById('payment-method')?.value || 'Tiền mặt';
        
        // Kiểm tra dữ liệu
        if (!studentId) {
            alert('Vui lòng chọn học sinh');
            return;
        }
        
        // Lấy thông tin học sinh
        const student = getStudentById(studentId);
        if (!student) {
            alert('Không tìm thấy thông tin học sinh');
            return;
        }
        
        console.log(`Xử lý thanh toán cho học sinh: ${student.name} (${studentId})`);
        
        // Lấy thông tin lớp
        const classData = getClassById(student.classId);
        if (!classData) {
            alert('Không tìm thấy thông tin lớp học');
            return;
        }
        
        // Lấy các giá trị từ form
        const baseAmount = parseInt(document.getElementById('base-amount')?.value || 0);
        const additionalFee = parseInt(document.getElementById('additional-fee')?.value || 0);
        const additionalReason = document.getElementById('additional-reason')?.value || '';
        const additionalOther = document.getElementById('additional-other')?.value || '';
        const discount = parseInt(document.getElementById('discount')?.value || 0);
        const discountReason = document.getElementById('discount-reason')?.value || '';
        const discountOther = document.getElementById('discount-other')?.value || '';
        const flexibleSessions = parseInt(document.getElementById('flexible-sessions')?.value || 0);
        
        // Tính toán tổng số tiền
        let totalAmount = baseAmount + additionalFee - discount;
        
        // Thêm phí buổi bổ sung
        if (flexibleSessions > 0) {
            const flexibleAmount = classData.fee * flexibleSessions;
            totalAmount += flexibleAmount;
        }
        
        console.log(`Tổng số tiền thanh toán: ${totalAmount}`);
        
        // Chu kỳ thanh toán
        const cycle = student.paymentCycle;
        
        // Tạo đối tượng thanh toán mới
        const newPayment = {
            id: paymentId,
            receiptNumber,
            studentId,
            amount: totalAmount,
            date,
            cycle,
            method,
            details: {
                baseAmount,
                additionalFee,
                additionalReason: additionalReason === 'Khác' ? additionalOther : additionalReason,
                discount,
                discountReason: discountReason === 'Khác' ? discountOther : discountReason,
                flexibleSessions,
                flexibleAmount: flexibleSessions > 0 ? classData.fee * flexibleSessions : 0
            }
        };
        
        console.log("Thanh toán mới:", newPayment);
        
        // Lưu thanh toán mới vào localStorage
        const payments = getPayments();
        payments.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // Cập nhật ngày thanh toán mới nhất cho học sinh
        const students = getStudents();
        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            students[studentIndex].lastPaymentDate = date;
            localStorage.setItem('students', JSON.stringify(students));
        }
        
        // Đóng modal
        const modal = document.getElementById('add-payment-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Hiển thị lại danh sách học sinh chưa thanh toán
        displayUnpaidStudents();
        
        // Hiển thị lại danh sách thanh toán
        displayPaymentHistory();
        
        // Hiển thị thông báo thành công
        if (typeof showNotification === 'function') {
            showNotification('Thanh toán học phí thành công', 'success');
        } else {
            alert('Thanh toán học phí thành công');
        }
        
        // Mở modal biên nhận
        openReceiptModal(newPayment.id);
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        alert('Đã xảy ra lỗi khi xử lý thanh toán: ' + error.message);
    }
}

/**
 * Mở modal thêm thanh toán
 */
function openAddPaymentModal(studentId = null) {
    try {
        console.log(`Mở modal thanh toán cho học sinh: ${studentId || 'Chưa chọn'}`);
        
        // Hiển thị modal
        const modal = document.getElementById('add-payment-modal');
        if (!modal) {
            console.error("Không tìm thấy modal thanh toán");
            return;
        }
        
        modal.classList.remove('hidden');
        
        // Reset form
        const form = document.getElementById('add-payment-form');
        if (form) {
            form.reset();
        }
        
        // Tạo ID thanh toán mới
        const paymentIdInput = document.getElementById('payment-id');
        if (paymentIdInput) {
            paymentIdInput.value = 'payment' + Math.floor(Math.random() * 100000);
        }
        
        // Tạo mã biên nhận
        const receiptNumberInput = document.getElementById('payment-receipt-number');
        if (receiptNumberInput) {
            receiptNumberInput.value = generateReceiptNumber();
        }
        
        // Thiết lập ngày thanh toán mặc định (hôm nay)
        const dateInput = document.getElementById('payment-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Thiết lập mặc định phương thức thanh toán
        const methodInput = document.getElementById('payment-method');
        if (methodInput && methodInput.options.length > 0) {
            methodInput.value = 'Tiền mặt';
        }
        
        // Nếu có học sinh được chọn (từ nút Thu học phí)
        if (studentId) {
            console.log(`Cập nhật thông tin học sinh: ${studentId}`);
            
            // Lấy thông tin học sinh
            const student = getStudentById(studentId);
            if (!student) {
                console.error(`Không tìm thấy học sinh với ID: ${studentId}`);
                return;
            }
            
            // Lấy thông tin lớp
            const classData = getClassById(student.classId);
            if (!classData) {
                console.error(`Không tìm thấy lớp học với ID: ${student.classId}`);
                return;
            }
            
            // Cập nhật tiêu đề modal
            const modalTitle = document.getElementById('payment-modal-title');
            if (modalTitle) {
                modalTitle.textContent = `Thu học phí cho ${student.name}`;
            }
            
            // Tìm và cập nhật các trường thông tin bằng nhiều cách khác nhau
            
            // Đặc biệt: Lấy ID học sinh từ dropdown và hiển thị vào trường mã học sinh
            
            // Trích xuất ID học sinh từ dropdown
            const studentDropdown = document.querySelector('select');
            let studentIdValue = "";
            
            if (studentDropdown) {
                const selectedOption = studentDropdown.options[studentDropdown.selectedIndex];
                const optionText = selectedOption.text;
                
                // Tìm ID trong text (định dạng: "Tên (ID - Lớp)")
                const idMatch = optionText.match(/\(([^-]+)/);
                if (idMatch && idMatch[1]) {
                    studentIdValue = idMatch[1].trim();
                    console.log(`Đã lấy được ID học sinh từ dropdown: ${studentIdValue}`);
                } else {
                    studentIdValue = student.id; // Sử dụng ID từ dữ liệu
                }
            } else {
                studentIdValue = student.id; // Sử dụng ID từ dữ liệu
            }
            
            // Cập nhật mã học sinh - thử nhiều cách tìm phần tử
            let studentIdField = document.querySelector('input[placeholder="Mã học sinh"]');
            if (!studentIdField) {
                // Thử tìm bằng id
                studentIdField = document.getElementById('student-id');
            }
            if (!studentIdField) {
                // Tìm tất cả input và kiểm tra label tương ứng
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    const parentElement = input.parentElement;
                    if (parentElement && parentElement.querySelector('label') && 
                        parentElement.querySelector('label').textContent.includes('Mã học sinh')) {
                        studentIdField = input;
                        break;
                    }
                }
            }
            
            if (studentIdField) {
                studentIdField.value = studentIdValue;
                console.log(`Đã cập nhật mã học sinh: ${studentIdValue}`);
            } else {
                console.warn("Không tìm thấy trường mã học sinh");
            }
            
            // Cập nhật lớp học - thử nhiều cách tìm phần tử
            let classField = document.querySelector('input[placeholder="Lớp"]');
            if (!classField) {
                // Thử tìm bằng id
                classField = document.getElementById('payment-class');
            }
            if (!classField) {
                // Tìm tất cả input và kiểm tra label tương ứng
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    const parentElement = input.parentElement;
                    if (parentElement && parentElement.querySelector('label') && 
                        parentElement.querySelector('label').textContent.includes('Lớp:')) {
                        classField = input;
                        break;
                    }
                }
            }
            
            if (classField) {
                classField.value = classData.name;
                console.log(`Đã cập nhật lớp học: ${classData.name}`);
            } else {
                console.warn("Không tìm thấy trường lớp học");
            }
            
            // Cập nhật chu kỳ thanh toán - thử nhiều cách tìm phần tử
            let cycleSelect = document.querySelector('select[placeholder="Chu kỳ thanh toán"]');
            if (!cycleSelect) {
                cycleSelect = document.querySelector('select'); // Lấy select đầu tiên
                
                // Kiểm tra các select có label liên quan đến chu kỳ
                const selects = document.querySelectorAll('select');
                for (const select of selects) {
                    const parentElement = select.parentElement;
                    if (parentElement && parentElement.querySelector('label') && 
                        parentElement.querySelector('label').textContent.toLowerCase().includes('chu kỳ')) {
                        cycleSelect = select;
                        break;
                    }
                }
            }
            
            if (cycleSelect) {
                for (let i = 0; i < cycleSelect.options.length; i++) {
                    if (cycleSelect.options[i].text === student.paymentCycle || 
                        cycleSelect.options[i].value === student.paymentCycle) {
                        cycleSelect.selectedIndex = i;
                        console.log(`Đã cập nhật chu kỳ thanh toán: ${student.paymentCycle}`);
                        break;
                    }
                }
            } else {
                console.warn("Không tìm thấy trường chu kỳ thanh toán");
            }
            
            // Tính học phí dựa trên dữ liệu lớp học và chu kỳ thanh toán
            let baseAmount = 0;
            
            // Lấy học phí lớp từ dữ liệu lớp học
            if (classData && classData.fee) {
                console.log(`Học phí cơ bản của lớp ${classData.name}: ${classData.fee}`);
                
                if (student.paymentCycle === '8 buổi') {
                    baseAmount = classData.fee * 8;
                } else if (student.paymentCycle === '10 buổi') {
                    baseAmount = classData.fee * 10;
                } else if (student.paymentCycle === '1 tháng') {
                    baseAmount = classData.fee;
                } else if (student.paymentCycle === 'Theo ngày') {
                    baseAmount = classData.fee;
                }
                
                console.log(`Tổng học phí theo chu kỳ ${student.paymentCycle}: ${baseAmount}`);
            } else {
                console.warn("Không tìm thấy thông tin học phí của lớp học");
            }
            
            // Cập nhật tổng học phí - thử nhiều cách tìm phần tử
            let totalFeeField = document.querySelector('input[placeholder="Tổng học phí"]');
            if (!totalFeeField) {
                // Tìm tất cả input và kiểm tra label tương ứng
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    const parentElement = input.parentElement;
                    if (parentElement && parentElement.querySelector('label') && 
                        parentElement.querySelector('label').textContent.includes('Tổng học phí')) {
                        totalFeeField = input;
                        break;
                    }
                }
            }
            
            if (totalFeeField) {
                totalFeeField.value = formatCurrency(baseAmount);
                console.log(`Đã cập nhật tổng học phí: ${formatCurrency(baseAmount)}`);
            } else {
                console.warn("Không tìm thấy trường tổng học phí");
            }
            
            // Tìm tất cả các phần tử có chứa text "TỔNG CỘNG" hoặc "Tổng cộng"
            const totalElements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent.includes('TỔNG CỘNG') || 
                el.textContent.includes('Tổng cộng') ||
                el.textContent.includes('tổng cộng')
            );
            
            if (totalElements.length > 0) {
                // Tìm phần tử hiển thị số tiền gần phần tử "TỔNG CỘNG"
                for (const el of totalElements) {
                    // Tìm phần tử con của nó có màu nền đỏ
                    const redElement = el.querySelector('div[style*="background-color: #d9534f"]');
                    if (redElement) {
                        redElement.textContent = formatCurrency(baseAmount) + ' VND';
                        console.log(`Đã cập nhật hiển thị tổng cộng: ${formatCurrency(baseAmount)}`);
                        break;
                    }
                    
                    // Tìm phần tử anh em có chứa số tiền
                    const siblings = el.parentElement.children;
                    for (const sibling of siblings) {
                        if (sibling !== el && sibling.textContent.includes('VND')) {
                            sibling.textContent = formatCurrency(baseAmount) + ' VND';
                            console.log(`Đã cập nhật tổng cộng (sibling): ${formatCurrency(baseAmount)}`);
                            break;
                        }
                    }
                }
            } else {
                // Tìm các phần tử có màu nền đỏ
                const redElements = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.backgroundColor.includes('rgb(217, 83, 79)') || 
                           style.backgroundColor.includes('#d9534f');
                });
                
                if (redElements.length > 0) {
                    redElements[0].textContent = formatCurrency(baseAmount) + ' VND';
                    console.log(`Đã cập nhật hiển thị tổng cộng (red element): ${formatCurrency(baseAmount)}`);
                } else {
                    // Nếu không tìm thấy, tạo mới
                    console.log("Không tìm thấy phần tử hiển thị tổng cộng, tạo mới");
                    createTotalPaymentDisplay(baseAmount);
                }
            }
            
            // Trực tiếp cập nhật tất cả các phần tử có 0 VND
            const zeroElements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent.trim() === '0 VND'
            );
            
            for (const el of zeroElements) {
                el.textContent = formatCurrency(baseAmount) + ' VND';
                console.log(`Đã cập nhật phần tử có 0 VND: ${formatCurrency(baseAmount)}`);
            }
            
            // Cập nhật select học sinh nếu có
            const studentSelect = document.getElementById('payment-student');
            if (studentSelect) {
                // Xóa tất cả các option hiện tại
                studentSelect.innerHTML = '';
                
                // Tạo và thêm option cho học sinh này
                const option = document.createElement('option');
                option.value = studentId;
                option.text = `${student.name} (${student.id} - ${getClassName(student.classId)})`;
                studentSelect.add(option);
                
                // Chọn học sinh này
                studentSelect.value = studentId;
                
                // Làm cho select không thể thay đổi
                studentSelect.disabled = true;
            }
            
            // Cập nhật các trường bổ sung khác
            updatePaymentInformation(studentId);
        } else {
            // Nếu không có học sinh được chọn sẵn
            console.log("Không có học sinh được chọn sẵn, hiển thị danh sách học sinh");
            
            // Cập nhật tiêu đề modal
            const modalTitle = document.getElementById('payment-modal-title');
            if (modalTitle) {
                modalTitle.textContent = "Thêm thanh toán học phí";
            }
            
            // Lấy select học sinh
            const studentSelect = document.getElementById('payment-student');
            if (!studentSelect) {
                console.error("Không tìm thấy select học sinh");
                return;
            }
            
            // Làm mới danh sách học sinh
            studentSelect.disabled = false;
            updateStudentSelectOptions();
            
            // Cập nhật thông tin thanh toán dựa trên học sinh đầu tiên
            if (studentSelect.options.length > 0) {
                const firstStudentId = studentSelect.options[0].value;
                updatePaymentInformation(firstStudentId);
            }
        }
        
        // Thiết lập các sự kiện cho các trường bổ sung
        setupAdditionalFields();
        
        // Thiết lập tab thanh toán
        setupPaymentTabs();
        
        // Gán sự kiện cho select học sinh
        const studentSelect = document.getElementById('payment-student');
        if (studentSelect) {
            studentSelect.addEventListener('change', function() {
                updatePaymentInformation(this.value);
            });
        }
    } catch (error) {
        console.error("Lỗi khi mở modal thanh toán:", error);
    }
}

/**
 * Cập nhật thông tin thanh toán dựa trên học sinh đã chọn
 */
function updatePaymentInformation(studentId) {
    try {
        console.log(`Cập nhật thông tin thanh toán cho học sinh: ${studentId}`);
        
        if (!studentId) {
            console.error("Không có ID học sinh");
            return;
        }
        
        // Lấy thông tin học sinh
        const student = getStudentById(studentId);
        if (!student) {
            console.error(`Không tìm thấy học sinh với ID: ${studentId}`);
            return;
        }
        
        // Lấy thông tin lớp
        const classData = getClassById(student.classId);
        if (!classData) {
            console.error(`Không tìm thấy lớp học với ID: ${student.classId}`);
            return;
        }
        
        console.log(`Học sinh: ${student.name}, Lớp: ${classData.name}, Học phí: ${classData.fee}`);
        
        // Cập nhật mã học sinh nếu có trường này
        const studentIdInput = document.getElementById('student-id');
        if (studentIdInput) {
            studentIdInput.value = student.id;
        }
        
        // Cập nhật thông tin lớp học
        const classInfo = document.getElementById('payment-class-info');
        if (classInfo) {
            classInfo.textContent = classData.name;
        }
        
        // Điền vào trường lớp học
        const classInput = document.querySelector('input[placeholder="Lớp"]');
        if (classInput) {
            classInput.value = classData.name;
        }
        
        // Cập nhật chu kỳ thanh toán
        const cycleInfo = document.getElementById('payment-cycle-info');
        if (cycleInfo) {
            cycleInfo.textContent = student.paymentCycle;
        }
        
        // Chọn chu kỳ thanh toán trong select
        const cycleSelect = document.querySelector('select[id="payment-cycle"], select[placeholder="Chu kỳ thanh toán"]');
        if (cycleSelect) {
            // Tìm option có value giống với chu kỳ thanh toán của học sinh
            const options = Array.from(cycleSelect.options);
            const option = options.find(opt => opt.value === student.paymentCycle || opt.text === student.paymentCycle);
            if (option) {
                cycleSelect.value = option.value;
            }
        }
        
        // Cập nhật lịch học
        const scheduleInfo = document.getElementById('payment-schedule-info');
        if (scheduleInfo) {
            scheduleInfo.textContent = formatSchedule(classData.schedule);
        }
        
        // Cập nhật thông tin điểm danh
        const attendanceInfo = document.getElementById('payment-attendance-info');
        if (attendanceInfo) {
            // Tính toán tỷ lệ điểm danh
            const attendanceSummary = calculateAttendanceSummary(studentId);
            if (attendanceSummary) {
                const attendanceText = `${attendanceSummary.presentCount}/${attendanceSummary.totalCount} buổi (${Math.round(attendanceSummary.presentPercentage)}%)`;
                attendanceInfo.textContent = attendanceText;
            } else {
                attendanceInfo.textContent = 'Chưa có dữ liệu';
            }
        }
        
        // Cập nhật số tiền cơ bản
        let baseAmount = 0;
        
        if (student.paymentCycle === '8 buổi') {
            baseAmount = classData.fee * 8;
        } else if (student.paymentCycle === '10 buổi') {
            baseAmount = classData.fee * 10;
        } else if (student.paymentCycle === '1 tháng') {
            baseAmount = classData.fee;
        } else if (student.paymentCycle === 'Theo ngày') {
            baseAmount = classData.fee;
        }
        
        const baseAmountInput = document.getElementById('base-amount');
        if (baseAmountInput) {
            baseAmountInput.value = baseAmount;
        }
        
        // Cập nhật tổng học phí trong trường đầu vào
        const totalFeeInput = document.querySelector('input[placeholder="Tổng học phí"]');
        if (totalFeeInput) {
            totalFeeInput.value = formatCurrency(baseAmount);
        }
        
        // Cập nhật hiển thị tổng thanh toán ở cuối form
        updateTotalPayment();
        
        // Cập nhật trực tiếp phần tổng học phí ở cuối form
        const totalAmountDisplay = document.getElementById('payment-total-amount');
        if (totalAmountDisplay) {
            totalAmountDisplay.textContent = formatCurrency(baseAmount) + ' VND';
        } else {
            // Tìm phần tử hiển thị "TỔNG CỘNG" trong container
            const paymentTotalContainer = document.querySelector('.payment-total-container');
            if (paymentTotalContainer) {
                const amountElement = paymentTotalContainer.querySelector('div[style*="background-color: #d9534f"]');
                if (amountElement) {
                    amountElement.textContent = formatCurrency(baseAmount) + ' VND';
                }
            } else {
                // Nếu không tìm thấy container, tạo mới
                createTotalPaymentDisplay(baseAmount);
            }
        }
        
        // Cập nhật giá trị trường ẩn
        const amountInput = document.getElementById('payment-amount');
        if (amountInput) {
            amountInput.value = baseAmount;
        }
        
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin thanh toán:", error);
    }
}

/**
 * Cập nhật tổng thanh toán
 */
function updateTotalPayment() {
    try {
        // Lấy các giá trị
        const baseAmount = parseInt(document.getElementById('base-amount')?.value || 0);
        const additionalFee = parseInt(document.getElementById('additional-fee')?.value || 0);
        const discount = parseInt(document.getElementById('discount')?.value || 0);
        const flexibleSessions = parseInt(document.getElementById('flexible-sessions')?.value || 0);
        
        // Tính tổng thanh toán
        let totalAmount = baseAmount + additionalFee - discount;
        
        // Nếu có buổi học bổ sung
        if (flexibleSessions > 0) {
            // Lấy thông tin học sinh và lớp
            const studentId = document.getElementById('payment-student')?.value;
            if (studentId) {
                const student = getStudentById(studentId);
                if (student) {
                    const classData = getClassById(student.classId);
                    if (classData) {
                        // Tính phí buổi học bổ sung
                        const flexibleAmount = classData.fee * flexibleSessions;
                        totalAmount += flexibleAmount;
                    }
                }
            }
        }
        
        // Cập nhật hiển thị
        const paymentTotalContainer = document.querySelector('.payment-total-container');
        if (paymentTotalContainer) {
            // Tìm phần tử hiển thị số tiền
            const totalAmount2 = document.getElementById('payment-total-amount');
            if (totalAmount2) {
                totalAmount2.textContent = formatCurrency(totalAmount) + ' VND';
            } else {
                // Tìm và cập nhật phần tử hiển thị số tiền trong container
                const amountContainer = paymentTotalContainer.querySelector('div:last-child div');
                if (amountContainer) {
                    amountContainer.textContent = formatCurrency(totalAmount) + ' VND';
                }
            }
        } else {
            // Nếu không tìm thấy container, tạo mới
            createTotalPaymentDisplay(totalAmount);
        }
        
        // Cập nhật giá trị trường ẩn
        const amountInput = document.getElementById('payment-amount');
        if (amountInput) {
            amountInput.value = totalAmount;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật tổng thanh toán:", error);
    }
}

/**
 * Tạo hiển thị tổng thanh toán
 */
function createTotalPaymentDisplay(totalAmount) {
    try {
        const paymentForm = document.querySelector('#add-payment-modal .modal-body');
        if (!paymentForm) return;
        
        // Tạo container
        const totalContainer = document.createElement('div');
        totalContainer.className = 'payment-total-container';
        totalContainer.style.backgroundColor = '#ffffe0';
        totalContainer.style.padding = '10px';
        totalContainer.style.marginTop = '15px';
        totalContainer.style.marginBottom = '15px';
        totalContainer.style.borderRadius = '4px';
        
        // Tạo div chứa "TỔNG CỘNG" với nền đỏ
        const totalLabel = document.createElement('div');
        totalLabel.style.display = 'flex';
        totalLabel.style.justifyContent = 'space-between';
        totalLabel.style.alignItems = 'center';
        
        // Tạo phần tử hiển thị chữ "TỔNG CỘNG:"
        const labelSpan = document.createElement('span');
        labelSpan.textContent = 'TỔNG CỘNG:';
        labelSpan.style.fontWeight = 'bold';
        labelSpan.style.fontSize = '16px';
        labelSpan.style.color = '#d9534f';
        
        // Tạo phần tử hiển thị số tiền
        const amountContainer = document.createElement('div');
        amountContainer.style.backgroundColor = '#d9534f';
        amountContainer.style.color = 'white';
        amountContainer.style.padding = '8px 15px';
        amountContainer.style.borderRadius = '20px';
        amountContainer.style.fontWeight = 'bold';
        amountContainer.style.fontSize = '16px';
        amountContainer.id = 'payment-total-amount';
        amountContainer.textContent = formatCurrency(totalAmount) + ' VND';
        
        // Ghép các phần tử
        totalLabel.appendChild(labelSpan);
        totalLabel.appendChild(amountContainer);
        totalContainer.appendChild(totalLabel);
        
        // Thêm vào form
        const submitButton = paymentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            paymentForm.insertBefore(totalContainer, submitButton.parentNode);
        } else {
            paymentForm.appendChild(totalContainer);
        }
    } catch (error) {
        console.error("Lỗi khi tạo hiển thị tổng thanh toán:", error);
    }
}

/**
 * Thiết lập các trường bổ sung
 */
function setupAdditionalFields() {
    try {
        // Thiết lập các trường phí bổ sung
        const additionalReasonSelect = document.getElementById('additional-reason');
        const additionalOtherGroup = document.getElementById('additional-other-group');
        
        if (additionalReasonSelect && additionalOtherGroup) {
            additionalReasonSelect.addEventListener('change', function() {
                if (this.value === 'Khác') {
                    additionalOtherGroup.style.display = 'block';
                } else {
                    additionalOtherGroup.style.display = 'none';
                }
            });
        }
        
        // Thiết lập các trường giảm giá
        const discountReasonSelect = document.getElementById('discount-reason');
        const discountOtherGroup = document.getElementById('discount-other-group');
        
        if (discountReasonSelect && discountOtherGroup) {
            discountReasonSelect.addEventListener('change', function() {
                if (this.value === 'Khác') {
                    discountOtherGroup.style.display = 'block';
                } else {
                    discountOtherGroup.style.display = 'none';
                }
            });
        }
        
        // Thiết lập sự kiện cập nhật tổng thanh toán
        const updateFields = [
            'base-amount',
            'additional-fee',
            'discount',
            'flexible-sessions'
        ];
        
        updateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', updateTotalPayment);
            }
        });
    } catch (error) {
        console.error("Lỗi khi thiết lập các trường bổ sung:", error);
    }
}

/**
 * Thiết lập tab thanh toán
 */
function setupPaymentTabs() {
    try {
        const tabButtons = document.querySelectorAll('.payment-tab-button');
        const tabContents = document.querySelectorAll('.payment-tab-content');
        
        if (tabButtons.length === 0 || tabContents.length === 0) {
            console.log("Không tìm thấy tab thanh toán");
            return;
        }
        
        // Thiết lập sự kiện cho các nút tab
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Bỏ active tất cả nút tab
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Ẩn tất cả nội dung tab
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Hiển thị tab được chọn
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                const targetTab = document.getElementById(tabId);
                
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
        
        // Hiển thị tab đầu tiên mặc định
        if (tabButtons.length > 0 && tabContents.length > 0) {
            tabButtons[0].click();
        }
    } catch (error) {
        console.error("Lỗi khi thiết lập tab thanh toán:", error);
    }
}

/**
 * Xóa thanh toán
 */
function deletePayment(paymentId) {
    try {
        console.log(`Xóa thanh toán: ${paymentId}`);
        
        // Lấy danh sách thanh toán
        const payments = getPayments();
        
        // Tìm vị trí thanh toán cần xóa
        const index = payments.findIndex(payment => payment.id === paymentId);
        
        if (index === -1) {
            console.error(`Không tìm thấy thanh toán với ID: ${paymentId}`);
            return;
        }
        
        // Xóa thanh toán
        payments.splice(index, 1);
        
        // Lưu lại danh sách
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // Hiển thị lại danh sách thanh toán
        displayPaymentHistory();
        
        // Hiển thị lại danh sách học sinh chưa thanh toán
        displayUnpaidStudents();
        
        // Hiển thị thông báo
        if (typeof showNotification === 'function') {
            showNotification('Xóa thanh toán thành công', 'success');
        } else {
            alert('Xóa thanh toán thành công');
        }
    } catch (error) {
        console.error("Lỗi khi xóa thanh toán:", error);
    }
}

/**
 * Mở modal biên nhận
 */
function openReceiptModal(paymentId) {
    try {
        console.log(`Mở biên nhận: ${paymentId}`);
        
        const receiptModal = document.getElementById('receipt-modal');
        if (!receiptModal) {
            console.error("Không tìm thấy phần tử receipt-modal");
            return;
        }
        
        // Lấy thông tin thanh toán
        const payments = getPayments();
        const payment = payments.find(p => p.id === paymentId);
        
        if (!payment) {
            console.error(`Không tìm thấy thanh toán với ID: ${paymentId}`);
            alert('Không tìm thấy thông tin thanh toán');
            return;
        }
        
        // Lấy thông tin học sinh
        const student = getStudentById(payment.studentId);
        if (!student) {
            console.error(`Không tìm thấy học sinh với ID: ${payment.studentId}`);
            alert('Không tìm thấy thông tin học sinh');
            return;
        }
        
        // Lấy thông tin lớp
        const classData = getClassById(student.classId);
        if (!classData) {
            console.error(`Không tìm thấy lớp học với ID: ${student.classId}`);
            alert('Không tìm thấy thông tin lớp học');
            return;
        }
        
        // Cập nhật thông tin biên nhận - kiểm tra từng phần tử trước khi gán giá trị
        const elements = {
            'receipt-number': payment.receiptNumber || '',
            'receipt-date': formatDate(payment.date),
            'receipt-student-name': student.name,
            'receipt-student-id': student.id,
            'receipt-class': classData.name,
            'receipt-schedule': formatSchedule(classData.schedule),
            'receipt-cycle': payment.cycle || student.paymentCycle,
            'receipt-method': payment.method,
            'receipt-amount': formatCurrency(payment.amount),
            'receipt-amount-text': numberToWords(payment.amount) + ' đồng'
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Không tìm thấy phần tử có id ${id}`);
            }
        }
        
        // Cập nhật thông tin chi tiết
        if (payment.details) {
            // Số tiền cơ bản
            document.getElementById('receipt-base-amount').textContent = formatCurrency(payment.details.baseAmount);
            
            // Phí bổ sung
            const additionalFeeElement = document.getElementById('receipt-additional');
            const additionalReasonElement = document.getElementById('receipt-additional-reason');
            
            if (payment.details.additionalFee > 0) {
                additionalFeeElement.textContent = formatCurrency(payment.details.additionalFee);
                additionalReasonElement.textContent = payment.details.additionalReason || 'Không rõ lý do';
                document.getElementById('receipt-additional-container').style.display = 'block';
            } else {
                document.getElementById('receipt-additional-container').style.display = 'none';
            }
            
            // Giảm giá
            const discountElement = document.getElementById('receipt-discount');
            const discountReasonElement = document.getElementById('receipt-discount-reason');
            
            if (payment.details.discount > 0) {
                discountElement.textContent = formatCurrency(payment.details.discount);
                discountReasonElement.textContent = payment.details.discountReason || 'Không rõ lý do';
                document.getElementById('receipt-discount-container').style.display = 'block';
            } else {
                document.getElementById('receipt-discount-container').style.display = 'none';
            }
            
            // Buổi học bổ sung
            const flexibleContainer = document.getElementById('receipt-flexible-container');
            const flexibleSessionsElement = document.getElementById('receipt-flexible-sessions');
            const flexibleAmountElement = document.getElementById('receipt-flexible-amount');
            
            if (payment.details.flexibleSessions > 0) {
                flexibleSessionsElement.textContent = payment.details.flexibleSessions;
                flexibleAmountElement.textContent = formatCurrency(payment.details.flexibleAmount);
                flexibleContainer.style.display = 'block';
            } else {
                flexibleContainer.style.display = 'none';
            }
        }
        
        // Cập nhật thông tin điểm danh
        const attendanceSummary = calculateAttendanceSummary(student.id);
        if (attendanceSummary) {
            document.getElementById('receipt-total-sessions').textContent = attendanceSummary.totalCount;
            document.getElementById('receipt-present-sessions').textContent = attendanceSummary.presentCount;
            document.getElementById('receipt-absent-sessions').textContent = attendanceSummary.absentCount;
            document.getElementById('receipt-teacher-absent-sessions').textContent = attendanceSummary.teacherAbsentCount;
        }
        
        // Cập nhật lịch học bù
        displayMakeupClasses(student.id);
        
        // Cập nhật lịch sử điểm danh
        displayAttendanceHistory(student.id);
        
        // Cập nhật lịch sử thanh toán
        displayPaymentHistory(student.id, payment.id);
        
        // Cập nhật ngày ký
        document.getElementById('receipt-signature-date').textContent = formatDate(new Date());
        
        // Hiển thị modal
        document.getElementById('receipt-modal').classList.remove('hidden');
        
        // Thiết lập sự kiện cho các nút lưu biên nhận
        document.getElementById('save-receipt-image').addEventListener('click', saveReceiptAsImage);
        document.getElementById('save-receipt-pdf').addEventListener('click', saveReceiptAsPdf);
    } catch (error) {
        console.error("Lỗi khi mở biên nhận:", error);
        alert('Đã xảy ra lỗi khi hiển thị biên nhận: ' + error.message);
    }
}

/**
 * Hiển thị lịch học bù
 */
function displayMakeupClasses(studentId) {
    try {
        const makeupContainer = document.getElementById('receipt-makeup-classes');
        const makeupList = document.getElementById('receipt-makeup-list');
        
        if (!makeupContainer || !makeupList) {
            console.error("Không tìm thấy phần tử hiển thị lịch học bù");
            return;
        }
        
        // Lấy dữ liệu điểm danh
        const attendance = getAttendance();
        
        // Lọc các bản ghi có học sinh vắng mặt và có lịch học bù
        const makeupRecords = attendance.filter(record => {
            // Kiểm tra xem học sinh có trong danh sách không
            if (!record.students) return false;
            
            // Tìm thông tin học sinh trong bản ghi
            const studentRecord = record.students.find(s => s.id === studentId && s.status === 'absent');
            
            // Nếu học sinh vắng mặt và có lịch học bù
            return studentRecord && record.makeupDate;
        });
        
        // Nếu không có lịch học bù
        if (makeupRecords.length === 0) {
            makeupContainer.style.display = 'none';
            return;
        }
        
        // Xóa dữ liệu cũ
        makeupList.innerHTML = '';
        
        // Hiển thị danh sách lịch học bù
        makeupRecords.forEach(record => {
            const makeupItem = document.createElement('div');
            makeupItem.className = 'makeup-item';
            
            // Lấy tên lớp
            const className = getClassName(record.classId);
            
            // Tạo nội dung
            makeupItem.innerHTML = `
                <span>Ngày vắng: ${formatDate(record.date)}</span>
                <span>Lớp: ${className}</span>
                <span>Ngày học bù: ${formatDate(record.makeupDate)}</span>
            `;
            
            makeupList.appendChild(makeupItem);
        });
        
        // Hiển thị container
        makeupContainer.style.display = 'block';
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch học bù:", error);
    }
}

/**
 * Hiển thị lịch sử điểm danh
 */
function displayAttendanceHistory(studentId) {
    try {
        const historyContainer = document.getElementById('receipt-attendance-history');
        
        if (!historyContainer) {
            console.error("Không tìm thấy phần tử hiển thị lịch sử điểm danh");
            return;
        }
        
        // Lấy dữ liệu điểm danh
        const attendance = getAttendance();
        
        // Lọc các bản ghi có học sinh
        const studentRecords = [];
        
        attendance.forEach(record => {
            // Kiểm tra xem học sinh có trong danh sách không
            if (!record.students) return;
            
            // Tìm thông tin học sinh trong bản ghi
            const studentRecord = record.students.find(s => s.id === studentId);
            
            // Nếu có thông tin học sinh
            if (studentRecord) {
                studentRecords.push({
                    date: record.date,
                    className: getClassName(record.classId),
                    status: studentRecord.status,
                    teacherAbsent: record.teacherAbsent || false
                });
            }
        });
        
        // Sắp xếp theo ngày gần nhất
        studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Tạo bảng điểm danh
        let tableHtml = '<table class="attendance-history-table">';
        tableHtml += '<thead><tr><th>Ngày</th><th>Lớp</th><th>Trạng thái</th></tr></thead>';
        tableHtml += '<tbody>';
        
        if (studentRecords.length === 0) {
            tableHtml += '<tr><td colspan="3" class="empty-table">Không có dữ liệu điểm danh</td></tr>';
        } else {
            studentRecords.forEach(record => {
                let statusText = '';
                let statusClass = '';
                
                if (record.teacherAbsent) {
                    statusText = 'Giáo viên vắng';
                    statusClass = 'teacher-absent';
                } else if (record.status === 'present') {
                    statusText = 'Có mặt';
                    statusClass = 'present';
                } else if (record.status === 'absent') {
                    statusText = 'Vắng mặt';
                    statusClass = 'absent';
                }
                
                tableHtml += `
                    <tr>
                        <td>${formatDate(record.date)}</td>
                        <td>${record.className}</td>
                        <td class="${statusClass}">${statusText}</td>
                    </tr>
                `;
            });
        }
        
        tableHtml += '</tbody></table>';
        
        // Cập nhật nội dung
        historyContainer.innerHTML = tableHtml;
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử điểm danh:", error);
    }
}

/**
 * Hiển thị lịch sử thanh toán
 */
function displayPaymentHistory(studentId, currentPaymentId) {
    try {
        const historyContainer = document.getElementById('receipt-payment-history');
        
        if (!historyContainer) {
            console.error("Không tìm thấy phần tử hiển thị lịch sử thanh toán");
            return;
        }
        
        // Lấy dữ liệu thanh toán
        const payments = getPayments();
        
        // Lọc thanh toán của học sinh
        const studentPayments = payments.filter(payment => payment.studentId === studentId);
        
        // Sắp xếp theo ngày gần nhất
        studentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Tạo bảng thanh toán
        let tableHtml = '<table class="payment-history-table">';
        tableHtml += '<thead><tr><th>Ngày</th><th>Mã biên nhận</th><th>Chu kỳ</th><th>Số tiền</th></tr></thead>';
        tableHtml += '<tbody>';
        
        if (studentPayments.length === 0) {
            tableHtml += '<tr><td colspan="4" class="empty-table">Không có dữ liệu thanh toán</td></tr>';
        } else {
            studentPayments.forEach(payment => {
                // Đánh dấu thanh toán hiện tại
                const rowClass = payment.id === currentPaymentId ? 'current-payment' : '';
                
                tableHtml += `
                    <tr class="${rowClass}">
                        <td>${formatDate(payment.date)}</td>
                        <td>${payment.receiptNumber || payment.id}</td>
                        <td>${payment.cycle || ''}</td>
                        <td class="payment-amount">${formatCurrency(payment.amount)}</td>
                    </tr>
                `;
            });
        }
        
        tableHtml += '</tbody></table>';
        
        // Cập nhật nội dung
        historyContainer.innerHTML = tableHtml;
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử thanh toán:", error);
    }
}

/**
 * Lưu biên nhận thành hình ảnh
 */
function saveReceiptAsImage() {
    try {
        // Kiểm tra xem thư viện html2canvas đã được tải chưa
        if (typeof html2canvas === 'undefined') {
            alert('Thư viện html2canvas chưa được tải. Vui lòng làm mới trang và thử lại.');
            return;
        }
        
        // Lấy phần tử biên nhận
        const receiptContent = document.querySelector('.receipt-content');
        
        if (!receiptContent) {
            alert('Không tìm thấy nội dung biên nhận');
            return;
        }
        
        // Hiển thị thông báo
        alert('Đang tạo hình ảnh biên nhận, vui lòng đợi...');
        
        // Chuyển đổi biên nhận thành hình ảnh
        html2canvas(receiptContent, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#fff'
        }).then(canvas => {
            // Tạo link tải về
            const link = document.createElement('a');
            link.download = 'bien-nhan-' + document.getElementById('receipt-number').textContent + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error("Lỗi khi chuyển đổi biên nhận thành hình ảnh:", error);
            alert('Đã xảy ra lỗi khi tạo hình ảnh: ' + error.message);
        });
    } catch (error) {
        console.error("Lỗi khi lưu biên nhận thành hình ảnh:", error);
        alert('Đã xảy ra lỗi khi lưu biên nhận: ' + error.message);
    }
}

/**
 * Lưu biên nhận thành PDF
 */
function saveReceiptAsPdf() {
    try {
        // Kiểm tra xem thư viện jspdf và html2canvas đã được tải chưa
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('Các thư viện cần thiết chưa được tải. Vui lòng làm mới trang và thử lại.');
            return;
        }
        
        // Lấy phần tử biên nhận
        const receiptContent = document.querySelector('.receipt-content');
        
        if (!receiptContent) {
            alert('Không tìm thấy nội dung biên nhận');
            return;
        }
        
        // Hiển thị thông báo
        alert('Đang tạo PDF biên nhận, vui lòng đợi...');
        
        // Chuyển đổi biên nhận thành hình ảnh
        html2canvas(receiptContent, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#fff'
        }).then(canvas => {
            // Tạo PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Kích thước trang A4 (210 x 297 mm)
            const imgWidth = 210;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Thêm hình ảnh vào PDF
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Tải xuống PDF
            pdf.save('bien-nhan-' + document.getElementById('receipt-number').textContent + '.pdf');
        }).catch(error => {
            console.error("Lỗi khi chuyển đổi biên nhận thành PDF:", error);
            alert('Đã xảy ra lỗi khi tạo PDF: ' + error.message);
        });
    } catch (error) {
        console.error("Lỗi khi lưu biên nhận thành PDF:", error);
        alert('Đã xảy ra lỗi khi lưu biên nhận: ' + error.message);
    }
}

// Cập nhật danh sách học sinh trong modal
function updateStudentSelectOptions() {
    try {
        const studentSelect = document.getElementById('payment-student');
        if (!studentSelect) return;
        
        // Xóa các tùy chọn cũ
        studentSelect.innerHTML = '';
        
        // Lấy danh sách học sinh
        const students = getStudents();
        
        // Lấy danh sách lớp học
        const classes = getClasses();
        
        // Thêm các tùy chọn mới
        students.forEach(student => {
            // Lấy thông tin lớp
            const classData = classes.find(c => c.id === student.classId);
            if (!classData) return;
            
            // Tạo tùy chọn mới
            const option = document.createElement('option');
            option.value = student.id;
            option.text = `${student.name} (${student.id} - ${classData.name})`;
            studentSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật danh sách học sinh:", error);
    }
}