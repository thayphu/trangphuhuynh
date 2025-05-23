/**
 * Quản lý học phí
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Trang đã tải xong, khởi tạo chức năng học phí...");
    
    // Thiết lập tabs cho màn hình thanh toán
    setupTuitionTabs();
    
    // Kiểm tra phần tử
    setTimeout(() => {
        console.log("Kiểm tra các phần tử bảng:");
        checkElementStatus('#unpaid-students');
        checkElementStatus('#unpaid-students-table-body');
        checkElementStatus('#payment-history');
        checkElementStatus('#payments-table-body');
        
        // Hiển thị danh sách học sinh chưa thanh toán (mặc định)
        displayUnpaidStudents();
        
        // Hiển thị danh sách thanh toán ở tab lịch sử
        displayPaymentHistory();
    }, 500);
    
    // Cập nhật danh sách học sinh trong select box
    updateStudentSelectOptions();
    
    // Xử lý sự kiện thêm thanh toán
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', openAddPaymentModal);
    }
    
    // Xử lý sự kiện khi chọn học sinh trong form thanh toán
    const paymentStudent = document.getElementById('payment-student');
    if (paymentStudent) {
        paymentStudent.addEventListener('change', function() {
            const studentId = this.value;
            const student = getStudentById(studentId);
            
            if (student) {
                // Đặt chu kỳ thanh toán dựa vào học sinh
                document.getElementById('payment-cycle').value = student.paymentCycle;
                
                // Tính toán học phí
                const classData = getClassById(student.classId);
                if (classData) {
                    let amount = classData.fee;
                    
                    // Tính toán học phí dựa vào chu kỳ
                    if (student.paymentCycle === '8 buổi') {
                        amount = classData.fee * 8;
                    } else if (student.paymentCycle === '10 buổi') {
                        amount = classData.fee * 10;
                    } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
                        amount = classData.fee;
                    }
                    
                    document.getElementById('payment-amount').value = amount;
                }
            }
        });
    }
    
    // Xử lý form thêm thanh toán
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', handleAddPayment);
    }
    
    // Xử lý tìm kiếm thanh toán
    const paymentSearch = document.getElementById('payment-search');
    if (paymentSearch) {
        paymentSearch.addEventListener('input', filterPayments);
    }
    
    // Cập nhật select lớp học trong bộ lọc
    const classFilter = document.getElementById('payment-class-filter');
    if (classFilter) {
        const classes = getClasses();
        
        classes.forEach(classData => {
            const option = document.createElement('option');
            option.value = classData.id;
            option.textContent = classData.name;
            classFilter.appendChild(option);
        });
        
        classFilter.addEventListener('change', filterPayments);
    }
    
    // Xử lý lọc theo ngày
    const paymentDateFilter = document.getElementById('payment-date-filter');
    if (paymentDateFilter) {
        paymentDateFilter.addEventListener('change', filterPayments);
    }
    
    // Xử lý nút xóa bộ lọc
    const clearPaymentFilter = document.getElementById('clear-payment-filter');
    if (clearPaymentFilter) {
        clearPaymentFilter.addEventListener('click', clearPaymentFilters);
    }
    
    // Xử lý các nút trong modal biên nhận
    const saveReceiptImage = document.getElementById('save-receipt-image');
    if (saveReceiptImage) {
        saveReceiptImage.addEventListener('click', saveReceiptAsImage);
    }
    
    const saveReceiptPdf = document.getElementById('save-receipt-pdf');
    if (saveReceiptPdf) {
        saveReceiptPdf.addEventListener('click', saveReceiptAsPdf);
    }
});

// Thiết lập tabs cho quản lý học phí
function setupTuitionTabs() {
    console.log("Thiết lập tabs cho quản lý học phí");
    const tabButtons = document.querySelectorAll('.payment-tab-button');
    console.log("Số lượng tab button:", tabButtons.length);
    const tabContents = document.querySelectorAll('.payment-tab-content');
    console.log("Số lượng tab content:", tabContents.length);
    
    tabButtons.forEach((button, index) => {
        console.log(`Tab button ${index+1}:`, button.dataset.tab);
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            console.log("Đã click tab:", tabId);
            
            // Xóa active class từ tất cả các tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Thêm active class cho tab được chọn
            this.classList.add('active');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Nếu tab là học sinh chưa thanh toán, hiển thị danh sách học sinh chưa thanh toán
                if (tabId === 'unpaid-students') {
                    setTimeout(() => displayUnpaidStudents(), 100);
                } 
                // Nếu tab là lịch sử thanh toán, hiển thị danh sách thanh toán
                else if (tabId === 'payment-history') {
                    setTimeout(() => displayPaymentHistory(), 100);
                }
            } else {
                console.error(`Không tìm thấy phần tử có ID: ${tabId}`);
            }
        });
    });
}

// Hiển thị danh sách thanh toán (hàm tương thích ngược)
function displayPayments(filteredPayments = null) {
    // Hiển thị lịch sử thanh toán
    displayPaymentHistory(filteredPayments);
    
    // Hiển thị danh sách học sinh chưa thanh toán
    displayUnpaidStudents();
    
    // Thiết lập tab mặc định (nếu chưa có tab nào được chọn)
    const tabButtons = document.querySelectorAll('.payment-tabs-container .payment-tab-button');
    if (tabButtons.length > 0 && !document.querySelector('.payment-tab-button.active')) {
        tabButtons[0].classList.add('active');
        const defaultTabId = tabButtons[0].dataset.tab;
        if (defaultTabId) {
            document.getElementById(defaultTabId).classList.add('active');
        }
    }
}

// Hiển thị danh sách học sinh chưa thanh toán
function displayUnpaidStudents() {
    console.log("Đang hiển thị học sinh chưa thanh toán...");
    
    // Tìm thẻ tbody cho danh sách học sinh chưa thanh toán
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
        
        console.log("Đã tạo lại cấu trúc HTML cho danh sách học sinh chưa thanh toán");
    }
    
    unpaidStudentsTableBody.innerHTML = '';
    
    // Lấy tất cả học sinh
    const students = getStudents();
    console.log("Tổng số học sinh:", students.length);
    
    // Lọc học sinh chưa thanh toán
    const unpaidStudents = students.filter(student => {
        const paymentStatus = checkPaymentStatus(student);
        console.log(`Học sinh ${student.id}: ${student.name}, trạng thái: ${paymentStatus}`);
        return paymentStatus === 'unpaid' || paymentStatus === 'overdue';
    });
    
    console.log("Số học sinh chưa thanh toán:", unpaidStudents.length);
    
    if (unpaidStudents.length === 0) {
        unpaidStudentsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">Không có học sinh nào cần thanh toán.</td>
            </tr>
        `;
        return;
    }
    
    unpaidStudents.forEach(student => {
        const classData = getClassById(student.classId);
        if (!classData) return;
        
        // Tính toán học phí
        let totalFee = classData.fee;
        
        if (student.paymentCycle === '8 buổi') {
            totalFee = classData.fee * 8;
        } else if (student.paymentCycle === '10 buổi') {
            totalFee = classData.fee * 10;
        }
        
        // Tính hạn thanh toán
        const paymentStatus = checkPaymentStatus(student);
        const dueDate = calculateNextPaymentDate(student.registerDate, student.paymentCycle);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${classData.name}</td>
            <td>${formatDate(student.registerDate)}</td>
            <td><span class="fee-highlight">${formatCurrency(totalFee)} VND</span></td>
            <td>${student.paymentCycle}</td>
            <td>${formatDate(dueDate)}</td>
            <td>
                <button class="btn primary-btn collect-payment-btn" data-id="${student.id}">Thu học phí</button>
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
}

// Hiển thị lịch sử thanh toán
function displayPaymentHistory(filteredPayments = null) {
    console.log("Đang hiển thị lịch sử thanh toán...");
    
    // Cập nhật danh sách lớp trong bộ lọc
    updatePaymentClassFilter();
    
    // Tìm thẻ tbody cho lịch sử thanh toán
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
        payments = [];
    }
    
    if (!payments || payments.length === 0) {
        console.log("Không có dữ liệu thanh toán");
        paymentsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">Chưa có thanh toán nào. Vui lòng thêm thanh toán mới.</td>
            </tr>
        `;
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
        row.innerHTML = `
            <td>${payment.receiptNumber || ''}</td>
            <td>${payment.studentId}</td>
            <td>${student.name}</td>
            <td>${getClassName(student.classId)}</td>
            <td>${formatDate(payment.date)}</td>
            <td><span class="fee-highlight">${formatCurrency(payment.amount)} VND</span></td>
            <td>${payment.cycle}</td>
            <td>${payment.method}</td>
            <td class="action-buttons">
                <button class="view-receipt-btn btn-icon" data-id="${payment.id}" title="Xem biên nhận"><i class="fas fa-eye"></i></button>
                <button class="edit-receipt-btn btn-icon" data-id="${payment.id}" title="Sửa biên nhận"><i class="fas fa-edit"></i></button>
                <button class="delete-payment-btn btn-icon" data-id="${payment.id}" title="Xóa biên nhận"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        
        paymentsTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút
    attachPaymentButtonEvents();
}

// Gắn sự kiện cho các nút trong bảng thanh toán
function attachPaymentButtonEvents() {
    // Gắn sự kiện cho nút xem biên nhận
    const viewButtons = document.querySelectorAll('.view-receipt-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            openReceiptModal(paymentId);
        });
    });
    
    // Gắn sự kiện cho nút sửa biên nhận
    const editButtons = document.querySelectorAll('.edit-receipt-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            // Mở form chỉnh sửa biên nhận (dùng lại form thêm thanh toán)
            openEditPaymentModal(paymentId);
        });
    });
    
    // Gắn sự kiện cho nút xóa
    const deleteButtons = document.querySelectorAll('.delete-payment-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.dataset.id;
            deletePayment(paymentId);
        });
    });
    
    // Gắn sự kiện cho nút thu học phí trong tab học sinh chưa thanh toán
    document.querySelectorAll('.collect-payment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.id;
            openAddPaymentModal(studentId);
        });
    });
}

// Mở modal thêm thanh toán
function openAddPaymentModal(studentId = null) {
    const modal = document.getElementById('add-payment-modal');
    if (!modal) return;
    
    // Reset form
    document.getElementById('add-payment-form').reset();
    
    // Tạo mã biên nhận
    const receiptNumber = generateReceiptNumber();
    document.getElementById('payment-receipt-number').value = receiptNumber;
    
    // Điền ngày thanh toán mặc định (hôm nay)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
    
    // Nếu có studentId được truyền vào (từ nút Thu học phí)
    if (studentId) {
        const studentSelect = document.getElementById('payment-student');
        if (studentSelect) {
            // Lấy thông tin học sinh
            const student = getStudentById(studentId);
            if (student) {
                // Cập nhật tiêu đề modal
                document.getElementById('payment-modal-title').textContent = `Thu học phí cho ${student.name}`;
                
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
        }
    } else {
        // Reset tiêu đề modal và làm mới danh sách học sinh
        document.getElementById('payment-modal-title').textContent = "Thêm thanh toán học phí";
        
        // Kích hoạt select học sinh
        const studentSelect = document.getElementById('payment-student');
        if (studentSelect) {
            studentSelect.disabled = false;
            
            // Làm mới danh sách học sinh nếu là thêm mới
            updateStudentSelectOptions();
        }
    }
    
    // Cấu hình các tab trong form thanh toán
    setupPaymentTabs();
    
    // Cấu hình các trường bổ sung
    setupAdditionalFields();
    
    // Xử lý thông tin học sinh
    setTimeout(() => {
        updateStudentPaymentInfo(studentId);
        
        // Cập nhật hiển thị tổng học phí
        // Cập nhật tổng học phí trên giao diện
        const student = getStudentById(studentId);
        if (student) {
            const classData = getClassById(student.classId);
            if (classData) {
                let baseAmount = 0;
                
                if (student.paymentCycle === '8 buổi') {
                    // Với chu kỳ 8 buổi, học phí/buổi × 8
                    baseAmount = classData.fee * 8;
                } else if (student.paymentCycle === '10 buổi') {
                    // Với chu kỳ 10 buổi, học phí/buổi × 10
                    baseAmount = classData.fee * 10;
                } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
                    baseAmount = classData.fee;
                }
                
                // Cập nhật trường dữ liệu ẩn
                document.getElementById('payment-amount').value = baseAmount;
                
                // Cập nhật hiển thị TỔNG CỘNG trong form
                const tongCongElement = document.querySelector('.payment-form .tong-cong');
                if (tongCongElement) {
                    tongCongElement.innerHTML = `<strong>TỔNG CỘNG:</strong> <span class="total-amount">${formatCurrency(baseAmount)} VND</span>`;
                } else {
                    console.error("Không tìm thấy phần tử hiển thị tổng cộng trong form");
                }
                
                // Tính lại tổng thanh toán để cập nhật các trường liên quan
                setTimeout(() => calculateTotalPayment(), 100);
            }
        }
    }, 200);
    
    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Thiết lập các tab trong form thanh toán
function setupPaymentTabs() {
    const tabButtons = document.querySelectorAll('.payment-tab-button');
    const tabContents = document.querySelectorAll('.payment-tab-content');
    
    tabButtons.forEach(button => {
        // Xóa event listener cũ nếu có
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

// Thiết lập các trường bổ sung (hiện/ẩn các ô nhập "khác")
function setupAdditionalFields() {
    // Diễn giải chi phí bổ sung
    const additionalReason = document.getElementById('payment-additional-reason');
    if (additionalReason) {
        // Xóa event listener cũ nếu có
        const newSelect = additionalReason.cloneNode(true);
        additionalReason.parentNode.replaceChild(newSelect, additionalReason);
        
        // Thêm event listener mới
        newSelect.addEventListener('change', function() {
            const otherContainer = document.getElementById('payment-additional-other-container');
            if (this.value === 'Khác') {
                otherContainer.style.display = 'block';
            } else {
                otherContainer.style.display = 'none';
            }
            
            // Tính lại tổng thanh toán
            calculateTotalPayment();
        });
    }
    
    // Lý do khấu trừ
    const discountReason = document.getElementById('payment-discount-reason');
    if (discountReason) {
        // Xóa event listener cũ nếu có
        const newSelect = discountReason.cloneNode(true);
        discountReason.parentNode.replaceChild(newSelect, discountReason);
        
        // Thêm event listener mới
        newSelect.addEventListener('change', function() {
            const otherContainer = document.getElementById('payment-discount-other-container');
            if (this.value === 'Khác') {
                otherContainer.style.display = 'block';
            } else {
                otherContainer.style.display = 'none';
            }
            
            // Tính lại tổng thanh toán
            calculateTotalPayment();
        });
    }
    
    // Xử lý sự kiện thay đổi chi phí bổ sung
    const additionalFee = document.getElementById('payment-additional-fee');
    if (additionalFee) {
        additionalFee.addEventListener('input', calculateTotalPayment);
    }
    
    // Xử lý sự kiện thay đổi khấu trừ
    const discount = document.getElementById('payment-discount');
    if (discount) {
        discount.addEventListener('input', calculateTotalPayment);
    }
    
    // Xử lý sự kiện thay đổi học phí linh hoạt
    const flexibleAmount = document.getElementById('payment-flexible-amount');
    if (flexibleAmount) {
        flexibleAmount.addEventListener('input', function() {
            calculateFlexibleSessions();
            calculateTotalPayment();
        });
    }
}

// Cập nhật thông tin học sinh trong form thanh toán
function updateStudentPaymentInfo(studentId = null) {
    // Xử lý thông tin học sinh
    const studentSelect = document.getElementById('payment-student');
    if (studentSelect) {
        // Xóa event listener cũ nếu có
        const newElement = studentSelect.cloneNode(true);
        studentSelect.parentNode.replaceChild(newElement, studentSelect);
        
        // Cập nhật thông tin học sinh hiện tại
        const selectedId = studentId || newElement.value;
        if (selectedId) {
            // Cập nhật thông tin chi tiết học sinh
            setTimeout(() => {
                updateStudentDetails(selectedId);
            }, 100);
        }
        
        // Thêm event listener mới cho việc thay đổi học sinh
        newElement.addEventListener('change', function() {
            const selectedStudentId = this.value;
            if (selectedStudentId) {
                updateStudentDetails(selectedStudentId);
            }
        });
    }
    
    // Xử lý chu kỳ thanh toán
    const cycleSelect = document.getElementById('payment-cycle');
    if (cycleSelect) {
        // Xóa event listener cũ nếu có
        const newCycleElement = cycleSelect.cloneNode(true);
        cycleSelect.parentNode.replaceChild(newCycleElement, cycleSelect);
        
        // Thêm event listener mới cho việc thay đổi chu kỳ
        newCycleElement.addEventListener('change', function() {
            // Tính lại học phí khi chu kỳ thay đổi
            calculateBaseAmount();
            
            // Tính lại tổng thanh toán
            calculateTotalPayment();
        });
    }
}

// Cập nhật chi tiết học sinh khi chọn học sinh
function updateStudentDetails(studentId) {
    if (!studentId) return;
    
    const student = getStudentById(studentId);
    if (!student) {
        console.error("Không tìm thấy thông tin học sinh:", studentId);
        return;
    }
    
    console.log("Cập nhật thông tin học sinh:", student.name);
    
    // Cập nhật mã học sinh
    document.getElementById('payment-student-id').value = student.id;
    
    // Cập nhật tên lớp học
    const classData = getClassById(student.classId);
    if (!classData) {
        console.error("Không tìm thấy thông tin lớp học cho học sinh:", student.name);
        return;
    }
    
    console.log("Lớp học:", classData.name, "- Học phí:", classData.fee);
    document.getElementById('payment-class').value = classData.name;
    
    // Cập nhật chu kỳ thanh toán
    const cycleSelect = document.getElementById('payment-cycle');
    if (cycleSelect) {
        // Xóa tất cả các option hiện tại
        cycleSelect.innerHTML = '';
        
        // Tạo và thêm option cho chu kỳ thanh toán của học sinh
        const option = document.createElement('option');
        option.value = student.paymentCycle;
        option.text = student.paymentCycle;
        cycleSelect.add(option);
        cycleSelect.value = student.paymentCycle;
        
        // Làm cho select không thể thay đổi
        cycleSelect.disabled = true;
    }
    
    // Tính và hiển thị số tiền cần thanh toán dựa trên chu kỳ và lớp học
    let baseAmount = 0;
    
    if (student.paymentCycle === '8 buổi') {
        baseAmount = classData.fee * 8;
    } else if (student.paymentCycle === '10 buổi') {
        baseAmount = classData.fee * 10;
    } else if (student.paymentCycle === '1 tháng' || student.paymentCycle === 'Theo ngày') {
        baseAmount = classData.fee;
    }
    
    console.log("Học phí cơ bản:", baseAmount, "dựa trên chu kỳ:", student.paymentCycle);
    
    // Cập nhật học phí cơ bản và tổng học phí
    document.getElementById('payment-base-amount').value = baseAmount;
    document.getElementById('payment-amount').value = baseAmount;
    
    // Cập nhật tổng học phí trên giao diện
    const totalElement = document.querySelector('.total-amount');
    if (totalElement) {
        totalElement.textContent = baseAmount.toLocaleString('vi-VN');
    }
}

// Tính học phí cơ bản dựa vào chu kỳ và lớp học
function calculateBaseAmount() {
    const studentSelect = document.getElementById('payment-student');
    if (!studentSelect || !studentSelect.value) return;
    
    const student = getStudentById(studentSelect.value);
    if (!student) return;
    
    const classData = getClassById(student.classId);
    if (!classData) return;
    
    const selectedCycle = document.getElementById('payment-cycle').value;
    let amount = classData.fee;
    
    // Tính học phí dựa vào chu kỳ đã chọn
    if (selectedCycle === '8 buổi') {
        amount = classData.fee * 8;
    } else if (selectedCycle === '10 buổi') {
        amount = classData.fee * 10;
    } else if (selectedCycle === '1 tháng' || selectedCycle === 'Theo ngày') {
        amount = classData.fee;
    }
    
    // Cập nhật học phí cơ bản
    document.getElementById('payment-base-amount').value = amount;
    
    // Cập nhật tổng số tiền thanh toán
    document.getElementById('payment-amount').value = amount;
    
    return amount;
}

// Tính số buổi tương ứng với số tiền đóng trước
function calculateFlexibleSessions() {
    const flexibleAmount = parseInt(document.getElementById('payment-flexible-amount').value) || 0;
    const studentSelect = document.getElementById('payment-student');
    if (!flexibleAmount || !studentSelect || !studentSelect.value) {
        document.getElementById('payment-flexible-sessions').value = 0;
        return 0;
    }
    
    const student = getStudentById(studentSelect.value);
    if (!student) {
        document.getElementById('payment-flexible-sessions').value = 0;
        return 0;
    }
    
    const classData = getClassById(student.classId);
    if (!classData || !classData.fee) {
        document.getElementById('payment-flexible-sessions').value = 0;
        return 0;
    }
    
    // Tính số buổi = số tiền đóng trước / học phí 1 buổi
    const perSessionFee = classData.fee;
    const sessions = Math.floor(flexibleAmount / perSessionFee);
    
    document.getElementById('payment-flexible-sessions').value = sessions;
    return sessions;
}

// Tính tổng số tiền thanh toán
function calculateTotalPayment() {
    // Học phí cơ bản
    const baseAmount = parseInt(document.getElementById('payment-base-amount').value) || 0;
    
    // Chi phí bổ sung
    const additionalFee = parseInt(document.getElementById('payment-additional-fee').value) || 0;
    
    // Khấu trừ
    const discount = parseInt(document.getElementById('payment-discount').value) || 0;
    
    // Học phí linh hoạt
    const flexibleAmount = parseInt(document.getElementById('payment-flexible-amount').value) || 0;
    
    // Tính tổng cộng = Học phí cơ bản + Chi phí bổ sung + Học phí linh hoạt - Khấu trừ
    const totalAmount = baseAmount + additionalFee + flexibleAmount - discount;
    
    // Cập nhật tổng số tiền trong trường ẩn
    document.getElementById('payment-amount').value = totalAmount;
    
    // Cập nhật hiển thị tổng cộng với định dạng tiền tệ
    const totalElement = document.querySelector('.total-amount');
    if (totalElement) {
        totalElement.textContent = formatCurrency(totalAmount);
    } else {
        console.error("Không tìm thấy phần tử .total-amount để hiển thị tổng tiền");
    }
    
    return totalAmount;
}

// Xử lý thêm thanh toán mới
function handleAddPayment(event) {
    event.preventDefault();
    
    // Lấy thông tin cơ bản từ form
    const studentId = document.getElementById('payment-student').value;
    if (!studentId) {
        alert('Vui lòng chọn học sinh!');
        return;
    }
    
    const amount = parseInt(document.getElementById('payment-amount').value);
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ!');
        return;
    }
    
    const date = document.getElementById('payment-date').value;
    if (!date) {
        alert('Vui lòng chọn ngày thanh toán!');
        return;
    }
    
    const cycle = document.getElementById('payment-cycle').value;
    let method = document.getElementById('payment-method').value;
    
    // Áp dụng định dạng viết hoa cho phương thức thanh toán
    if (window.TextFormatter && method) {
        method = window.TextFormatter.toTitleCase(method);
        document.getElementById('payment-method').value = method;
    }
    const receiptNumber = document.getElementById('payment-receipt-number').value || generateReceiptNumber();
    
    // Lấy thông tin về chi phí bổ sung
    const baseAmount = parseInt(document.getElementById('payment-base-amount').value) || 0;
    const additionalFee = parseInt(document.getElementById('payment-additional-fee').value) || 0;
    const additionalReason = document.getElementById('payment-additional-reason').value;
    const additionalOther = document.getElementById('payment-additional-other').value;
    
    // Lấy thông tin về khấu trừ
    const discount = parseInt(document.getElementById('payment-discount').value) || 0;
    const discountReason = document.getElementById('payment-discount-reason').value;
    const discountOther = document.getElementById('payment-discount-other').value;
    
    // Lấy thông tin về học phí linh hoạt
    const flexibleAmount = parseInt(document.getElementById('payment-flexible-amount').value) || 0;
    const flexibleSessions = parseInt(document.getElementById('payment-flexible-sessions').value) || 0;
    
    // Kiểm tra tab nào đang active
    const isAdditionalFeeActive = document.getElementById('additional-fee').classList.contains('active');
    
    // Chắc chắn StudentId tồn tại
    const student = getStudentById(studentId);
    if (!student) {
        alert('Không tìm thấy thông tin học sinh!');
        return;
    }
    
    // Tính ngày thanh toán tiếp theo dựa vào chu kỳ và lịch học của học sinh
    let nextPaymentDate;
    try {
        console.log(`Tính ngày thanh toán tiếp theo cho học sinh ${studentId} với chu kỳ ${cycle}`);
        // Sử dụng hàm từ utils.js để tính ngày thanh toán tiếp theo
        nextPaymentDate = calculateNextPaymentDate(date, cycle, studentId, flexibleSessions);
        console.log(`Ngày thanh toán tiếp theo đã tính: ${nextPaymentDate}`);
    } catch (error) {
        console.error("Lỗi khi tính ngày thanh toán tiếp theo:", error);
        // Tính toán mặc định nếu có lỗi
        const defaultDate = new Date(date);
        if (cycle === '1 tháng') {
            defaultDate.setMonth(defaultDate.getMonth() + 1);
        } else if (cycle === '8 buổi') {
            defaultDate.setDate(defaultDate.getDate() + 28); // Ước tính 4 tuần
        } else if (cycle === '10 buổi') {
            defaultDate.setDate(defaultDate.getDate() + 35); // Ước tính 5 tuần
        } else {
            defaultDate.setDate(defaultDate.getDate() + 7); // Mặc định 1 tuần
        }
        nextPaymentDate = defaultDate.toISOString().split('T')[0];
    }
    
    // Tạo đối tượng thanh toán mới
    const newPayment = {
        id: generateId('payment', 5),
        receiptNumber,
        studentId,
        amount,
        date,
        cycle,
        method,
        nextPaymentDate,  // Thêm ngày thanh toán tiếp theo
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
    payments.push(newPayment);
    
    // Lưu vào localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Đóng modal
    document.getElementById('add-payment-modal').classList.add('hidden');
    
    // Hiển thị lại danh sách thanh toán
    displayPayments();
    
    // Hiển thị thông báo thành công
    showNotification('Thanh toán học phí thành công', 'success');
    
    // Mở modal biên nhận
    openReceiptModal(newPayment.id);
}

// Xóa thanh toán
function deletePayment(paymentId) {
    // Lấy thông tin thanh toán để hiển thị trong hộp thoại xác nhận
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        showNotification('Không tìm thấy biên nhận', 'error');
        return;
    }
    
    // Lấy thông tin học sinh để hiển thị trong xác nhận
    const student = getStudentById(payment.studentId);
    if (!student) {
        showNotification('Không tìm thấy thông tin học sinh', 'error');
        return;
    }
    
    // Hiển thị hộp thoại xác nhận
    const confirmMessage = `Bạn có chắc chắn muốn xóa biên nhận ${payment.receiptNumber} của học sinh ${student.name}?\nSố tiền: ${formatCurrency(payment.amount)} VND\nNgày: ${formatDate(payment.date)}`;
    
    if (confirm(confirmMessage)) {
        // Người dùng đã xác nhận xóa
        // Lấy danh sách thanh toán hiện tại
        let updatedPayments = getPayments();
        
        // Lọc bỏ thanh toán cần xóa
        updatedPayments = updatedPayments.filter(p => p.id !== paymentId);
        
        // Lưu vào localStorage
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
        
        // Hiển thị lại danh sách thanh toán
        displayPayments();
        
        // Hiển thị thông báo xóa thành công
        showNotification('Đã xóa biên nhận thành công', 'success');
    }
}

// Lọc thanh toán theo tìm kiếm và bộ lọc
// Cập nhật danh sách lớp học trong bộ lọc thanh toán
function updatePaymentClassFilter() {
    // Lấy tất cả các lớp học hiện có
    const classes = getClasses();
    if (!classes || classes.length === 0) return;
    
    // Tìm select filter cho lớp học
    const classFilter = document.getElementById('payment-class-filter');
    if (!classFilter) {
        console.error("Không tìm thấy bộ lọc lớp học (payment-class-filter)");
        return;
    }
    
    // Xóa các option hiện tại ngoại trừ option mặc định
    while (classFilter.options.length > 1) {
        classFilter.remove(1);
    }
    
    // Thêm danh sách lớp vào select
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classFilter.appendChild(option);
    });
    
    console.log(`Đã cập nhật ${classes.length} lớp học vào bộ lọc thanh toán`);
}

function filterPayments() {
    const searchTerm = document.getElementById('payment-search').value.toLowerCase();
    const classFilter = document.getElementById('payment-class-filter').value;
    const dateFilter = document.getElementById('payment-date-filter').value;
    
    // Cập nhật danh sách lớp nếu chưa có
    if (document.getElementById('payment-class-filter').options.length <= 1) {
        updatePaymentClassFilter();
    }
    
    let filteredPayments = getPayments();
    
    // Lọc theo tìm kiếm
    if (searchTerm) {
        filteredPayments = filteredPayments.filter(payment => {
            const student = getStudentById(payment.studentId);
            if (!student) return false;
            
            return payment.studentId.toLowerCase().includes(searchTerm) || 
                  student.name.toLowerCase().includes(searchTerm) ||
                  (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(searchTerm));
        });
    }
    
    // Lọc theo lớp
    if (classFilter) {
        filteredPayments = filteredPayments.filter(payment => {
            const student = getStudentById(payment.studentId);
            return student && student.classId === classFilter;
        });
    }
    
    // Lọc theo ngày
    if (dateFilter) {
        filteredPayments = filteredPayments.filter(payment => 
            payment.date === dateFilter
        );
    }
    
    // Hiển thị kết quả lọc trong tab lịch sử thanh toán
    displayPaymentHistory(filteredPayments);
    
    // Chuyển sang tab lịch sử thanh toán nếu đang thực hiện tìm kiếm
    if (searchTerm || classFilter || dateFilter) {
        const tabButtons = document.querySelectorAll('.payment-tabs-container .payment-tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === 'payment-history') {
                // Kích hoạt tab lịch sử thanh toán
                button.click();
            }
        });
    }
}

// Xóa bộ lọc thanh toán
function clearPaymentFilters() {
    document.getElementById('payment-search').value = '';
    document.getElementById('payment-class-filter').value = '';
    document.getElementById('payment-date-filter').value = '';
    
    // Hiển thị lại tất cả thanh toán
    displayPaymentHistory();
}

// Mở modal biên nhận
function openReceiptModal(paymentId) {
    console.log("Mở biên nhận cho thanh toán ID:", paymentId);
    
    const modal = document.getElementById('receipt-modal');
    if (!modal) {
        console.error("Không tìm thấy modal biên nhận (#receipt-modal)");
        alert("Không thể hiển thị biên nhận. Vui lòng liên hệ hỗ trợ kỹ thuật.");
        return;
    }
    
    const payments = getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        console.error("Không tìm thấy thông tin thanh toán với ID:", paymentId);
        alert("Không tìm thấy thông tin biên nhận.");
        return;
    }
    
    const student = getStudentById(payment.studentId);
    if (!student) {
        console.error("Không tìm thấy thông tin học sinh:", payment.studentId);
        alert("Không tìm thấy thông tin học sinh.");
        return;
    }
    
    const classData = getClassById(student.classId);
    if (!classData) {
        console.error("Không tìm thấy thông tin lớp học:", student.classId);
        alert("Không tìm thấy thông tin lớp học.");
        return;
    }
    
    // Điền thông tin cơ bản vào biên nhận
    document.getElementById('receipt-no').textContent = payment.receiptNumber;
    
    // Sử dụng tổng số tiền thực tế đã thanh toán
    const displayAmount = payment.amount;
    
    // Hiển thị tổng số tiền đã thanh toán thực tế
    document.getElementById('receipt-amount').textContent = formatCurrency(displayAmount);
    
    // Hiển thị số tiền bằng chữ với cơ chế bảo vệ lỗi
    try {
        document.getElementById('receipt-amount-text').textContent = numberToWords(displayAmount);
    } catch (error) {
        console.error("Lỗi khi chuyển đổi số thành chữ:", error);
        document.getElementById('receipt-amount-text').textContent = "Số tiền bằng chữ";
    }
    document.getElementById('receipt-student-name').textContent = student.name;
    document.getElementById('receipt-student-id').textContent = student.id;
    document.getElementById('receipt-class').textContent = classData.name;
    document.getElementById('receipt-payment-cycle').textContent = payment.cycle;
    
    // Hiển thị lịch học ngắn gọn đi kèm với tên lớp
    if (classData.schedule && classData.schedule.length > 0) {
        document.getElementById('receipt-schedule-short').textContent = formatSchedule(classData.schedule);
    } else {
        document.getElementById('receipt-schedule-short').textContent = "Không có lịch";
    }
    
    // Thêm ngày đăng ký
    if (student.registerDate) {
        document.getElementById('receipt-register-date').textContent = formatDate(student.registerDate);
    } else {
        document.getElementById('receipt-register-date').textContent = "Không có thông tin";
    }
    
    // Hiển thị thông tin học phí cơ bản
    const perSessionFee = classData.fee;
    let totalBaseFee = perSessionFee;
    
    // Tính tổng học phí cơ bản dựa trên chu kỳ
    if (payment.cycle === '8 buổi') {
        totalBaseFee = perSessionFee * 8;
    } else if (payment.cycle === '10 buổi') {
        totalBaseFee = perSessionFee * 10;
    }
    
    document.getElementById('receipt-per-session-fee').textContent = formatCurrency(perSessionFee);
    document.getElementById('receipt-total-fee').textContent = formatCurrency(totalBaseFee);
    
    // Xử lý hiển thị ngày thanh toán tiếp theo hoặc thông báo lớp đã khóa
    const nextPaymentElement = document.getElementById('receipt-next-payment');

    // Kiểm tra xem lớp học có bị khóa hay không
    if (classData.locked) {
        // Nếu lớp đã khóa, hiển thị thông báo đặc biệt
        console.log("Lớp học đã bị khóa, không hiển thị chu kỳ thanh toán tiếp theo");
        nextPaymentElement.textContent = "Lớp đã đóng";
        nextPaymentElement.style.backgroundColor = "#dc3545"; // Màu nền đỏ
        nextPaymentElement.style.color = "white"; // Chữ màu trắng
        nextPaymentElement.style.padding = "2px 5px";
        nextPaymentElement.style.borderRadius = "3px";
        nextPaymentElement.style.fontWeight = "bold";
    } else {
        // Nếu lớp không bị khóa, tính toán và hiển thị ngày thanh toán tiếp theo như thường lệ
        nextPaymentElement.style.backgroundColor = ""; // Xóa định dạng đặc biệt nếu có
        nextPaymentElement.style.color = "";
        nextPaymentElement.style.padding = "";
        nextPaymentElement.style.borderRadius = "";
        nextPaymentElement.style.fontWeight = "";
        
        try {
            // Sử dụng ngày thanh toán tiếp theo đã được tính trước
            if (payment.nextPaymentDate) {
                console.log(`Ngày thanh toán tiếp theo (từ dữ liệu): ${payment.nextPaymentDate}`);
                nextPaymentElement.textContent = formatDate(payment.nextPaymentDate);
            } else {
                // Nếu không có sẵn, tính lại ngày thanh toán tiếp theo
                console.log("Tính lại ngày thanh toán tiếp theo");
                const extraSessions = payment.details && payment.details.flexibleSessions ? payment.details.flexibleSessions : 0;
                const nextPaymentDate = calculateNextPaymentDate(payment.date, payment.cycle, payment.studentId, extraSessions);
                console.log(`Ngày thanh toán tiếp theo (đã tính): ${nextPaymentDate}`);
                nextPaymentElement.textContent = formatDate(nextPaymentDate);
            }
        } catch (error) {
            console.error("Lỗi khi tính ngày thanh toán tiếp theo:", error);
            // Nếu có lỗi, hiển thị mặc định
            const defaultDate = new Date(payment.date);
            if (payment.cycle === '1 tháng') {
                defaultDate.setMonth(defaultDate.getMonth() + 1);
            } else if (payment.cycle === '8 buổi') {
                defaultDate.setDate(defaultDate.getDate() + 28);
            } else if (payment.cycle === '10 buổi') {
                defaultDate.setDate(defaultDate.getDate() + 35);
            } else {
                defaultDate.setDate(defaultDate.getDate() + 14);
            }
            nextPaymentElement.textContent = formatDate(defaultDate);
        }
    }
    
    document.getElementById('receipt-payment-method').textContent = payment.method || "Tiền mặt";
    document.getElementById('receipt-date').textContent = formatDate(payment.date);
    
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
    
    // Hiển thị thống kê điểm danh
    displayAttendanceSummary(student.id);
    
    // Hiển thị lịch sử điểm danh
    displayAttendanceHistory(student.id);
    
    // Hiển thị lịch học bù nếu có
    displayMakeupClasses(student.id);
    
    // Hiển thị lịch sử thanh toán
    displayPaymentHistory(student.id, payment.id);
    
    // Hiển thị modal
    modal.classList.remove('hidden');
    console.log("Modal biên nhận đã được hiển thị cho thanh toán ID:", paymentId);
}

// Hiển thị thống kê điểm danh
function displayAttendanceSummary(studentId) {
    const attendanceSummaryContainer = document.getElementById('receipt-attendance-summary');
    const totalSessionsElement = document.getElementById('receipt-total-sessions');
    const presentSessionsElement = document.getElementById('receipt-present-sessions');
    const absentSessionsElement = document.getElementById('receipt-absent-sessions');
    const teacherAbsentElement = document.getElementById('receipt-teacher-absent-sessions');
    
    // Lấy tất cả dữ liệu điểm danh
    const attendanceData = getAttendance();
    
    // Lọc các bản ghi điểm danh của học sinh
    const studentAttendance = attendanceData.filter(record => 
        record.studentId === studentId
    );
    
    if (studentAttendance.length === 0) {
        attendanceSummaryContainer.style.display = 'none';
        return;
    }
    
    // Đếm số buổi theo trạng thái
    const totalSessions = studentAttendance.length;
    const presentSessions = studentAttendance.filter(record => record.status === 'present').length;
    const absentSessions = studentAttendance.filter(record => record.status === 'absent').length;
    const teacherAbsentSessions = studentAttendance.filter(record => record.status === 'teacher-absent').length;
    
    // Cập nhật giao diện
    totalSessionsElement.textContent = totalSessions;
    presentSessionsElement.textContent = presentSessions;
    absentSessionsElement.textContent = absentSessions;
    teacherAbsentElement.textContent = teacherAbsentSessions;
    
    // Hiển thị phần thống kê
    attendanceSummaryContainer.style.display = 'block';
}

// Hiển thị lịch học bù
function displayMakeupClasses(studentId) {
    const makeupContainer = document.getElementById('receipt-makeup-classes');
    const makeupList = document.getElementById('receipt-makeup-list');
    
    // TODO: Triển khai khi có dữ liệu về lịch học bù
    // Tạm thời ẩn đi
    makeupContainer.style.display = 'none';
}

// Hiển thị lịch sử điểm danh trong biên nhận
function displayAttendanceHistory(studentId) {
    const attendanceHistoryContainer = document.getElementById('receipt-attendance-history');
    if (!attendanceHistoryContainer) {
        console.error("Không tìm thấy phần tử receipt-attendance-history");
        return;
    }
    
    console.log("Đang hiển thị lịch sử điểm danh");
    
    // Lấy tất cả bản ghi điểm danh
    const allAttendance = getAttendance();
    console.log("Tổng số bản ghi điểm danh:", allAttendance.length);
    
    // Tạo mảng chứa thông tin điểm danh của học sinh
    const studentAttendance = [];
    
    // Duyệt qua từng bản ghi điểm danh
    allAttendance.forEach(record => {
        console.log(`Bản ghi điểm danh: Lớp=${record.classId}, Ngày=${record.date}`);
        
        // Nếu là điểm danh thông thường (không phải GV vắng)
        if (record.students && Array.isArray(record.students)) {
            console.log("Số học sinh trong bản ghi:", record.students.length);
            
            // Tìm thông tin điểm danh của học sinh cụ thể
            const studentRecord = record.students.find(s => s.id === studentId);
            
            if (studentRecord) {
                console.log(`Thông tin điểm danh: id=${studentRecord.id}, status=${studentRecord.status}`);
                
                // Lấy thông tin học sinh để hiển thị tên
                const student = getStudentById(studentRecord.id);
                if (student) {
                    console.log("Tìm thấy học sinh:", student.name);
                    
                    // Thêm vào danh sách điểm danh của học sinh
                    studentAttendance.push({
                        date: record.date,
                        status: studentRecord.status,
                        className: getClassName(record.classId)
                    });
                }
            }
        }
        
        // Nếu là giáo viên vắng
        if (record.type === 'teacher-absent') {
            // Kiểm tra xem học sinh có thuộc lớp này không
            const student = getStudentById(studentId);
            if (student && student.classId === record.classId) {
                studentAttendance.push({
                    date: record.date,
                    status: 'teacher-absent',
                    className: getClassName(record.classId)
                });
            }
        }
    });
    
    // Hiển thị lịch sử điểm danh
    if (studentAttendance.length === 0) {
        attendanceHistoryContainer.innerHTML = '<p class="no-history">Chưa có lịch sử điểm danh</p>';
        return;
    }
    
    // Sắp xếp theo ngày, mới nhất lên đầu
    studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const attendanceGrid = document.createElement('div');
    attendanceGrid.className = 'attendance-grid';
    
    // Giới hạn hiển thị 5 bản ghi gần nhất
    const recentAttendance = studentAttendance.slice(0, 5);
    console.log("Số bản ghi điểm danh hiển thị:", recentAttendance.length);
    
    recentAttendance.forEach(record => {
        const attendanceItem = document.createElement('div');
        attendanceItem.className = 'attendance-card-small';
        
        let statusText;
        let cardClass;
        
        switch(record.status) {
            case 'present':
                statusText = 'Có mặt';
                cardClass = 'attendance-card-present';
                break;
            case 'absent':
                statusText = 'Vắng mặt';
                cardClass = 'attendance-card-absent';
                break;
            case 'teacher-absent':
                statusText = 'GV nghỉ';
                cardClass = 'attendance-card-teacher-absent';
                break;
            default:
                statusText = 'Không xác định';
                cardClass = '';
        }
        
        attendanceItem.classList.add(cardClass);
        
        attendanceItem.innerHTML = `
            <span class="attendance-date">${formatDate(record.date)}</span> - 
            <span class="attendance-status">${statusText}</span>
        `;
        
        attendanceGrid.appendChild(attendanceItem);
    });
    
    attendanceHistoryContainer.innerHTML = '';
    attendanceHistoryContainer.appendChild(attendanceGrid);
}

// Hiển thị lịch sử thanh toán trong biên nhận
function displayPaymentHistory(studentId, currentPaymentId) {
    const paymentHistoryContainer = document.getElementById('receipt-payment-history');
    if (!paymentHistoryContainer) {
        console.error("Không tìm thấy phần tử receipt-payment-history");
        return;
    }
    
    console.log("Hiển thị lịch sử thanh toán trong biên nhận cho học sinh:", studentId);
    
    if (!studentId) {
        paymentHistoryContainer.innerHTML = '<p class="no-history">Không tìm thấy thông tin học sinh</p>';
        return;
    }
    
    // Lấy dữ liệu thanh toán
    const payments = getPayments();
    console.log("Tổng số thanh toán:", payments.length);
    
    // Lọc theo học sinh và loại trừ thanh toán hiện tại
    const studentPayments = payments
        .filter(payment => payment.studentId === studentId && payment.id !== currentPaymentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("Số thanh toán của học sinh (loại trừ hiện tại):", studentPayments.length);
    
    // Hiển thị lịch sử thanh toán
    if (studentPayments.length === 0) {
        paymentHistoryContainer.innerHTML = '<p class="no-history">Chưa có lịch sử thanh toán trước đây</p>';
        return;
    }
    
    // Tạo bảng nhỏ gọn cho biên nhận
    const table = document.createElement('table');
    table.className = 'receipt-payment-history-table';
    
    // Thêm tiêu đề bảng
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>STT</th>
            <th>Biên nhận</th>
            <th>Ngày</th>
            <th>Số tiền</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Thêm phần thân bảng
    const tbody = document.createElement('tbody');
    
    // Giới hạn hiển thị 3 bản ghi gần nhất
    const recentPayments = studentPayments.slice(0, 3);
    
    recentPayments.forEach((payment, index) => {
        const row = document.createElement('tr');
        
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        
        const receiptCell = document.createElement('td');
        receiptCell.textContent = payment.receiptNumber || '';
        
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(payment.date);
        
        const amountCell = document.createElement('td');
        amountCell.textContent = formatCurrency(payment.amount);
        
        row.appendChild(indexCell);
        row.appendChild(receiptCell);
        row.appendChild(dateCell);
        row.appendChild(amountCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Xóa nội dung cũ và thêm bảng mới
    paymentHistoryContainer.innerHTML = '';
    paymentHistoryContainer.appendChild(table);
}

// Lưu biên nhận thành hình ảnh
function saveReceiptAsImage() {
    const receiptContainer = document.getElementById('receipt-container');
    
    if (receiptContainer) {
        html2canvas(receiptContainer).then(canvas => {
            const link = document.createElement('a');
            link.download = 'bien-nhan.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
}

// Lưu biên nhận thành PDF
function saveReceiptAsPdf() {
    const receiptContainer = document.getElementById('receipt-container');
    
    if (receiptContainer) {
        html2canvas(receiptContainer).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('bien-nhan.pdf');
        });
    }
}
