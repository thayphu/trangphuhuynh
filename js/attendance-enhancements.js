/**
 * Các tính năng nâng cao cho điểm danh
 * Bổ sung chức năng tìm kiếm, lọc và chỉnh sửa dữ liệu
 * 
 * Version: 1.0.0
 * Date: 12-05-2025
 * 
 * -- Tính năng đã thêm --
 * 1. Tìm kiếm với gợi ý cho báo cáo điểm danh
 * 2. Bộ lọc ngày/lớp cho các form trong tab "Báo cáo"
 * 3. Danh sách học sinh có mặt/vắng mặt trong "Thông kê điểm danh"
 * 4. Chức năng sửa/xóa lịch sử điểm danh
 */

// Thiết lập sự kiện tìm kiếm gợi ý
function setupSearchSuggestions(inputId, suggestionsId, data) {
    const searchInput = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    
    if (!searchInput || !suggestionsContainer) {
        console.error(`Không tìm thấy phần tử #${inputId} hoặc #${suggestionsId}`);
        return;
    }
    
    // Xử lý sự kiện khi nhập vào ô tìm kiếm
    searchInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        
        if (value.length < 1) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Tìm các gợi ý phù hợp (không trùng lặp)
        const uniqueSuggestions = Array.from(new Set(
            data.filter(item => 
                item.toLowerCase().includes(value)
            )
        )).slice(0, 5);
        
        if (uniqueSuggestions.length > 0) {
            uniqueSuggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = suggestion;
                div.classList.add('suggestion-item');
                div.addEventListener('click', function() {
                    searchInput.value = suggestion;
                    suggestionsContainer.style.display = 'none';
                    // Kích hoạt sự kiện tìm kiếm
                    if (inputId === 'present-students-search') {
                        filterPresentStudents();
                    } else if (inputId === 'absent-students-search') {
                        filterAbsentStudents();
                    } else if (inputId === 'teacher-absent-search') {
                        filterTeacherAbsentClasses();
                    } else if (inputId === 'attendance-history-search') {
                        filterAttendanceHistory();
                    }
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Ẩn gợi ý khi click bên ngoài
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Hàm lọc lịch sử điểm danh
function filterAttendanceHistory() {
    const searchInput = document.getElementById('attendance-history-search');
    const classFilter = document.getElementById('attendance-history-class-filter');
    const statusFilter = document.getElementById('attendance-history-status-filter');
    const dateFilter = document.getElementById('attendance-history-date-filter');
    const tableBody = document.getElementById('attendance-history-table-body');
    
    if (!tableBody) {
        console.error("Không tìm thấy phần tử #attendance-history-table-body");
        return;
    }
    
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    const classValue = classFilter ? classFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const dateValue = dateFilter ? dateFilter.value : '';
    
    // Lấy dữ liệu từ localStorage
    const attendanceData = JSON.parse(localStorage.getItem('attendanceHistoryData') || '[]');
    
    // Lọc dữ liệu
    const filteredData = attendanceData.filter(item => {
        const matchesSearch = !searchValue || 
            item.studentName.toLowerCase().includes(searchValue) || 
            item.className.toLowerCase().includes(searchValue);
        const matchesClass = !classValue || item.classId === classValue;
        const matchesStatus = !statusValue || item.statusCode === statusValue;
        const matchesDate = !dateValue || item.date === dateValue;
        
        return matchesSearch && matchesClass && matchesStatus && matchesDate;
    });
    
    // Cập nhật bảng
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="text-center">Không có dữ liệu điểm danh phù hợp.</td>`;
        tableBody.appendChild(row);
    } else {
        filteredData.forEach(record => {
            const row = document.createElement('tr');
            row.className = record.statusCode || '';
            
            row.innerHTML = `
                <td>${record.formattedDate}</td>
                <td>${record.className}</td>
                <td>${record.studentName}</td>
                <td>${record.status}</td>
                <td>${record.note || ''}</td>
                <td>
                    <button class="edit-btn" onclick="editAttendanceRecord('${record.recordId}', '${record.studentId}', '${record.date}')">Sửa</button>
                    <button class="delete-btn" onclick="deleteAttendanceRecord('${record.recordId}', '${record.studentId}', '${record.date}')">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Hàm sửa bản ghi điểm danh
function editAttendanceRecord(recordId, studentId, date) {
    const attendance = getAttendance();
    const record = attendance.find(r => (r.id === recordId || `${r.classId}-${r.date}` === recordId) && r.date === date);
    
    if (!record) {
        showNotification('Không tìm thấy bản ghi điểm danh', 'error');
        return;
    }
    
    // Tìm thông tin học sinh trong bản ghi
    const studentRecord = record.students.find(s => (s.id === studentId || s.studentId === studentId));
    if (!studentRecord) {
        showNotification('Không tìm thấy thông tin học sinh trong bản ghi điểm danh', 'error');
        return;
    }
    
    // Tạo modal sửa điểm danh
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'edit-attendance-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Sửa điểm danh</h2>
            <form id="edit-attendance-form">
                <input type="hidden" name="record-id" value="${recordId}">
                <input type="hidden" name="student-id" value="${studentId}">
                <input type="hidden" name="date" value="${date}">
                
                <div class="form-group">
                    <label>Trạng thái:</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="status" value="present" ${studentRecord.status === 'present' ? 'checked' : ''}>
                            Có mặt
                        </label>
                        <label>
                            <input type="radio" name="status" value="absent" ${studentRecord.status === 'absent' ? 'checked' : ''}>
                            Vắng mặt
                        </label>
                        <label>
                            <input type="radio" name="status" value="teacher-absent" ${studentRecord.status === 'teacher-absent' ? 'checked' : ''}>
                            GV vắng
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-attendance-note">Ghi chú:</label>
                    <textarea id="edit-attendance-note" name="note">${studentRecord.note || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="primary-btn">Lưu thay đổi</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Hiển thị modal
    modal.classList.remove('hidden');
    
    // Xử lý sự kiện đóng modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Xử lý form sửa điểm danh
    const form = modal.querySelector('#edit-attendance-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const status = form.querySelector('input[name="status"]:checked').value;
        const note = form.querySelector('textarea[name="note"]').value;
        
        // Cập nhật trạng thái và ghi chú
        studentRecord.status = status;
        studentRecord.note = note;
        
        // Lưu lại dữ liệu
        localStorage.setItem('attendance', JSON.stringify(attendance));
        
        // Hiển thị thông báo
        showNotification('Đã cập nhật điểm danh thành công');
        
        // Đóng modal
        document.body.removeChild(modal);
        
        // Cập nhật lại bảng điểm danh
        displayAttendanceHistory();
    });
}

// Hàm xóa bản ghi điểm danh
function deleteAttendanceRecord(recordId, studentId, date) {
    // Hiển thị xác nhận
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi điểm danh này không?')) {
        return;
    }
    
    const attendance = getAttendance();
    const recordIndex = attendance.findIndex(r => (r.id === recordId || `${r.classId}-${r.date}` === recordId) && r.date === date);
    
    if (recordIndex === -1) {
        showNotification('Không tìm thấy bản ghi điểm danh', 'error');
        return;
    }
    
    const record = attendance[recordIndex];
    
    // Nếu chỉ có 1 học sinh trong bản ghi, xóa toàn bộ bản ghi
    if (record.students.length === 1) {
        attendance.splice(recordIndex, 1);
    } else {
        // Nếu có nhiều học sinh, chỉ xóa thông tin học sinh cụ thể
        const studentIndex = record.students.findIndex(s => (s.id === studentId || s.studentId === studentId));
        
        if (studentIndex !== -1) {
            record.students.splice(studentIndex, 1);
        }
    }
    
    // Lưu lại dữ liệu
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Hiển thị thông báo
    showNotification('Đã xóa bản ghi điểm danh thành công');
    
    // Cập nhật lại bảng điểm danh
    displayAttendanceHistory();
}

// Hiển thị lịch sử điểm danh với bộ lọc và tìm kiếm nâng cao
function displayEnhancedAttendanceHistory() {
    const students = getStudents();
    const classes = getClasses();
    const attendance = getAttendance();

    // Lấy ngày hiện tại cho bộ lọc
    const today = new Date().toISOString().split('T')[0];

    console.log("Đang hiển thị lịch sử điểm danh nâng cao");
    console.log("Tổng số bản ghi điểm danh:", attendance.length);
    
    // Tìm phần tử container
    const container = document.getElementById('attendance-history');
    if (!container) {
        console.error("Không tìm thấy phần tử #attendance-history");
        return;
    }
    
    // Tạo bộ lọc
    let filterHtml = `
        <div class="filters-container">
            <div class="search-container">
                <input type="text" id="attendance-history-search" class="search-input" placeholder="Tìm kiếm học sinh..." oninput="filterAttendanceHistory()">
                <div id="attendance-history-suggestions" class="search-suggestions"></div>
            </div>
            <div class="filter-group">
                <label>Lớp:</label>
                <select id="attendance-history-class-filter" onchange="filterAttendanceHistory()">
                    <option value="">Tất cả các lớp</option>
                    ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Trạng thái:</label>
                <select id="attendance-history-status-filter" onchange="filterAttendanceHistory()">
                    <option value="">Tất cả trạng thái</option>
                    <option value="present">Có mặt</option>
                    <option value="absent">Vắng mặt</option>
                    <option value="teacher-absent">GV vắng</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Ngày:</label>
                <input type="date" id="attendance-history-date-filter" onchange="filterAttendanceHistory()" value="${today}">
            </div>
        </div>
    `;
    
    // Tạo danh sách lịch sử điểm danh
    const attendanceHistory = [];
    
    // Lặp qua từng bản ghi điểm danh
    attendance.forEach(record => {
        console.log(`Bản ghi điểm danh: Lớp=${record.classId}, Ngày=${record.date}`);
        
        const classData = classes.find(c => c.id === record.classId);
        if (!classData) {
            return;
        }
        
        // Kiểm tra xem có học sinh nào trong bản ghi không
        if (!record.students || !Array.isArray(record.students)) {
            console.log("Bỏ qua bản ghi không có thông tin học sinh");
            return;
        }
        
        record.students.forEach(studentAttendance => {
            // Tìm thông tin học sinh
            const studentId = studentAttendance.studentId || studentAttendance.id;
            const student = students.find(s => s.id === studentId);
            
            if (student) {
                let statusText = '';
                switch(studentAttendance.status) {
                    case 'present':
                        statusText = 'Có mặt';
                        break;
                    case 'absent':
                        statusText = 'Vắng mặt';
                        break;
                    case 'teacher-absent':
                        statusText = 'GV vắng';
                        break;
                    default:
                        statusText = 'Không xác định';
                }
                
                attendanceHistory.push({
                    date: record.date,
                    formattedDate: formatDate(record.date),
                    classId: classData.id,
                    className: classData.name,
                    studentId: student.id,
                    studentName: student.name,
                    status: statusText,
                    statusCode: studentAttendance.status,
                    note: studentAttendance.note || '',
                    recordId: record.id || `${record.classId}-${record.date}`
                });
            }
        });
    });
    
    // Sắp xếp theo ngày gần nhất
    attendanceHistory.sort((a, b) => {
        try {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0;
            }
            
            return dateB - dateA;
        } catch (error) {
            console.error("Lỗi khi so sánh ngày:", error);
            return 0;
        }
    });
    
    // Lưu dữ liệu vào localStorage để sử dụng cho tìm kiếm và lọc
    localStorage.setItem('attendanceHistoryData', JSON.stringify(attendanceHistory));
    
    // Tạo bảng
    let tableHtml = `
        <table class="attendance-table">
            <thead>
                <tr>
                    <th>Ngày</th>
                    <th>Lớp</th>
                    <th>Học sinh</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody id="attendance-history-table-body">
    `;
    
    console.log("Số bản ghi lịch sử điểm danh:", attendanceHistory.length);
    
    if (attendanceHistory.length === 0) {
        tableHtml += `<tr><td colspan="6" class="text-center">Không có dữ liệu điểm danh.</td></tr>`;
    } else {
        attendanceHistory.forEach(record => {
            console.log(`Hiển thị bản ghi: ${record.studentName}, ngày ${record.formattedDate}, trạng thái: ${record.status}`);
            
            // Trạng thái CSS
            const statusClass = record.statusCode || '';
            
            tableHtml += `
                <tr class="${statusClass}" data-record-id="${record.recordId}" data-student-id="${record.studentId}" data-class-id="${record.classId}" data-date="${record.date}" data-student-name="${record.studentName.toLowerCase()}">
                    <td>${record.formattedDate}</td>
                    <td>${record.className}</td>
                    <td>${record.studentName}</td>
                    <td>${record.status}</td>
                    <td>${record.note || ''}</td>
                    <td>
                        <button class="edit-btn" onclick="editAttendanceRecord('${record.recordId}', '${record.studentId}', '${record.date}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteAttendanceRecord('${record.recordId}', '${record.studentId}', '${record.date}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableHtml += `</tbody></table>`;
    
    // Hiển thị dữ liệu
    container.innerHTML = filterHtml + tableHtml;
    
    // Thiết lập sự kiện tìm kiếm gợi ý
    setupSearchSuggestions('attendance-history-search', 'attendance-history-suggestions', 
        Array.from(new Set(attendanceHistory.map(item => item.studentName))));
}