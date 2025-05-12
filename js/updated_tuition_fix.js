/**
 * Quản lý học phí (phiên bản sửa lỗi)
 * Phiên bản cải tiến với các chức năng sửa lỗi và cải thiện hiệu suất
 */

// Thiết lập tab học phí
function setupTuitionTabs() {
    // Kiểm tra nếu đã tồn tại tab, không cần thiết lập lại
    if (document.querySelector('.tuition-tabs')) {
        console.log("Phiên bản sửa lỗi - fixed-tuition.js đã được tải");
        return;
    }
    
    // Tìm các phần tử tab
    const tabButtons = document.querySelectorAll('.tuition-tab-button');
    if (tabButtons.length === 0) return;
    
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
    
    // Hiển thị tab học sinh chưa thanh toán mặc định
    displayUnpaidStudents();
    
    // Thêm hàm cập nhật tất cả các select học sinh để hiển thị tên rút gọn
    window.updateAllStudentSelects = function() {
        // Lấy danh sách học sinh
        const students = getStudents();
        if (!students || students.length === 0) return;
        
        // Tìm tất cả các select học sinh trong form
        document.querySelectorAll('select').forEach(select => {
            // Lấy option đầu tiên để kiểm tra nếu là select học sinh
            const firstOption = select.options.length > 0 ? select.options[0] : null;
            if (!firstOption) return;
            
            // Kiểm tra nếu là select học sinh (có chứa ID học sinh)
            const isStudentSelect = students.some(s => 
                firstOption.value === s.id || 
                firstOption.value.includes(s.id) ||
                firstOption.textContent.includes(s.id)
            );
            
            if (isStudentSelect) {
                // Lưu lại option đã chọn
                const selectedValue = select.value;
                
                // Xóa tất cả options hiện tại
                while (select.options.length > 0) {
                    select.remove(0);
                }
                
                // Thêm lại các options với tên rút gọn
                students.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.id;
                    option.textContent = getShortName(s.name) + ' (' + s.id + ' - ' + getClassName(s.classId) + ')';
                    select.appendChild(option);
                });
                
                // Khôi phục option đã chọn
                if (selectedValue) {
                    select.value = selectedValue;
                }
            }
        });
    };
    
    // Đảm bảo các select học sinh hiển thị tên rút gọn
    try {
        updateAllStudentSelects();
    } catch (error) {
        console.error("Lỗi khi cập nhật danh sách học sinh:", error);
    }
}

// Định nghĩa hàm hiển thị thanh toán
function displayPayments(filteredPayments = null) {
    const payments = filteredPayments || getPayments();
    console.log(`Số lượng thanh toán: ${payments.length}`);
    
    // Sắp xếp theo ngày mới nhất
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;
    
    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    
    // Hiển thị dữ liệu mới
    payments.forEach(payment => {
        console.log("Xử lý thanh toán:", payment);
        const student = getStudentById(payment.studentId);
        
        const row = document.createElement('tr');
        
        // Mã thanh toán
        const idCell = document.createElement('td');
        idCell.textContent = payment.id;
        row.appendChild(idCell);
        
        // Tên học sinh
        const nameCell = document.createElement('td');
        nameCell.textContent = student ? student.name : payment.studentName || 'Không xác định';
        row.appendChild(nameCell);
        
        // Lớp học
        const classCell = document.createElement('td');
        classCell.textContent = getClassName(student ? student.classId : payment.classId);
        row.appendChild(classCell);
        
        // Ngày thanh toán
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(payment.date);
        row.appendChild(dateCell);
        
        // Chu kỳ
        const cycleCell = document.createElement('td');
        cycleCell.textContent = payment.cycle;
        row.appendChild(cycleCell);
        
        // Số tiền
        const amountCell = document.createElement('td');
        amountCell.textContent = formatCurrency(payment.amount);
        row.appendChild(amountCell);
        
        // Hình thức thanh toán
        const methodCell = document.createElement('td');
        methodCell.textContent = payment.method;
        row.appendChild(methodCell);
        
        // Thao tác
        const actionCell = document.createElement('td');
        
        // Nút xem biên nhận
        const viewButton = document.createElement('button');
        viewButton.innerHTML = '<i class="fas fa-receipt"></i>';
        viewButton.className = 'btn-icon btn-view tooltip';
        viewButton.setAttribute('data-tooltip', 'Xem biên nhận');
        viewButton.addEventListener('click', () => {
            openReceiptModal(payment.id);
        });
        actionCell.appendChild(viewButton);
        
        // Nút xóa thanh toán
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.className = 'btn-icon btn-delete tooltip';
        deleteButton.setAttribute('data-tooltip', 'Xóa');
        deleteButton.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa thanh toán này không?')) {
                deletePayment(payment.id);
            }
        });
        actionCell.appendChild(deleteButton);
        
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Xóa bộ lọc thanh toán
function clearPaymentFilters() {
    document.getElementById('payment-filter-student').value = '';
    document.getElementById('payment-filter-class').value = '';
    document.getElementById('payment-filter-from').value = '';
    document.getElementById('payment-filter-to').value = '';
    displayPaymentHistory();
}

// Lọc thanh toán
function filterPayments() {
    const studentFilter = document.getElementById('payment-filter-student').value.toLowerCase();
    const classFilter = document.getElementById('payment-filter-class').value;
    const fromDateFilter = document.getElementById('payment-filter-from').value;
    const toDateFilter = document.getElementById('payment-filter-to').value;
    
    // Định dạng ngày cho so sánh
    const fromDate = fromDateFilter ? new Date(fromDateFilter) : null;
    const toDate = toDateFilter ? new Date(toDateFilter) : null;
    
    // Lọc thanh toán
    const payments = getPayments();
    const filteredPayments = payments.filter(payment => {
        const student = getStudentById(payment.studentId);
        if (!student) return false;
        
        // Lọc theo tên học sinh
        if (studentFilter && !student.name.toLowerCase().includes(studentFilter)) {
            return false;
        }
        
        // Lọc theo lớp
        if (classFilter && student.classId !== classFilter) {
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
}

// Định nghĩa hàm hiển thị học sinh chưa thanh toán
function displayUnpaidStudents() {
    console.log('Đang hiển thị học sinh chưa thanh toán...');
    
    // Lấy tất cả học sinh
    const students = getStudents();
    console.log(`Tổng số học sinh: ${students.length}`);
    
    // Lọc học sinh chưa thanh toán
    const unpaidStudents = students.filter(student => {
        const status = checkPaymentStatus(student);
        return status === 'unpaid' || status === 'overdue';
    });
    
    // Hiển thị danh sách học sinh
    const tableBody = document.getElementById('unpaid-students-table-body');
    if (!tableBody) return;
    
    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    
    // Hiển thị dữ liệu mới
    unpaidStudents.forEach(student => {
        const classData = getClassById(student.classId);
        if (!classData) return;
        
        const status = checkPaymentStatus(student);
        console.log(`Học sinh ${student.id}: ${student.name}, trạng thái: ${status}`);
        
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
            const lockedStatus = document.createElement('span');
            lockedStatus.textContent = 'Lớp đã đóng';
            lockedStatus.className = 'status-locked';
            nextPaymentCell.appendChild(lockedStatus);
        } else {
            // Nếu lớp bình thường, hiển thị ngày thanh toán tiếp theo
            const nextDate = calculateNextPaymentDate(
                student.lastPaymentDate || student.registerDate,
                classData.paymentCycle,
                student.id
            );
            nextPaymentCell.textContent = nextDate ? formatDate(nextDate) : 'Chưa xác định';
        }
        
        row.appendChild(nextPaymentCell);
        
        // Trạng thái
        const statusCell = document.createElement('td');
        const statusText = getPaymentStatusText(status);
        
        const statusSpan = document.createElement('span');
        statusSpan.textContent = statusText;
        statusSpan.className = `status-${status}`;
        
        statusCell.appendChild(statusSpan);
        row.appendChild(statusCell);
        
        // Thao tác
        const actionCell = document.createElement('td');
        
        // Nút thanh toán
        const payButton = document.createElement('button');
        payButton.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
        payButton.className = 'btn-icon btn-pay tooltip';
        payButton.setAttribute('data-tooltip', 'Thu học phí');
        payButton.addEventListener('click', () => {
            openAddPaymentModal(student.id);
        });
        actionCell.appendChild(payButton);
        
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
    
    console.log(`Số học sinh chưa thanh toán: ${unpaidStudents.length}`);
}

// Định nghĩa hàm hiển thị lịch sử thanh toán
function displayPaymentHistory(filteredPayments = null) {
    try {
        console.log('Đang hiển thị lịch sử thanh toán (phiên bản sửa lỗi)...');
        
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
            cycleCell.textContent = payment.cycle;
            row.appendChild(cycleCell);
            
            // Số tiền
            const amountCell = document.createElement('td');
            amountCell.textContent = formatCurrency(payment.amount);
            row.appendChild(amountCell);
            
            // Hình thức thanh toán
            const methodCell = document.createElement('td');
            methodCell.textContent = payment.method;
            row.appendChild(methodCell);
            
            // Số biên nhận
            const receiptCell = document.createElement('td');
            receiptCell.textContent = payment.receiptNumber || '-';
            row.appendChild(receiptCell);
            
            // Thao tác
            const actionCell = document.createElement('td');
            
            // Nút xem biên nhận
            const viewButton = document.createElement('button');
            viewButton.innerHTML = '<i class="fas fa-receipt"></i>';
            viewButton.className = 'btn-icon btn-view tooltip';
            viewButton.setAttribute('data-tooltip', 'Xem biên nhận');
            viewButton.addEventListener('click', () => {
                openReceiptModal(payment.id);
            });
            actionCell.appendChild(viewButton);
            
            // Nút xóa thanh toán
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.className = 'btn-icon btn-delete tooltip';
            deleteButton.setAttribute('data-tooltip', 'Xóa');
            deleteButton.addEventListener('click', () => {
                if (confirm('Bạn có chắc chắn muốn xóa thanh toán này không?')) {
                    deletePayment(payment.id);
                }
            });
            actionCell.appendChild(deleteButton);
            
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử thanh toán:", error);
    }
}

// Thiết lập các trường bổ sung trong form thanh toán
function setupAdditionalFields() {
    try {
        // Chi phí bổ sung
        const additionalFeeInput = document.getElementById('payment-additional-fee');
        if (additionalFeeInput) {
            additionalFeeInput.addEventListener('input', calculateTotalPayment);
        }
        
        // Lý do chi phí bổ sung
        const additionalReason = document.getElementById('payment-additional-reason');
        if (additionalReason) {
            additionalReason.addEventListener('change', function() {
                const otherContainer = document.getElementById('payment-additional-other-container');
                if (this.value === 'Khác') {
                    otherContainer.style.display = 'block';
                } else {
                    otherContainer.style.display = 'none';
                }
            });
        }
        
        // Lý do giảm giá
        const discountReason = document.getElementById('payment-discount-reason');
        if (discountReason) {
            discountReason.addEventListener('change', function() {
                const otherContainer = document.getElementById('payment-discount-other-container');
                if (this.value === 'Khác') {
                    otherContainer.style.display = 'block';
                } else {
                    otherContainer.style.display = 'none';
                }
            });
        }
        
        // Cập nhật tổng thanh toán khi thay đổi các trường
        const updateFields = [
            'payment-base-amount',
            'payment-additional-fee',
            'payment-discount',
            'payment-flexible-amount',
            'payment-flexible-sessions'
        ];
        
        updateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', calculateTotalPayment);
            }
        });
        
        // Thêm sự kiện cho nút xác nhận thanh toán
        const confirmButton = document.querySelector('#add-payment-modal .confirm-payment, #add-payment-modal button[type="submit"]');
        if (confirmButton) {
            console.log("Đã tìm thấy nút xác nhận thanh toán:", confirmButton);
            confirmButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Đã nhấp vào nút xác nhận thanh toán");
                handleAddPayment(new Event('submit'));
            });
        } else {
            console.error("Không tìm thấy nút xác nhận thanh toán");
        }
    } catch (error) {
        console.error("Lỗi khi thiết lập các trường bổ sung:", error);
    }
}

// Cập nhật thông tin học sinh trong form thanh toán
function updateStudentPaymentInfo(studentId) {
    if (!studentId) {
        console.error("Không có ID học sinh được cung cấp");
        return;
    }
    
    console.log(`Cập nhật thông tin học sinh với ID: ${studentId}`);
    
    const student = getStudentById(studentId);
    if (!student) {
        console.error(`Không tìm thấy học sinh với ID: ${studentId}`);
        return;
    }
    
    const classData = getClassById(student.classId);
    if (!classData) {
        console.error(`Không tìm thấy lớp học với ID: ${student.classId}`);
        return;
    }
    
    // Cập nhật các trường trong form
    const studentIdInput = document.getElementById('payment-student-id');
    if (studentIdInput) {
        studentIdInput.value = student.id;
    }
    
    // Cập nhật trường tên học sinh
    const studentNameInput = document.getElementById('payment-student-name');
    if (studentNameInput) {
        studentNameInput.value = student.name;
    }
    
    // Cập nhật dropdown học sinh (nếu có)
    const studentSelect = document.getElementById('payment-student');
    if (studentSelect) {
        studentSelect.value = student.id;
    }
    
    // Hiển thị tên lớp
    const classNameElement = document.getElementById('payment-class-name');
    if (classNameElement) {
        classNameElement.textContent = classData.name;
    }
    
    // Cập nhật trường lớp
    // Tìm tất cả các trường input có name="class" hoặc placeholder="Lớp" trong form
    const classInputs = document.querySelectorAll('#add-payment-modal input[name="class"], #add-payment-modal input[placeholder="Lớp"], #add-payment-modal input#payment-class');
    classInputs.forEach(input => {
        input.value = classData.name;
    });
    
    // Cập nhật học phí cơ bản
    const baseAmountInput = document.getElementById('payment-base-amount');
    if (baseAmountInput) {
        const baseAmount = classData.fee || 0;
        baseAmountInput.value = baseAmount;
    }
    
    // Cập nhật chu kỳ thanh toán
    const cycleSelect = document.getElementById('payment-cycle');
    if (cycleSelect) {
        cycleSelect.value = classData.paymentCycle || '';
    }
    
    // Cập nhật ngày thanh toán
    const dateInput = document.getElementById('payment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Cập nhật hình thức thanh toán mặc định
    const methodSelect = document.getElementById('payment-method');
    if (methodSelect && methodSelect.options.length > 0) {
        methodSelect.selectedIndex = 0;
    }
    
    // Tính toán tổng thanh toán
    calculateTotalPayment();
    
    console.log("Đã cập nhật thông tin học sinh trong form thanh toán");
}

// Cập nhật chi tiết học sinh và lớp học
function updateStudentDetails(studentId) {
    if (!studentId) return;
    
    const student = getStudentById(studentId);
    if (!student) return;
    
    const classData = getClassById(student.classId);
    if (!classData) return;
    
    // Cập nhật tên và lớp
    document.getElementById('payment-student-name').value = student.name;
    document.getElementById('payment-class').value = classData.name;
    
    // Cập nhật học phí cơ bản
    document.getElementById('payment-base-amount').value = classData.fee || 0;
    
    // Cập nhật chu kỳ thanh toán
    const cycleSelect = document.getElementById('payment-cycle');
    if (cycleSelect) {
        cycleSelect.value = classData.paymentCycle || '';
    }
    
    // Tính toán tổng thanh toán
    calculateTotalPayment();
}

// Tính toán học phí cơ bản
function calculateBaseAmount() {
    const baseAmountInput = document.getElementById('payment-base-amount');
    return baseAmountInput ? parseFloat(baseAmountInput.value) || 0 : 0;
}

// Tính toán số buổi linh hoạt
function calculateFlexibleSessions() {
    const flexibleSessionsInput = document.getElementById('payment-flexible-sessions');
    return flexibleSessionsInput ? parseInt(flexibleSessionsInput.value) || 0 : 0;
}

// Tính toán tổng thanh toán
function calculateTotalPayment() {
    try {
        // Lấy các giá trị từ form
        const baseAmount = calculateBaseAmount();
        console.log("Học phí cơ bản: " + baseAmount);
        
        // Chi phí bổ sung
        const additionalFeeInput = document.getElementById('payment-additional-fee');
        const additionalFee = additionalFeeInput ? parseFloat(additionalFeeInput.value) || 0 : 0;
        console.log("Chi phí bổ sung: " + additionalFee);
        
        // Khấu trừ
        const discountInput = document.getElementById('payment-discount');
        const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        console.log("Khấu trừ: " + discount);
        
        // Học phí linh hoạt
        const flexibleAmountInput = document.getElementById('payment-flexible-amount');
        const flexibleAmount = flexibleAmountInput ? parseFloat(flexibleAmountInput.value) || 0 : 0;
        console.log("Học phí linh hoạt: " + flexibleAmount);
        
        // Tính tổng tiền
        let totalAmount = baseAmount + additionalFee - discount + flexibleAmount;
        console.log("Tổng thanh toán: " + totalAmount);
        
        // Kiểm tra nếu tổng tiền âm
        if (totalAmount < 0) totalAmount = 0;
        
        // Hiển thị tổng tiền
        const totalDisplay = document.getElementById('payment-total');
        if (totalDisplay) {
            totalDisplay.textContent = formatCurrency(totalAmount);
        }
        
        // Cập nhật tổng cộng trong các thẻ có class "total-amount"
        document.querySelectorAll('.total-amount').forEach(el => {
            el.textContent = formatCurrency(totalAmount);
        });
        
        // Cập nhật tổng cộng gần nút thanh toán
        const paymentTotalElement = document.querySelector('#add-payment-modal .payment-total');
        if (paymentTotalElement) {
            paymentTotalElement.textContent = formatCurrency(totalAmount) + " VND";
        }
        
        // Tìm phần tử hiển thị tổng cộng ở cuối form
        const paymentTotalSummary = document.querySelector('#add-payment-modal .payment-total-container');
        if (paymentTotalSummary) {
            // Xóa nội dung hiện tại
            paymentTotalSummary.innerHTML = '';
            
            // Tạo phần tử hiển thị "TỔNG CỘNG:" với định dạng đặc biệt
            paymentTotalSummary.style.backgroundColor = '#ffffe0'; // Màu nền vàng nhạt
            paymentTotalSummary.style.padding = '10px';
            paymentTotalSummary.style.marginTop = '15px';
            paymentTotalSummary.style.marginBottom = '15px';
            paymentTotalSummary.style.borderRadius = '4px';
            
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
            amountContainer.style.backgroundColor = '#d9534f'; // Màu nền đỏ
            amountContainer.style.color = 'white'; // Chữ màu trắng
            amountContainer.style.padding = '8px 15px';
            amountContainer.style.borderRadius = '20px';
            amountContainer.style.fontWeight = 'bold';
            amountContainer.style.fontSize = '16px';
            amountContainer.textContent = formatCurrency(totalAmount) + ' VND';
            
            totalLabel.appendChild(labelSpan);
            totalLabel.appendChild(amountContainer);
            paymentTotalSummary.appendChild(totalLabel);
        } else {
            // Nếu không tìm thấy container, tạo mới
            const paymentForm = document.querySelector('#add-payment-modal .modal-body');
            if (paymentForm) {
                const newTotalContainer = document.createElement('div');
                newTotalContainer.className = 'payment-total-container';
                newTotalContainer.style.backgroundColor = '#ffffe0'; // Màu nền vàng nhạt
                newTotalContainer.style.padding = '10px';
                newTotalContainer.style.marginTop = '15px';
                newTotalContainer.style.marginBottom = '15px';
                newTotalContainer.style.borderRadius = '4px';
                
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
                amountContainer.style.backgroundColor = '#d9534f'; // Màu nền đỏ
                amountContainer.style.color = 'white'; // Chữ màu trắng
                amountContainer.style.padding = '8px 15px';
                amountContainer.style.borderRadius = '20px';
                amountContainer.style.fontWeight = 'bold';
                amountContainer.style.fontSize = '16px';
                amountContainer.textContent = formatCurrency(totalAmount) + ' VND';
                
                totalLabel.appendChild(labelSpan);
                totalLabel.appendChild(amountContainer);
                newTotalContainer.appendChild(totalLabel);
                
                // Chèn trước nút xác nhận thanh toán
                const submitButton = document.querySelector('#add-payment-modal .modal-footer');
                if (submitButton) {
                    paymentForm.insertBefore(newTotalContainer, submitButton);
                } else {
                    paymentForm.appendChild(newTotalContainer);
                }
            }
        }
        
        return totalAmount;
    } catch (error) {
        console.error("Lỗi khi tính tổng thanh toán:", error);
        return 0;
    }
}

// Xử lý thêm thanh toán
function handleAddPayment(event) {
    try {
        if (event) {
            event.preventDefault();
        }
        console.log("Xử lý thanh toán...");
        
        // Lấy giá trị từ form
        const form = document.getElementById('payment-form');
        const mode = form && form.dataset ? (form.dataset.mode || 'add') : 'add';
        console.log("Mode:", mode);
        
        const paymentIdElement = document.getElementById('payment-id');
        const paymentId = paymentIdElement ? paymentIdElement.value : 'payment' + Math.floor(Math.random() * 100000);
        console.log("Payment ID:", paymentId);
        
        const studentIdElement = document.getElementById('payment-student-id');
        const studentId = studentIdElement ? studentIdElement.value : null;
        console.log("Student ID:", studentId);
        
        const dateElement = document.getElementById('payment-date');
        const date = dateElement ? dateElement.value : null;
        console.log("Date:", date);
        
        const cycleElement = document.getElementById('payment-cycle');
        const cycle = cycleElement ? cycleElement.value : null;
        console.log("Cycle:", cycle);
        
        const methodElement = document.getElementById('payment-method');
        const method = methodElement ? methodElement.value : null;
        console.log("Method:", method);
        
        // Kiểm tra dữ liệu
        if (!studentId || !date || !cycle || !method) {
            alert('Vui lòng điền đầy đủ thông tin thanh toán');
            return;
        }
        
        // Tính toán tổng tiền
        const amount = calculateTotalPayment();
        if (amount <= 0) {
            alert('Số tiền thanh toán phải lớn hơn 0');
            return;
        }
        
        console.log("Dữ liệu thanh toán hợp lệ, tiếp tục xử lý...");
        
        // Lấy chi tiết bổ sung (nếu có)
        const baseAmount = calculateBaseAmount();
        
        const additionalFeeElement = document.getElementById('payment-additional-fee');
        const additionalFee = additionalFeeElement ? (parseFloat(additionalFeeElement.value) || 0) : 0;
        
        const additionalReasonElement = document.getElementById('payment-additional-reason');
        const additionalReason = additionalReasonElement ? (additionalReasonElement.value || '') : '';
        
        const additionalOtherElement = document.getElementById('payment-additional-other');
        const additionalOther = (additionalReason === 'Khác' && additionalOtherElement) ? additionalOtherElement.value : '';
        
        // Khấu trừ (nếu có)
        const discountElement = document.getElementById('payment-discount');
        const discount = discountElement ? (parseFloat(discountElement.value) || 0) : 0;
        
        const discountReasonElement = document.getElementById('payment-discount-reason');
        const discountReason = discountReasonElement ? (discountReasonElement.value || '') : '';
        
        const discountOtherElement = document.getElementById('payment-discount-other');
        const discountOther = (discountReason === 'Khác' && discountOtherElement) ? discountOtherElement.value : '';
        
        // Học phí linh hoạt (nếu có)
        const flexibleAmountElement = document.getElementById('payment-flexible-amount');
        const flexibleAmount = flexibleAmountElement ? (parseFloat(flexibleAmountElement.value) || 0) : 0;
        
        const flexibleSessionsElement = document.getElementById('payment-flexible-sessions');
        const flexibleSessions = flexibleSessionsElement ? (parseInt(flexibleSessionsElement.value) || 0) : 0;
        
        const flexibleReasonElement = document.getElementById('payment-flexible-reason');
        const flexibleReason = flexibleReasonElement ? (flexibleReasonElement.value || '') : '';
        
        // Lấy thông tin học sinh
        const student = getStudentById(studentId);
        if (!student) {
            console.error("Không tìm thấy thông tin học sinh:", studentId);
            alert('Không tìm thấy thông tin học sinh');
            return;
        }
        
        const classInfo = getClassById(student.classId);
        if (!classInfo) {
            console.error("Không tìm thấy thông tin lớp học:", student.classId);
            alert('Không tìm thấy thông tin lớp học');
            return;
        }
        
        // Tạo đối tượng thanh toán mới
        const newPayment = {
            id: paymentId,
            studentId: studentId,
            studentName: student.name,
            classId: student.classId,
            className: classInfo.name,
            date: date,
            cycle: cycle,
            method: method,
            amount: amount,
            baseAmount: baseAmount,
            additionalFee: additionalFee,
            additionalReason: additionalReason,
            additionalOther: additionalOther,
            discount: discount,
            discountReason: discountReason,
            discountOther: discountOther,
            flexibleAmount: flexibleAmount,
            flexibleSessions: flexibleSessions,
            flexibleReason: flexibleReason,
            receiptNumber: generateReceiptNumber(),
            createdAt: new Date().toISOString()
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

// Mở modal thêm thanh toán
function openAddPaymentModal(studentId = null) {
    // Hiển thị modal
    const modal = document.getElementById('add-payment-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Reset form
    const form = document.getElementById('add-payment-form');
    if (form) form.reset();
    
    // Chuẩn bị tab thanh toán
    setupPaymentTabs();
    
    // Thiết lập các trường bổ sung
    setupAdditionalFields();
    
    // Thiết lập ID thanh toán
    document.getElementById('payment-id').value = 'payment' + Math.floor(Math.random() * 100000);
    
    // Thiết lập ngày thanh toán
    const dateInput = document.getElementById('payment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Nếu có ID học sinh, cập nhật thông tin học sinh
    if (studentId) {
        updateStudentPaymentInfo(studentId);
    } else {
        // Thiết lập thông tin mặc định
        const studentSelect = document.getElementById('payment-student');
        if (studentSelect && studentSelect.options.length > 0) {
            const selectedStudentId = studentSelect.options[0].value;
            updateStudentPaymentInfo(selectedStudentId);
        }
    }
}

// Mở modal chỉnh sửa thanh toán
function openEditPaymentModal(paymentId) {
    // Hiển thị modal
    const modal = document.getElementById('add-payment-modal');
    if (!modal) return;
    
    // Lấy thanh toán từ localStorage
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    // Thay đổi chế độ form sang edit
    const form = document.getElementById('payment-form');
    if (form) {
        form.dataset.mode = 'edit';
    }
    
    // Hiển thị modal
    modal.classList.remove('hidden');
    
    // Chuẩn bị tab thanh toán
    setupPaymentTabs();
    
    // Thiết lập các trường bổ sung
    setupAdditionalFields();
    
    // Điền dữ liệu vào form
    document.getElementById('payment-id').value = payment.id;
    document.getElementById('payment-student-id').value = payment.studentId;
    
    const studentSelect = document.getElementById('payment-student');
    if (studentSelect) {
        studentSelect.value = payment.studentId;
    }
    
    // Cập nhật thông tin học sinh
    updateStudentPaymentInfo(payment.studentId);
    
    // Điền ngày và chu kỳ
    document.getElementById('payment-date').value = payment.date;
    document.getElementById('payment-cycle').value = payment.cycle;
    document.getElementById('payment-method').value = payment.method;
    
    // Điền số tiền
    document.getElementById('payment-base-amount').value = payment.baseAmount || '';
    
    // Nếu có chi tiết bổ sung
    if (payment.details) {
        // Chi phí bổ sung
        if (payment.details.additionalFee) {
            document.getElementById('payment-additional-fee').value = payment.details.additionalFee;
        }
        
        // Lý do chi phí bổ sung
        if (payment.details.additionalReason) {
            const reasonSelect = document.getElementById('payment-additional-reason');
            reasonSelect.value = payment.details.additionalReason;
            
            // Nếu là 'Khác', hiển thị trường khác
            if (payment.details.additionalReason === 'Khác') {
                document.getElementById('payment-additional-other-container').style.display = 'block';
                document.getElementById('payment-additional-other').value = payment.details.additionalOther || '';
            }
        }
        
        // Khấu trừ
        if (payment.details.discount) {
            document.getElementById('payment-discount').value = payment.details.discount;
        }
        
        // Lý do khấu trừ
        if (payment.details.discountReason) {
            const reasonSelect = document.getElementById('payment-discount-reason');
            reasonSelect.value = payment.details.discountReason;
            
            // Nếu là 'Khác', hiển thị trường khác
            if (payment.details.discountReason === 'Khác') {
                document.getElementById('payment-discount-other-container').style.display = 'block';
                document.getElementById('payment-discount-other').value = payment.details.discountOther || '';
            }
        }
        
        // Học phí linh hoạt
        if (payment.details.flexibleAmount) {
            document.getElementById('payment-flexible-amount').value = payment.details.flexibleAmount;
        }
        
        if (payment.details.flexibleSessions) {
            document.getElementById('payment-flexible-sessions').value = payment.details.flexibleSessions;
        }
        
        if (payment.details.flexibleReason) {
            document.getElementById('payment-flexible-reason').value = payment.details.flexibleReason;
        }
    }
    
    // Tính lại tổng thanh toán
    calculateTotalPayment();
}

// Thiết lập tab trong form thanh toán
function setupPaymentTabs() {
    const tabButtons = document.querySelectorAll('#add-payment-modal .payment-tab-button');
    const tabContents = document.querySelectorAll('#add-payment-modal .payment-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Ẩn tất cả nội dung tab
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Bỏ active tất cả nút tab
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hiển thị tab được chọn
            const tabId = this.getAttribute('data-tab');
            this.classList.add('active');
            
            document.getElementById(tabId).classList.add('active');
            
            // Tính lại tổng thanh toán khi chuyển tab
            calculateTotalPayment();
        });
    });
}

// Xóa thanh toán
function deletePayment(paymentId) {
    // Lấy danh sách thanh toán hiện tại
    let payments = getPayments();
    
    // Lọc bỏ thanh toán cần xóa
    payments = payments.filter(payment => payment.id !== paymentId);
    
    // Lưu lại danh sách đã cập nhật
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Hiển thị lại danh sách thanh toán
    displayPaymentHistory();
}

// Mở modal biên nhận
function openReceiptModal(paymentId) {
    try {
        console.log("Đang mở modal biên nhận cho thanh toán:", paymentId);
        
        const modal = document.getElementById('receipt-modal');
        if (!modal) {
            console.error("Không tìm thấy modal biên nhận");
            return;
        }
        
        const payments = getPayments();
        const payment = payments.find(p => p.id === paymentId);
        
        if (!payment) {
            console.error("Không tìm thấy thông tin thanh toán:", paymentId);
            return;
        }
        
        const student = getStudentById(payment.studentId);
        if (!student) {
            console.error("Không tìm thấy thông tin học sinh:", payment.studentId);
            return;
        }
        
        const classData = getClassById(student.classId);
        if (!classData) {
            console.error("Không tìm thấy thông tin lớp học:", student.classId);
            return;
        }
    
        // Điền thông tin cơ bản vào biên nhận
        const receiptNoElement = document.getElementById('receipt-no');
        if (receiptNoElement) {
            receiptNoElement.textContent = payment.receiptNumber || 'N/A';
        }
        
        const receiptAmountElement = document.getElementById('receipt-amount');
        if (receiptAmountElement) {
            receiptAmountElement.textContent = formatCurrency(payment.amount);
        }
        
        // Xử lý hiển thị số tiền bằng chữ với cơ chế bảo vệ lỗi
        try {
            const receiptAmountTextElement = document.getElementById('receipt-amount-text');
            if (receiptAmountTextElement) {
                receiptAmountTextElement.textContent = numberToWords(payment.amount);
            }
        } catch (error) {
            console.error("Lỗi khi chuyển đổi số thành chữ:", error);
            const receiptAmountTextElement = document.getElementById('receipt-amount-text');
            if (receiptAmountTextElement) {
                receiptAmountTextElement.textContent = "Số tiền bằng chữ";
            }
        }
        
        const studentNameElement = document.getElementById('receipt-student-name');
        if (studentNameElement) studentNameElement.textContent = student.name;
        
        const studentIdElement = document.getElementById('receipt-student-id');
        if (studentIdElement) studentIdElement.textContent = student.id;
        
        // Kiểm tra nếu lớp đã khóa
        const receiptClassElement = document.getElementById('receipt-class');
        if (receiptClassElement) {
            if (classData.locked) {
                receiptClassElement.innerHTML = `<span class="status-unpaid">${classData.name} (Lớp đã đóng)</span>`;
            } else {
                receiptClassElement.textContent = classData.name;
            }
        }
        
        const receiptPhoneElement = document.getElementById('receipt-phone');
        if (receiptPhoneElement) receiptPhoneElement.textContent = student.phone || 'Chưa cập nhật';
        
        const receiptDateElement = document.getElementById('receipt-date');
        if (receiptDateElement) receiptDateElement.textContent = formatDate(payment.date);
        
        const receiptCycleElement = document.getElementById('receipt-cycle');
        if (receiptCycleElement) receiptCycleElement.textContent = payment.cycle;
        
        const receiptMethodElement = document.getElementById('receipt-method');
        if (receiptMethodElement) receiptMethodElement.textContent = payment.method;
        
        const receiptRegDateElement = document.getElementById('receipt-registration-date');
        if (receiptRegDateElement) receiptRegDateElement.textContent = formatDate(student.registerDate);
        
        // Hiển thị lịch học
        const receiptClassScheduleElement = document.getElementById('receipt-class-schedule');
        if (receiptClassScheduleElement) {
            if (classData.schedule && classData.schedule.length > 0) {
                const formattedSchedule = formatSchedule(classData.schedule);
                receiptClassScheduleElement.textContent = formattedSchedule;
            } else {
                receiptClassScheduleElement.textContent = "Không có dữ liệu";
            }
        }
        
        // Hiển thị chi phí bổ sung nếu có
        const additionalFeeContainer = document.getElementById('receipt-additional-fee-container');
        if (payment.details && payment.details.additionalFee && payment.details.additionalFee > 0) {
            if (additionalFeeContainer) additionalFeeContainer.style.display = 'block';
            
            const additionalFeeAmount = document.getElementById('receipt-additional-fee');
            if (additionalFeeAmount) additionalFeeAmount.textContent = formatCurrency(payment.details.additionalFee);
            
            const additionalFeeReason = document.getElementById('receipt-additional-reason');
            if (additionalFeeReason) {
                let reason = payment.details.additionalReason || '';
                if (reason === 'Khác' && payment.details.additionalOther) {
                    reason += ': ' + payment.details.additionalOther;
                }
                additionalFeeReason.textContent = reason;
            }
        } else {
            if (additionalFeeContainer) additionalFeeContainer.style.display = 'none';
        }
        
        // Hiển thị khấu trừ nếu có
        const discountContainer = document.getElementById('receipt-discount-container');
        if (payment.details && payment.details.discount && payment.details.discount > 0) {
            if (discountContainer) discountContainer.style.display = 'block';
            
            const discountAmount = document.getElementById('receipt-discount');
            if (discountAmount) discountAmount.textContent = formatCurrency(payment.details.discount);
            
            const discountReason = document.getElementById('receipt-discount-reason');
            if (discountReason) {
                let reason = payment.details.discountReason || '';
                if (reason === 'Khác' && payment.details.discountOther) {
                    reason += ': ' + payment.details.discountOther;
                }
                discountReason.textContent = reason;
            }
        } else {
            if (discountContainer) discountContainer.style.display = 'none';
        }
        
        // Hiển thị học phí linh hoạt nếu có
        const flexibleContainer = document.getElementById('receipt-flexible-container');
        if (payment.details && payment.details.flexibleAmount && payment.details.flexibleAmount > 0) {
            if (flexibleContainer) flexibleContainer.style.display = 'block';
            
            const flexibleAmount = document.getElementById('receipt-flexible-amount');
            if (flexibleAmount) flexibleAmount.textContent = formatCurrency(payment.details.flexibleAmount);
            
            const flexibleSessions = document.getElementById('receipt-flexible-sessions');
            if (flexibleSessions) flexibleSessions.textContent = payment.details.flexibleSessions || '0';
            
            const flexibleReason = document.getElementById('receipt-flexible-reason');
            if (flexibleReason) flexibleReason.textContent = payment.details.flexibleReason || '';
        } else {
            if (flexibleContainer) flexibleContainer.style.display = 'none';
        }
        
        // Tạo mã QR
        const qrContainer = document.getElementById('receipt-qr-code');
        if (qrContainer) {
            try {
                qrContainer.innerHTML = '';
                generatePaymentQRCode(student.id, payment.amount, qrContainer);
            } catch (error) {
                console.error("Lỗi khi tạo mã QR:", error);
            }
        }
        
        // Hiển thị ngày trên chữ ký
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        const signatureDateElement = document.getElementById('receipt-signature-date');
        if (signatureDateElement) {
            signatureDateElement.textContent = `${day}/${month}/${year}`;
        }
        
        // Hiển thị modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error("Lỗi khi mở modal biên nhận:", error);
        alert("Không thể hiển thị biên nhận: " + error.message);
    }
}

// Lưu biên nhận thành hình ảnh
function saveReceiptAsImage() {
    const receiptContent = document.querySelector('.receipt-content');
    if (!receiptContent) return;
    
    // Sử dụng html2canvas để tạo ảnh
    html2canvas(receiptContent).then(canvas => {
        // Tạo link tải xuống
        const link = document.createElement('a');
        link.download = 'receipt.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Lưu biên nhận thành PDF
function saveReceiptAsPdf() {
    const receiptContent = document.querySelector('.receipt-content');
    if (!receiptContent) return;
    
    // Sử dụng html2pdf để tạo PDF
    const options = {
        margin: 10,
        filename: 'receipt.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Tạo và tải xuống PDF
    html2pdf().from(receiptContent).set(options).save();
}