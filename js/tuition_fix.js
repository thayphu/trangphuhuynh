/**
 * Quản lý học phí
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách học sinh chưa thanh toán mặc định
    displayUnpaidStudents();
    
    // Thiết lập các tab thanh toán
    setupTuitionTabs();
    
    // Xử lý form thêm thanh toán
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', handleAddPayment);
    }
    
    // Nút thêm thanh toán
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => openAddPaymentModal());
    }
    
    // Nút xóa bộ lọc thanh toán
    const clearFilterBtn = document.getElementById('clear-payment-filter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearPaymentFilters);
    }
    
    // Xử lý lọc thanh toán
    const paymentSearchInput = document.getElementById('payment-search');
    const paymentClassFilter = document.getElementById('payment-class-filter');
    const paymentDateFilter = document.getElementById('payment-date-filter');
    
    if (paymentSearchInput && paymentClassFilter && paymentDateFilter) {
        paymentSearchInput.addEventListener('input', filterPayments);
        paymentClassFilter.addEventListener('change', filterPayments);
        paymentDateFilter.addEventListener('change', filterPayments);
    }
    
    // Nút lưu biên nhận thành hình ảnh
    const saveReceiptImageBtn = document.getElementById('save-receipt-image');
    if (saveReceiptImageBtn) {
        saveReceiptImageBtn.addEventListener('click', saveReceiptAsImage);
    }
    
    // Nút lưu biên nhận thành PDF
    const saveReceiptPdfBtn = document.getElementById('save-receipt-pdf');
    if (saveReceiptPdfBtn) {
        saveReceiptPdfBtn.addEventListener('click', saveReceiptAsPdf);
    }
    
    // Cập nhật lớp của bộ lọc
    updatePaymentClassFilter();
    
    // Thêm event listeners cho các nút trong danh sách thanh toán
    document.addEventListener('click', function(event) {
        // Nút xem biên nhận
        if (event.target.closest('.view-receipt-btn')) {
            const paymentId = event.target.closest('.view-receipt-btn').getAttribute('data-id');
            openReceiptModal(paymentId);
        }
        
        // Nút sửa biên nhận
        if (event.target.closest('.edit-receipt-btn')) {
            const paymentId = event.target.closest('.edit-receipt-btn').getAttribute('data-id');
            openEditPaymentModal(paymentId);
        }
        
        // Nút xóa biên nhận
        if (event.target.closest('.delete-payment-btn')) {
            const paymentId = event.target.closest('.delete-payment-btn').getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn xóa biên nhận này không?')) {
                deletePayment(paymentId);
            }
        }
    });
});

// Thiết lập các tab thanh toán
function setupTuitionTabs() {
    const tabButtons = document.querySelectorAll('.payment-tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa active class từ tất cả các nút
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm active class cho nút được nhấp
            this.classList.add('active');
            
            // Ẩn tất cả nội dung tab
            const tabContents = document.querySelectorAll('.payment-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Hiển thị nội dung tab được chọn
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'unpaid-students') {
                displayUnpaidStudents();
            } else if (tabId === 'payment-history') {
                displayPaymentHistory();
            }
        });
    });
    
    // Hiển thị tab học sinh chưa thanh toán mặc định
    displayUnpaidStudents();
}

// Hiển thị danh sách học sinh chưa thanh toán
function displayUnpaidStudents() {
    try {
        console.log("Đang hiển thị học sinh chưa thanh toán...");
        
        const students = getStudents();
        console.log("Tổng số học sinh:", students.length);
        
        const unpaidStudents = students.filter(student => {
            const paymentStatus = checkPaymentStatus(student);
            return paymentStatus === 'unpaid' || paymentStatus === 'overdue';
        });
        
        console.log("Số học sinh chưa thanh toán:", unpaidStudents.length);
        
        let unpaidStudentsTableBody = document.getElementById('unpaid-students-table-body');
        
        // Nếu không tìm thấy, có thể HTML chưa được tạo đúng
        if (!unpaidStudentsTableBody) {
            console.error("Không tìm thấy phần tử unpaid-students-table-body");
            
            // Tìm container chính
            const unpaidStudentsTab = document.getElementById('unpaid-students');
            if (!unpaidStudentsTab) {
                console.error("Không tìm thấy tab unpaid-students");
                return;
            }
            
            // Tạo lại cấu trúc HTML
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
            
            // Lấy lại thẻ tbody
            unpaidStudentsTableBody = document.getElementById('unpaid-students-table-body');
            if (!unpaidStudentsTableBody) {
                console.error("Vẫn không tìm thấy unpaid-students-table-body sau khi tạo lại");
                return;
            }
        }
        
        unpaidStudentsTableBody.innerHTML = '';
        
        unpaidStudents.forEach(student => {
            const classData = getClassById(student.classId);
            if (!classData) return;
            
            // Tính tổng học phí dựa trên chu kỳ
            let totalFee = classData.fee;
            if (classData.paymentCycle === '8 buổi') {
                totalFee = classData.fee * 8;
            } else if (classData.paymentCycle === '10 buổi') {
                totalFee = classData.fee * 10;
            }
            
            // Tính hạn thanh toán
            const paymentStatus = checkPaymentStatus(student);
            const dueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
            
            const row = document.createElement('tr');
            // Sử dụng hàm getShortName để lấy tên rút gọn (họ + tên)
            let shortName = getShortName(student.name);
            
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${shortName}</td>
                <td>${classData.name}</td>
                <td>${formatDate(student.registerDate)}</td>
                <td><span class="fee-highlight">${formatCurrency(totalFee)} VND</span></td>
                <td>${student.paymentCycle}</td>
                <td>${formatDate(dueDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn collect-payment-btn" data-id="${student.id}" title="Thu học phí"><i class="fas fa-money-bill-wave"></i></button>
                    </div>
                </td>
            `;
            
            unpaidStudentsTableBody.appendChild(row);
        });
        
        // Thêm sự kiện cho các nút thu học phí
        document.querySelectorAll('.collect-payment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const studentId = this.dataset.id;
                openAddPaymentModal(studentId);
            });
        });
    } catch (error) {
        console.error("Lỗi khi hiển thị học sinh chưa thanh toán:", error);
    }
}

// Hiển thị lịch sử thanh toán
function displayPaymentHistory(filteredPayments = null) {
    try {
        console.log("Đã lấy " + (filteredPayments ? filteredPayments.length : "tất cả") + " thanh toán từ localStorage");
        
        let paymentsTableBody = document.getElementById('payments-table-body');
        
        // Nếu không tìm thấy, có thể HTML chưa được tạo đúng
        if (!paymentsTableBody) {
            console.error("Không tìm thấy phần tử payments-table-body");
            
            // Tìm container chính
            const paymentHistoryTab = document.getElementById('payment-history');
            if (!paymentHistoryTab) {
                console.error("Không tìm thấy tab payment-history");
                return;
            }
            
            // Tạo lại cấu trúc HTML
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
                                <th>Mã biên nhận</th>
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
            
            // Lấy lại thẻ tbody
            paymentsTableBody = document.getElementById('payments-table-body');
            if (!paymentsTableBody) {
                console.error("Vẫn không tìm thấy payments-table-body sau khi tạo lại");
                return;
            }
            
            console.log("Đã tạo lại cấu trúc HTML cho lịch sử thanh toán");
        }
        
        paymentsTableBody.innerHTML = '';
        
        // Lấy dữ liệu từ localStorage
        let payments = [];
        try {
            payments = filteredPayments || getPayments();
            console.log(`Số lượng thanh toán: ${payments.length}`);
        } catch (e) {
            console.error("Lỗi khi lấy dữ liệu thanh toán:", e);
            return;
        }
        
        // Sắp xếp thanh toán theo ngày, mới nhất lên đầu
        const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedPayments.forEach(payment => {
            console.log("Xử lý thanh toán:", payment);
            
            const student = getStudentById(payment.studentId);
            
            // Nếu học sinh không còn tồn tại, hiển thị thông tin chi tiết và bỏ qua
            if (!student) {
                console.error(`Không tìm thấy học sinh với ID: ${payment.studentId} cho thanh toán ${payment.id}`);
                return;
            }
            
            const row = document.createElement('tr');
            // Sử dụng hàm getShortName để lấy tên rút gọn (họ + tên)
            let shortName = getShortName(student.name);
            
            row.innerHTML = `
                <td>${payment.receiptNumber || ''}</td>
                <td>${payment.studentId}</td>
                <td>${shortName}</td>
                <td>${getClassName(student.classId)}</td>
                <td>${formatDate(payment.date)}</td>
                <td><span class="fee-highlight">${formatCurrency(payment.amount)} VND</span></td>
                <td>${payment.cycle}</td>
                <td>${payment.method}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-class-btn view-receipt-btn" data-id="${payment.id}" title="Xem biên nhận"><i class="fas fa-eye"></i></button>
                        <button class="icon-btn toggle-lock-class-btn edit-receipt-btn" data-id="${payment.id}" title="Sửa biên nhận"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn delete-class-btn delete-payment-btn" data-id="${payment.id}" title="Xóa biên nhận"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            
            paymentsTableBody.appendChild(row);
        });
        
        // Thêm sự kiện cho các nút
        attachPaymentButtonEvents();
    } catch (error) {
        console.error("Lỗi khi hiển thị lịch sử thanh toán:", error);
    }
}

// Thiết lập các trường bổ sung trong form thanh toán
function setupAdditionalFields() {
    try {
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
    
    const student = getStudentById(studentId);
    if (!student) {
        console.error(`Không tìm thấy học sinh với ID: ${studentId}`);
        return;
    }
    
    // Cập nhật ID học sinh trong form
    document.getElementById('payment-student-id').value = studentId;
    
    // Cập nhật thông tin chi tiết học sinh
    updateStudentDetails(studentId);
}

// Cập nhật chi tiết học sinh trong form thanh toán
function updateStudentDetails(studentId) {
    try {
        if (!studentId) return;
        
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
        
        // Hiển thị tên học sinh
        const studentNameDisplay = document.getElementById('payment-student-name');
        if (studentNameDisplay) studentNameDisplay.textContent = student.name;
        
        // Hiển thị tên lớp
        const classNameDisplay = document.getElementById('payment-class-name');
        if (classNameDisplay) classNameDisplay.textContent = classData.name;
        
        // Hiển thị học phí cơ bản
        const baseAmountInput = document.getElementById('payment-base-amount');
        if (baseAmountInput) baseAmountInput.value = classData.fee || 0;
        
        // Cập nhật chu kỳ thanh toán
        const cycleSelect = document.getElementById('payment-cycle');
        if (cycleSelect && classData.cycle) {
            // Tìm option có value tương ứng với chu kỳ của lớp
            for (let i = 0; i < cycleSelect.options.length; i++) {
                if (cycleSelect.options[i].value === classData.cycle) {
                    cycleSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Tính toán lại tổng thanh toán
        calculateTotalPayment();
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin học sinh:", error);
    }
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
        
        // Chi phí bổ sung
        const additionalFeeInput = document.getElementById('payment-additional-fee');
        const additionalFee = additionalFeeInput ? parseFloat(additionalFeeInput.value) || 0 : 0;
        
        // Khấu trừ
        const discountInput = document.getElementById('payment-discount');
        const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        
        // Học phí linh hoạt
        const flexibleAmountInput = document.getElementById('payment-flexible-amount');
        const flexibleAmount = flexibleAmountInput ? parseFloat(flexibleAmountInput.value) || 0 : 0;
        
        // Tính tổng tiền
        let totalAmount = baseAmount + additionalFee - discount + flexibleAmount;
        
        // Kiểm tra nếu tổng tiền âm
        if (totalAmount < 0) totalAmount = 0;
        
        // Hiển thị tổng tiền
        const totalDisplay = document.getElementById('payment-total');
        if (totalDisplay) totalDisplay.textContent = formatCurrency(totalAmount);
        
        return totalAmount;
    } catch (error) {
        console.error("Lỗi khi tính tổng thanh toán:", error);
        return 0;
    }
}

// Xử lý thêm thanh toán
function handleAddPayment(event) {
    event.preventDefault();
    
    // Lấy giá trị từ form
    const form = event.target;
    const mode = form.dataset.mode || 'add';
    
    const paymentId = document.getElementById('payment-id').value || 'payment' + Math.floor(Math.random() * 100000);
    const studentId = document.getElementById('payment-student-id').value;
    const date = document.getElementById('payment-date').value;
    const cycle = document.getElementById('payment-cycle').value;
    const method = document.getElementById('payment-method').value;
    
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
    
    // Lấy chi tiết bổ sung (nếu có)
    const baseAmount = calculateBaseAmount();
    const additionalFee = parseFloat(document.getElementById('payment-additional-fee').value) || 0;
    const additionalReason = document.getElementById('payment-additional-reason').value;
    const additionalOther = document.getElementById('payment-additional-other').value;
    const discount = parseFloat(document.getElementById('payment-discount').value) || 0;
    const discountReason = document.getElementById('payment-discount-reason').value;
    const discountOther = document.getElementById('payment-discount-other').value;
    const flexibleAmount = parseFloat(document.getElementById('payment-flexible-amount').value) || 0;
    const flexibleSessions = calculateFlexibleSessions();
    
    // Tạo hoặc cập nhật bản ghi thanh toán
    let receiptNumber = document.getElementById('payment-receipt-number').value;
    if (!receiptNumber) {
        // Tạo số biên nhận mới nếu không có
        const year = new Date().getFullYear();
        const payments = getPayments();
        const count = payments.length + 1;
        receiptNumber = `${year}${count.toString().padStart(3, '0')}`;
    }
    
    // Tạo đối tượng thanh toán mới
    const newPayment = {
        id: paymentId,
        receiptNumber,
        studentId,
        amount,
        date,
        cycle,
        method,
        details: {
            baseAmount,
            additionalFee,
            additionalReason: additionalReason === 'Khác' ? additionalOther : additionalReason,
            discount,
            discountReason: discountReason === 'Khác' ? discountOther : discountReason,
            flexibleAmount,
            flexibleSessions
        }
    };
    
    // Lấy danh sách thanh toán hiện tại và thêm thanh toán mới
    const payments = getPayments();
    
    if (mode === 'edit') {
        // Tìm và cập nhật thanh toán hiện có
        const index = payments.findIndex(p => p.id === paymentId);
        if (index !== -1) {
            payments[index] = newPayment;
        } else {
            // Nếu không tìm thấy, thêm mới
            payments.push(newPayment);
        }
    } else {
        // Thêm mới
        payments.push(newPayment);
    }
    
    // Lưu vào localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Đóng modal
    document.getElementById('add-payment-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách thanh toán
    displayPaymentHistory();
    
    // Hiển thị thông báo thành công
    showNotification('Thanh toán học phí thành công', 'success');
    
    // Mở modal biên nhận
    openReceiptModal(newPayment.id);
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
    
    // Đặt ngày mặc định
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('payment-date').value = dateString;
    
    // Cập nhật thông tin về học sinh nếu được chọn
    if (studentId) {
        updateStudentPaymentInfo(studentId);
    }
}

// Mở modal chỉnh sửa thanh toán
function openEditPaymentModal(paymentId) {
    // Hiển thị modal
    const modal = document.getElementById('add-payment-modal');
    if (!modal) return;
    
    // Lấy thông tin thanh toán
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        console.error(`Không tìm thấy thanh toán với ID: ${paymentId}`);
        return;
    }
    
    // Hiển thị modal
    modal.classList.remove('hidden');
    
    // Reset form
    const form = document.getElementById('add-payment-form');
    if (form) form.reset();
    
    // Chuẩn bị tab thanh toán
    setupPaymentTabs();
    
    // Thiết lập các trường bổ sung
    setupAdditionalFields();
    
    // Điền thông tin từ bản ghi thanh toán
    document.getElementById('payment-id').value = payment.id;
    document.getElementById('payment-student-id').value = payment.studentId;
    document.getElementById('payment-date').value = payment.date;
    document.getElementById('payment-method').value = payment.method;
    document.getElementById('payment-receipt-number').value = payment.receiptNumber || '';
    
    // Cập nhật thông tin chi tiết học sinh
    updateStudentDetails(payment.studentId);
    
    // Điền thông tin chi tiết (nếu có)
    if (payment.details) {
        // Học phí cơ bản
        if (payment.details.baseAmount) {
            document.getElementById('payment-base-amount').value = payment.details.baseAmount;
        }
        
        // Chi phí bổ sung
        if (payment.details.additionalFee) {
            document.getElementById('payment-additional-fee').value = payment.details.additionalFee;
            
            // Lý do chi phí bổ sung
            const additionalReason = document.getElementById('payment-additional-reason');
            if (additionalReason) {
                const reasonValue = payment.details.additionalReason;
                
                // Kiểm tra xem có trong danh sách không
                let found = false;
                for (let i = 0; i < additionalReason.options.length; i++) {
                    if (additionalReason.options[i].value === reasonValue) {
                        additionalReason.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                
                // Nếu không có, chọn "Khác" và điền vào ô khác
                if (!found && reasonValue) {
                    for (let i = 0; i < additionalReason.options.length; i++) {
                        if (additionalReason.options[i].value === 'Khác') {
                            additionalReason.selectedIndex = i;
                            
                            // Hiện ô khác và điền giá trị
                            document.getElementById('payment-additional-other-container').style.display = 'block';
                            document.getElementById('payment-additional-other').value = reasonValue;
                            break;
                        }
                    }
                }
            }
        }
        
        // Khấu trừ
        if (payment.details.discount) {
            document.getElementById('payment-discount').value = payment.details.discount;
            
            // Lý do khấu trừ
            const discountReason = document.getElementById('payment-discount-reason');
            if (discountReason) {
                const reasonValue = payment.details.discountReason;
                
                // Kiểm tra xem có trong danh sách không
                let found = false;
                for (let i = 0; i < discountReason.options.length; i++) {
                    if (discountReason.options[i].value === reasonValue) {
                        discountReason.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                
                // Nếu không có, chọn "Khác" và điền vào ô khác
                if (!found && reasonValue) {
                    for (let i = 0; i < discountReason.options.length; i++) {
                        if (discountReason.options[i].value === 'Khác') {
                            discountReason.selectedIndex = i;
                            
                            // Hiện ô khác và điền giá trị
                            document.getElementById('payment-discount-other-container').style.display = 'block';
                            document.getElementById('payment-discount-other').value = reasonValue;
                            break;
                        }
                    }
                }
            }
        }
        
        // Học phí linh hoạt
        if (payment.details.flexibleAmount) {
            document.getElementById('payment-flexible-amount').value = payment.details.flexibleAmount;
        }
        
        if (payment.details.flexibleSessions) {
            document.getElementById('payment-flexible-sessions').value = payment.details.flexibleSessions;
        }
    }
    
    // Cập nhật tổng thanh toán
    calculateTotalPayment();
    
    // Thay đổi chức năng form
    form.dataset.mode = 'edit';
    document.querySelector('#add-payment-modal h2').textContent = 'Chỉnh sửa biên nhận';
    document.querySelector('#add-payment-form button[type="submit"]').textContent = 'Cập nhật biên nhận';
}

// Thiết lập các tab thanh toán
function setupPaymentTabs() {
    const tabButtons = document.querySelectorAll('.payment-form-tab-button');
    const tabContents = document.querySelectorAll('.payment-form-tab-content');
    
    tabButtons.forEach(button => {
        // Xóa event listeners cũ
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Thêm event listener mới
        newButton.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Xóa active class từ tất cả các tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Thêm active class cho tab được chọn
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
    
    // Lưu vào localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Hiển thị lại danh sách thanh toán
    displayPaymentHistory();
}

// Mở modal biên nhận
function openReceiptModal(paymentId) {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;
    
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) return;
    
    const student = getStudentById(payment.studentId);
    if (!student) return;
    
    const classData = getClassById(student.classId);
    if (!classData) return;
    
    // Điền thông tin cơ bản vào biên nhận
    document.getElementById('receipt-no').textContent = payment.receiptNumber;
    document.getElementById('receipt-amount').textContent = formatCurrency(payment.amount);
    // Xử lý hiển thị số tiền bằng chữ với cơ chế bảo vệ lỗi
    try {
        document.getElementById('receipt-amount-text').textContent = numberToWords(payment.amount);
    } catch (error) {
        console.error("Lỗi khi chuyển đổi số thành chữ:", error);
        document.getElementById('receipt-amount-text').textContent = "Số tiền bằng chữ";
    }
    document.getElementById('receipt-student-name').textContent = student.name;
    document.getElementById('receipt-student-id').textContent = student.id;
    
    // Kiểm tra nếu lớp đã khóa
    if (classData.locked) {
        document.getElementById('receipt-class').innerHTML = `<span class="status-unpaid">${classData.name} (Lớp đã đóng)</span>`;
    } else {
        document.getElementById('receipt-class').textContent = classData.name;
    }
    
    document.getElementById('receipt-phone').textContent = student.phone || 'Chưa cập nhật';
    document.getElementById('receipt-date').textContent = formatDate(payment.date);
    document.getElementById('receipt-cycle').textContent = payment.cycle;
    document.getElementById('receipt-method').textContent = payment.method;
    document.getElementById('receipt-registration-date').textContent = formatDate(student.registerDate);
    
    // Hiển thị lịch học
    if (classData.schedule && classData.schedule.length > 0) {
        const formattedSchedule = formatSchedule(classData.schedule);
        document.getElementById('receipt-class-schedule').textContent = formattedSchedule;
    } else {
        document.getElementById('receipt-class-schedule').textContent = "Không có dữ liệu";
    }
    
    // Hiển thị chi phí bổ sung nếu có
    const additionalFeeContainer = document.getElementById('receipt-additional-fee-container');
    if (payment.details && payment.details.additionalFee && payment.details.additionalFee > 0) {
        document.getElementById('receipt-additional-fee').textContent = formatCurrency(payment.details.additionalFee);
        document.getElementById('receipt-additional-reason').textContent = payment.details.additionalReason || 'Không có';
        additionalFeeContainer.style.display = 'block';
    } else {
        additionalFeeContainer.style.display = 'none';
    }
    
    // Hiển thị khấu trừ nếu có
    const discountContainer = document.getElementById('receipt-discount-container');
    if (payment.details && payment.details.discount && payment.details.discount > 0) {
        document.getElementById('receipt-discount').textContent = formatCurrency(payment.details.discount);
        document.getElementById('receipt-discount-reason').textContent = payment.details.discountReason || 'Không có';
        discountContainer.style.display = 'block';
    } else {
        discountContainer.style.display = 'none';
    }
    
    // Hiển thị học phí linh hoạt nếu có
    const flexibleContainer = document.getElementById('receipt-flexible-container');
    if (payment.details && payment.details.flexibleAmount && payment.details.flexibleAmount > 0) {
        document.getElementById('receipt-flexible-amount').textContent = formatCurrency(payment.details.flexibleAmount);
        document.getElementById('receipt-flexible-sessions').textContent = payment.details.flexibleSessions || '0';
        flexibleContainer.style.display = 'block';
    } else {
        flexibleContainer.style.display = 'none';
    }
    
    // Hiển thị ngày thanh toán tiếp theo
    if (!classData.locked) {
        let nextPaymentDate;
        try {
            nextPaymentDate = calculateNextPaymentDate(payment.date, payment.cycle, student.id);
            const formattedNextDate = formatDate(nextPaymentDate);
            document.getElementById('receipt-next-payment').textContent = formattedNextDate;
            document.getElementById('receipt-next-payment-container').style.display = 'block';
        } catch (error) {
            console.error("Lỗi khi tính ngày thanh toán tiếp theo:", error);
            document.getElementById('receipt-next-payment-container').style.display = 'none';
        }
    } else {
        document.getElementById('receipt-next-payment-container').style.display = 'none';
        // Hiển thị "Lớp đã đóng" phần trạng thái
        const statusContainer = document.getElementById('receipt-class-status-container');
        if (statusContainer) {
            statusContainer.style.display = 'block';
            statusContainer.innerHTML = '<div class="status-unpaid" style="padding: 5px 10px; display: inline-block;">Lớp đã đóng</div>';
        }
    }
    
    // Hiển thị thông tin điểm danh
    try {
        // Hiển thị điểm danh tổng hợp
        displayAttendanceSummary(student.id);
        
        // Hiển thị lớp học bù (nếu có)
        displayMakeupClasses(student.id);
        
        // Hiển thị lịch sử điểm danh
        displayAttendanceHistory(student.id);
        
        // Hiển thị lịch sử thanh toán
        displayPaymentHistory(student.id, payment.id);
    } catch (error) {
        console.error("Lỗi khi hiển thị thông tin bổ sung:", error);
    }
    
    // Hiển thị QR code thanh toán
    try {
        const qrContainer = document.getElementById('receipt-qr-code');
        if (qrContainer) {
            qrContainer.innerHTML = '';
            generatePaymentQRCode(student.id, payment.amount);
        }
    } catch (error) {
        console.error("Lỗi khi tạo mã QR:", error);
    }
    
    // Hiển thị ngày trên chữ ký
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    document.getElementById('receipt-signature-date').textContent = `${day}/${month}/${year}`;
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Lưu biên nhận thành hình ảnh
function saveReceiptAsImage() {
    const receiptContent = document.querySelector('.receipt-content');
    if (!receiptContent) return;
    
    // Sử dụng html2canvas để chuyển đổi DOM thành canvas
    html2canvas(receiptContent).then(canvas => {
        // Tạo URL từ canvas
        const imageUrl = canvas.toDataURL('image/png');
        
        // Tạo một thẻ a để tải xuống
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'receipt.png';
        downloadLink.click();
    }).catch(error => {
        console.error("Lỗi khi tạo hình ảnh:", error);
        alert("Không thể tạo hình ảnh. Vui lòng thử lại sau.");
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