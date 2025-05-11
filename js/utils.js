/**
 * Các hàm tiện ích cho HoEdu Solution
 */

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Hàm định dạng lịch học với viết tắt
function formatSchedule(scheduleArray) {
    if (!scheduleArray || scheduleArray.length === 0) return '';
    
    const shortDays = {
        'Thứ 2': 'T.2',
        'Thứ 3': 'T.3',
        'Thứ 4': 'T.4',
        'Thứ 5': 'T.5',
        'Thứ 6': 'T.6',
        'Thứ 7': 'T.7',
        'Chủ nhật': 'CN'
    };
    
    return scheduleArray.map(day => shortDays[day] || day).join(', ');
}

// Hàm chuyển đổi số thành chữ tiếng Việt
function numberToWords(number) {
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    
    function readHundreds(num) {
        let result = '';
        const hundred = Math.floor(num / 100);
        const remainder = num % 100;
        
        if (hundred > 0) {
            result += units[hundred] + ' trăm';
            if (remainder > 0) {
                result += ' ';
            }
        }
        
        if (remainder > 0) {
            if (remainder < 10 && hundred > 0) {
                result += 'lẻ ' + units[remainder];
            } else if (remainder < 20) {
                result += teens[remainder - 10];
            } else {
                const ten = Math.floor(remainder / 10);
                const unit = remainder % 10;
                result += tens[ten];
                if (unit > 0) {
                    result += ' ' + (unit === 1 ? 'mốt' : units[unit]);
                }
            }
        }
        
        return result;
    }
    
    if (number === 0) return 'không';
    
    const billion = Math.floor(number / 1000000000);
    number %= 1000000000;
    const million = Math.floor(number / 1000000);
    number %= 1000000;
    const thousand = Math.floor(number / 1000);
    const remainder = number % 1000;
    
    let result = '';
    
    if (billion > 0) {
        result += readHundreds(billion) + ' tỷ';
        if (million > 0 || thousand > 0 || remainder > 0) {
            result += ' ';
        }
    }
    
    if (million > 0) {
        result += readHundreds(million) + ' triệu';
        if (thousand > 0 || remainder > 0) {
            result += ' ';
        }
    }
    
    if (thousand > 0) {
        result += readHundreds(thousand) + ' nghìn';
        if (remainder > 0) {
            result += ' ';
        }
    }
    
    if (remainder > 0) {
        result += readHundreds(remainder);
    }
    
    return result;
}

// Hàm định dạng ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm tạo ID ngẫu nhiên với tiền tố
function generateId(prefix, length = 3) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${prefix}${String(randomNumber).padStart(length, '0')}`;
}

// Hàm tạo mã học sinh
function generateStudentId() {
    const currentYear = new Date().getFullYear();
    return generateId(currentYear, 3);
}

// Hàm sinh mã hóa đơn
function generateReceiptNumber() {
    const currentYear = new Date().getFullYear();
    // Lấy số thứ tự hóa đơn tiếp theo
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const count = payments.length + 1;
    return `${currentYear}${String(count).padStart(3, '0')}`;
}

// Hàm tính ngày thanh toán tiếp theo dựa vào chu kỳ
function calculateNextPaymentDate(currentDate, cycle) {
    const date = new Date(currentDate);
    
    switch(cycle) {
        case '1 tháng':
            date.setMonth(date.getMonth() + 1);
            break;
        case '8 buổi':
        case '10 buổi':
            // Giả định là 2 buổi mỗi tuần
            const numberOfWeeks = cycle === '8 buổi' ? 4 : 5;
            date.setDate(date.getDate() + (numberOfWeeks * 7));
            break;
        case 'Theo ngày':
            // Giả định là 1 ngày
            date.setDate(date.getDate() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

// Hàm kiểm tra trạng thái thanh toán của học sinh
function checkPaymentStatus(student) {
    // Lấy danh sách thanh toán
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    // Lọc thanh toán của học sinh
    const studentPayments = payments.filter(payment => payment.studentId === student.id);
    
    if (studentPayments.length === 0) {
        return 'unpaid'; // Chưa từng thanh toán
    }
    
    // Sắp xếp theo ngày thanh toán gần nhất
    studentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestPayment = studentPayments[0];
    
    // Tính ngày hết hạn dựa vào chu kỳ thanh toán
    const expiryDate = new Date(calculateNextPaymentDate(latestPayment.date, latestPayment.cycle));
    const today = new Date();
    
    if (today > expiryDate) {
        return 'overdue'; // Quá hạn
    } else {
        return 'paid'; // Đã thanh toán và còn hạn
    }
}

// Hàm lấy trạng thái thanh toán bằng tiếng Việt
function getPaymentStatusText(status) {
    switch(status) {
        case 'paid':
            return 'Đã thanh toán';
        case 'unpaid':
            return 'Chưa thanh toán';
        case 'overdue':
            return 'Quá hạn';
        default:
            return 'Không xác định';
    }
}

// Hàm tạo QR code cho thanh toán (sử dụng API mới của VietQR)
function generatePaymentQRCode(studentId, amount) {
    const bankAccountNumber = '9704229262085470';
    const bankBin = '970422';  // Mã BIN của MB Bank
    const accountName = 'TRAN DONG PHU';
    const transferContent = `HP${studentId}`;
    
    // Tạo URL VietQR với định dạng API mới
    const vietQRUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.jpg?amount=${amount}&addInfo=${transferContent}&accountName=${encodeURIComponent(accountName)}`;
    
    console.log("Đã tạo QR code thanh toán:", vietQRUrl);
    return vietQRUrl;
}

// Hàm lấy dữ liệu lớp học từ localStorage
function getClasses() {
    return JSON.parse(localStorage.getItem('classes')) || [];
}

// Hàm lấy dữ liệu học sinh từ localStorage
function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

// Hàm lấy dữ liệu thanh toán từ localStorage
function getPayments() {
    try {
        const payments = localStorage.getItem('payments');
        if (!payments) {
            console.log("Không có dữ liệu thanh toán trong localStorage");
            return [];
        }
        const parsedPayments = JSON.parse(payments);
        console.log(`Đã lấy ${parsedPayments.length} thanh toán từ localStorage`);
        return parsedPayments;
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu thanh toán:", e);
        return [];
    }
}

// Hàm lấy dữ liệu điểm danh từ localStorage
function getAttendance() {
    return JSON.parse(localStorage.getItem('attendance')) || [];
}

// Hàm kiểm tra xem lớp có lịch học vào hôm nay không
function isClassToday(classData) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: CN, 1: T2, ..., 6: T7
    
    // Chuyển đổi thứ trong tuần sang định dạng "Thứ X" hoặc "Chủ nhật"
    let dayInVietnamese;
    if (dayOfWeek === 0) {
        dayInVietnamese = "Chủ nhật";
    } else {
        dayInVietnamese = `Thứ ${dayOfWeek + 1}`;
    }
    
    return classData.schedule.includes(dayInVietnamese);
}

// Hàm lấy tên lớp từ ID lớp
function getClassName(classId) {
    const classes = getClasses();
    const classData = classes.find(cls => cls.id === classId);
    return classData ? classData.name : 'Không xác định';
}

// Hàm lấy lớp từ ID lớp
function getClassById(classId) {
    const classes = getClasses();
    return classes.find(cls => cls.id === classId);
}

// Hàm lấy học sinh từ ID học sinh
function getStudentById(studentId) {
    const students = getStudents();
    return students.find(student => student.id === studentId);
}

// Hàm chuyển đổi thời gian
function formatTime(timeString) {
    return timeString.substring(0, 5);
}

// Hàm khởi tạo dữ liệu mẫu
function initializeSampleData() {
    // Kiểm tra xem đã có dữ liệu trong localStorage chưa
    if (!localStorage.getItem('initialized')) {
        // Lớp học mẫu
        const sampleClasses = [
            {
                id: 'class001',
                name: 'Lớp 1',
                schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
                timeStart: '08:00',
                timeEnd: '09:30',
                location: 'Phòng 101',
                fee: 500000,
                paymentCycle: '1 tháng'
            },
            {
                id: 'class002',
                name: 'Lớp 2',
                schedule: ['Thứ 3', 'Thứ 5'],
                timeStart: '14:00',
                timeEnd: '15:30',
                location: 'Phòng 202',
                fee: 450000,
                paymentCycle: '8 buổi'
            }
        ];
        
        // Học sinh mẫu
        const sampleStudents = [
            {
                id: 'HS001',
                name: 'Nguyễn Văn A',
                birthDate: '2010-05-15',
                phone: '0901234567',
                address: '123 Đường Lê Lợi, Quận 1',
                classId: 'class001',
                registerDate: '2023-01-10',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS002',
                name: 'Trần Thị B',
                birthDate: '2011-08-20',
                phone: '0912345678',
                address: '456 Đường Nguyễn Huệ, Quận 3',
                classId: 'class001',
                registerDate: '2023-01-15',
                paymentCycle: '1 tháng'
            },
            {
                id: 'HS003',
                name: 'Phạm Văn C',
                birthDate: '2010-11-12',
                phone: '0923456789',
                address: '789 Đường Lê Duẩn, Quận 2',
                classId: 'class002',
                registerDate: '2023-02-05',
                paymentCycle: '8 buổi'
            }
        ];
        
        // Thanh toán mẫu
        const samplePayments = [
            {
                id: 'PAY001',
                studentId: 'HS001',
                date: '2023-01-10',
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
                studentId: 'HS003',
                date: '2023-02-05',
                amount: 450000 * 8,
                method: 'Chuyển khoản',
                cycle: '8 buổi',
                receiptNumber: 'BL0002',
                additionalAmount: 0,
                additionalReason: '',
                discount: 0,
                discountReason: ''
            }
        ];
        
        // Điểm danh mẫu
        const sampleAttendance = [
            {
                id: 'ATT001',
                classId: 'class001',
                date: '2023-01-11',
                students: [
                    { id: 'HS001', status: 'present' },
                    { id: 'HS002', status: 'present' }
                ]
            },
            {
                id: 'ATT002',
                classId: 'class001',
                date: '2023-01-13',
                students: [
                    { id: 'HS001', status: 'present' },
                    { id: 'HS002', status: 'absent' }
                ]
            }
        ];
        
        // Lưu dữ liệu mẫu vào localStorage
        localStorage.setItem('classes', JSON.stringify(sampleClasses));
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        localStorage.setItem('payments', JSON.stringify(samplePayments));
        localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
        
        // Đánh dấu đã khởi tạo
        localStorage.setItem('initialized', 'true');
    }
}

// Reset the application data
function resetAppData() {
    // Clear localStorage
    localStorage.clear();
    
    // Xóa đánh dấu đã khởi tạo
    localStorage.removeItem('initialized');
    
    // Khởi tạo lại dữ liệu mẫu
    initializeSampleData();
    
    // Reload trang
    window.location.reload();
}

