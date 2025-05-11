/**
 * Quản lý báo cáo và thống kê
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật dữ liệu báo cáo khi tab báo cáo được hiển thị
    const reportsTab = document.querySelector('.tab[data-tab="reports"]');
    if (reportsTab) {
        reportsTab.addEventListener('click', updateReportsData);
    }
});

// Cập nhật dữ liệu báo cáo
function updateReportsData() {
    // Cập nhật thống kê tổng quan
    updateOverviewStats();
    
    // Tạo biểu đồ doanh thu
    createRevenueChart();
    
    // Tạo biểu đồ điểm danh
    createAttendanceChart();
}

// Cập nhật thống kê tổng quan
function updateOverviewStats() {
    const classes = getClasses();
    const students = getStudents();
    
    // Đếm số học sinh chưa thanh toán hoặc quá hạn
    let unpaidStudents = 0;
    students.forEach(student => {
        const status = checkPaymentStatus(student);
        if (status === 'unpaid' || status === 'overdue') {
            unpaidStudents++;
        }
    });
    
    // Cập nhật các phần tử hiển thị
    document.getElementById('total-classes').textContent = classes.length;
    document.getElementById('total-students').textContent = students.length;
    document.getElementById('unpaid-students').textContent = unpaidStudents;
}

// Tạo biểu đồ doanh thu
function createRevenueChart() {
    const revenueChartCanvas = document.getElementById('revenue-chart');
    if (!revenueChartCanvas) return;
    
    // Lấy dữ liệu thanh toán
    const payments = getPayments();
    
    // Nếu không có dữ liệu thanh toán
    if (payments.length === 0) {
        // Xóa biểu đồ cũ nếu có
        if (window.revenueChart) {
            window.revenueChart.destroy();
        }
        
        // Hiển thị thông báo không có dữ liệu
        const ctx = revenueChartCanvas.getContext('2d');
        ctx.clearRect(0, 0, revenueChartCanvas.width, revenueChartCanvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có dữ liệu doanh thu', revenueChartCanvas.width / 2, revenueChartCanvas.height / 2);
        return;
    }
    
    // Tạo dữ liệu biểu đồ: doanh thu theo tháng trong 6 tháng gần nhất
    const today = new Date();
    const labels = []; // Tên các tháng
    const data = []; // Doanh thu từng tháng
    
    // Tạo mảng 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        labels.push(monthName);
        
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
        
        // Tính tổng doanh thu trong tháng
        let monthlyRevenue = 0;
        payments.forEach(payment => {
            if (payment.date >= monthStart && payment.date <= monthEnd) {
                monthlyRevenue += payment.amount;
            }
        });
        
        data.push(monthlyRevenue);
    }
    
    // Tạo biểu đồ
    if (window.revenueChart) {
        window.revenueChart.destroy();
    }
    
    window.revenueChart = new Chart(revenueChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: data,
                backgroundColor: 'rgba(26, 115, 232, 0.5)',
                borderColor: 'rgba(26, 115, 232, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value) + ' VND';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw) + ' VND';
                        }
                    }
                }
            }
        }
    });
}

// Tạo biểu đồ điểm danh
function createAttendanceChart() {
    const attendanceChartCanvas = document.getElementById('attendance-chart');
    if (!attendanceChartCanvas) return;
    
    // Lấy dữ liệu điểm danh
    const attendance = getAttendance();
    
    // Nếu không có dữ liệu điểm danh
    if (attendance.length === 0) {
        // Xóa biểu đồ cũ nếu có
        if (window.attendanceChart) {
            window.attendanceChart.destroy();
        }
        
        // Hiển thị thông báo không có dữ liệu
        const ctx = attendanceChartCanvas.getContext('2d');
        ctx.clearRect(0, 0, attendanceChartCanvas.width, attendanceChartCanvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có dữ liệu điểm danh', attendanceChartCanvas.width / 2, attendanceChartCanvas.height / 2);
        return;
    }
    
    // Tính tổng số trạng thái điểm danh
    let present = 0;
    let absent = 0;
    let teacherAbsent = 0;
    
    attendance.forEach(record => {
        record.students.forEach(student => {
            switch(student.status) {
                case 'present':
                    present++;
                    break;
                case 'absent':
                    absent++;
                    break;
                case 'teacher-absent':
                    teacherAbsent++;
                    break;
            }
        });
    });
    
    // Tạo biểu đồ
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    
    window.attendanceChart = new Chart(attendanceChartCanvas, {
        type: 'pie',
        data: {
            labels: ['Có mặt', 'Vắng mặt', 'GV nghỉ'],
            datasets: [{
                data: [present, absent, teacherAbsent],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',  // Xanh lá cho có mặt
                    'rgba(244, 67, 54, 0.7)',  // Đỏ cho vắng mặt
                    'rgba(255, 152, 0, 0.7)'   // Cam cho GV nghỉ
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(244, 67, 54, 1)',
                    'rgba(255, 152, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = present + absent + teacherAbsent;
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Tạo báo cáo doanh thu theo lớp
function createClassRevenueReport() {
    const classes = getClasses();
    const payments = getPayments();
    const students = getStudents();
    
    // Tạo đối tượng chứa doanh thu của từng lớp
    const classRevenue = {};
    classes.forEach(cls => {
        classRevenue[cls.id] = 0;
    });
    
    // Tính tổng doanh thu cho từng lớp
    payments.forEach(payment => {
        const student = students.find(s => s.id === payment.studentId);
        if (student && classRevenue.hasOwnProperty(student.classId)) {
            classRevenue[student.classId] += payment.amount;
        }
    });
    
    // Chuyển đổi thành mảng để dễ sắp xếp
    const revenueByClass = Object.keys(classRevenue).map(classId => {
        const classData = classes.find(cls => cls.id === classId);
        return {
            className: classData ? classData.name : 'Không xác định',
            revenue: classRevenue[classId]
        };
    });
    
    // Sắp xếp theo doanh thu từ cao đến thấp
    revenueByClass.sort((a, b) => b.revenue - a.revenue);
    
    return revenueByClass;
}

// Tạo báo cáo điểm danh theo lớp
function createClassAttendanceReport() {
    const classes = getClasses();
    const attendance = getAttendance();
    
    // Tạo đối tượng chứa thống kê điểm danh của từng lớp
    const classAttendance = {};
    classes.forEach(cls => {
        classAttendance[cls.id] = {
            className: cls.name,
            total: 0,
            present: 0,
            absent: 0,
            teacherAbsent: 0
        };
    });
    
    // Tính thống kê điểm danh cho từng lớp
    attendance.forEach(record => {
        if (classAttendance.hasOwnProperty(record.classId)) {
            record.students.forEach(student => {
                classAttendance[record.classId].total++;
                
                switch(student.status) {
                    case 'present':
                        classAttendance[record.classId].present++;
                        break;
                    case 'absent':
                        classAttendance[record.classId].absent++;
                        break;
                    case 'teacher-absent':
                        classAttendance[record.classId].teacherAbsent++;
                        break;
                }
            });
        }
    });
    
    // Chuyển đổi thành mảng
    const attendanceByClass = Object.values(classAttendance);
    
    // Sắp xếp theo tổng số điểm danh từ cao đến thấp
    attendanceByClass.sort((a, b) => b.total - a.total);
    
    return attendanceByClass;
}
