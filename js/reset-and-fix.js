/**
 * Công cụ sửa chữa dữ liệu và hiển thị
 * Phiên bản đơn giản hóa để tránh xung đột
 */

// Hàm sửa chữa và reset dữ liệu ứng dụng
function resetAndFixApp() {
    console.log("==== BẮT ĐẦU RESET DỮ LIỆU ====");
    
    try {
        // Xóa dữ liệu cũ
        localStorage.clear();
        
        // Tạo dữ liệu lớp học mẫu
        const sampleClasses = [
            {
                id: 'class001',
                name: 'Lớp Toán nâng cao',
                teacher: 'Nguyễn Văn Giáo',
                description: 'Lớp học dành cho học sinh khá giỏi, thi HSG',
                schedule: ['T.2', 'T.4', 'T.6'],
                timeStart: '18:00',
                timeEnd: '19:30',
                fee: 500000,
                feeCycle: '1 tháng'
            },
            {
                id: 'class002',
                name: 'Lớp Tiếng Anh giao tiếp',
                teacher: 'Trần Thị Anh',
                description: 'Rèn luyện kỹ năng giao tiếp tiếng Anh',
                schedule: ['Thứ 3', 'Thứ 5'],
                timeStart: '17:30',
                timeEnd: '19:00',
                fee: 450000,
                feeCycle: '1 tháng'
            }
        ];
        
        // Tạo dữ liệu học sinh mẫu
        const sampleStudents = [
            {
                id: 'HS001',
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                birthdate: '2013-05-10',
                parentName: 'Nguyễn Văn Phụ huynh',
                parentPhone: '0987654321',
                address: '123 Đường ABC, Quận 1',
                classId: 'class001',
                registerDate: '2023-01-01',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS002',
                name: 'Trần Thị B',
                phone: '0923456789',
                birthdate: '2014-02-15',
                parentName: 'Trần Văn Phụ huynh',
                parentPhone: '0976543210',
                address: '456 Đường XYZ, Quận 2',
                classId: 'class002',
                registerDate: '2023-01-15',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS003',
                name: 'Phạm Văn C',
                phone: '0934567890',
                birthdate: '2013-11-20',
                parentName: 'Phạm Thị Phụ huynh',
                parentPhone: '0965432109',
                address: '789 Đường DEF, Quận 3',
                classId: 'class001',
                registerDate: '2023-02-01',
                paymentCycle: '8 buổi'
            }
        ];
        
        // Tạo dữ liệu thanh toán mẫu
        const samplePayments = [
            {
                id: 'PAY001',
                studentId: 'HS001',
                date: '2023-01-05',
                amount: 500000,
                method: 'Tiền mặt',
                cycle: '1 tháng',
                receiptNumber: 'BL0001',
                additionalAmount: 0,
                additionalReason: '',
                discount: 0,
                discountReason: ''
            },
            {
                id: 'PAY002',
                studentId: 'HS002',
                date: '2023-01-15',
                amount: 450000,
                method: 'Chuyển khoản',
                cycle: '1 tháng',
                receiptNumber: 'BL0002',
                additionalAmount: 0,
                additionalReason: '',
                discount: 0,
                discountReason: ''
            }
        ];
        
        // Tạo dữ liệu điểm danh mẫu
        const sampleAttendance = [
            {
                id: 'ATT001',
                classId: 'class001',
                date: '2023-01-05',
                students: [
                    { id: 'HS001', status: 'present' },
                    { id: 'HS003', status: 'present' }
                ]
            },
            {
                id: 'ATT002',
                classId: 'class002',
                date: '2023-01-03',
                students: [
                    { id: 'HS002', status: 'present' }
                ]
            }
        ];
        
        // Lưu dữ liệu vào localStorage
        localStorage.setItem('classes', JSON.stringify(sampleClasses));
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        localStorage.setItem('payments', JSON.stringify(samplePayments));
        localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
        localStorage.setItem('initialized', 'true');
        
        // Làm mới trang để tránh xung đột DOM
        window.location.reload();
        
    } catch (error) {
        console.error("Lỗi khi reset dữ liệu:", error);
        alert('Đã xảy ra lỗi khi reset dữ liệu: ' + error.message);
    }
}
