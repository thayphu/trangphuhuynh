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
    // Xử lý trường hợp không phải số hoặc không hợp lệ
    if (number === undefined || number === null || isNaN(number)) {
        console.error("numberToWords: Số không hợp lệ", number);
        return "không đồng";
    }
    
    // Đảm bảo chuyển thành số nguyên
    number = Math.floor(Number(number));
    
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    
    function readHundreds(num) {
        // Đảm bảo số hợp lệ
        if (num === 0) return '';
        if (isNaN(num) || num < 0 || num > 999) {
            console.error("readHundreds: Số không hợp lệ", num);
            return '';
        }
        
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
            } else if (remainder < 20 && remainder >= 10) {
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
    
    if (number === 0) return 'không đồng';
    
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
    
    return result + ' đồng';
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

// Hàm tính ngày thanh toán tiếp theo dựa vào chu kỳ và lịch học
function calculateNextPaymentDate(currentDate, cycle, studentId, extraSessions = 0) {
    console.log(`Tính ngày thanh toán tiếp theo cho học sinh ${studentId} từ ngày ${currentDate}, chu kỳ ${cycle}, buổi bổ sung: ${extraSessions}`);
    
    // Lấy thông tin học sinh và lớp
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        console.error(`Không tìm thấy học sinh với ID ${studentId}`);
        return currentDate;
    }
    
    const classes = getClasses();
    const classData = classes.find(c => c.id === student.classId);
    
    if (!classData) {
        console.error(`Không tìm thấy lớp cho học sinh ${studentId}`);
        return currentDate;
    }
    
    console.log(`Học sinh ${student.name} (${studentId}) học lớp ${classData.name} (${student.classId})`);
    console.log(`Lịch học: ${classData.schedule.join(', ')}`);
    
    // Lấy danh sách thanh toán của học sinh để xác định đây là thanh toán lần đầu hay không
    const payments = getPayments();
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const isFirstPayment = studentPayments.length <= 1; // Tính cả thanh toán hiện tại
    
    // Chuyển lịch học từ chữ sang số ngày trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
    const classDays = getClassDaysOfWeek(classData);
    console.log(`Các ngày học trong tuần (0-6): ${classDays.join(', ')}`);
    
    // Chuyển ngày hiện tại thành đối tượng Date
    const startDate = new Date(currentDate);
    let nextDate = new Date(startDate);
    
    switch(cycle) {
        case '1 tháng':
            if (isFirstPayment) {
                // Trường hợp 1: Thanh toán lần đầu, chu kỳ 1 tháng
                // Tìm buổi học đầu tiên của tháng tiếp theo
                nextDate.setMonth(nextDate.getMonth() + 1);
                nextDate.setDate(1); // Ngày đầu tiên của tháng tiếp theo
                
                // Tìm ngày học đầu tiên của tháng tiếp theo
                let foundFirstDay = false;
                for (let i = 0; i < 31; i++) { // Kiểm tra tối đa 31 ngày
                    const currentDayOfWeek = nextDate.getDay();
                    if (classDays.includes(currentDayOfWeek)) {
                        foundFirstDay = true;
                        break;
                    }
                    nextDate.setDate(nextDate.getDate() + 1);
                }
                
                if (!foundFirstDay) {
                    console.warn("Không tìm thấy ngày học trong tháng tiếp theo");
                    nextDate.setMonth(startDate.getMonth() + 1); // Quay lại cách tính mặc định
                }
            } else {
                // Trường hợp 2: Thanh toán từ lần thứ 2 trở đi, chu kỳ 1 tháng
                // Tìm buổi học đầu tiên của tháng tiếp theo
                nextDate.setMonth(nextDate.getMonth() + 1);
                
                // Thêm số buổi bổ sung vào ngày thanh toán tiếp theo (nếu có)
                if (extraSessions > 0) {
                    // Thêm số buổi học dựa trên lịch học
                    nextDate = addSessionsToDate(nextDate, extraSessions, classDays);
                }
            }
            break;
            
        case '8 buổi':
        case '10 buổi':
            const sessionsCount = cycle === '8 buổi' ? 8 : 10;
            
            if (isFirstPayment) {
                // Trường hợp 1: Thanh toán lần đầu, chu kỳ theo buổi
                // Tính đủ số buổi dựa trên lịch học
                nextDate = addSessionsToDate(startDate, sessionsCount, classDays);
            } else {
                // Trường hợp 2: Thanh toán từ lần thứ 2 trở đi, chu kỳ theo buổi
                // Tính lần lượt từng buổi học trong chu kỳ
                let lastSessionDate = addSessionsToDate(startDate, sessionsCount, classDays);
                
                // Lấy buổi học tiếp theo sau buổi cuối của chu kỳ hiện tại
                nextDate = new Date(lastSessionDate);
                let found = false;
                for (let i = 1; i <= 7; i++) { // Kiểm tra tối đa 7 ngày tiếp theo
                    nextDate.setDate(nextDate.getDate() + 1);
                    const dayOfWeek = nextDate.getDay();
                    if (classDays.includes(dayOfWeek)) {
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // Nếu không tìm thấy, quay lại cách tính mặc định
                    nextDate.setDate(startDate.getDate() + (sessionsCount * 7 / 2)); // Giả định 2 buổi/tuần
                }
                
                // Thêm số buổi bổ sung vào ngày thanh toán tiếp theo (nếu có)
                if (extraSessions > 0) {
                    nextDate = addSessionsToDate(nextDate, extraSessions, classDays);
                }
            }
            break;
            
        case 'Theo ngày':
            // Thêm 1 ngày cho chu kỳ theo ngày
            nextDate.setDate(nextDate.getDate() + 1);
            
            // Thêm số buổi bổ sung (nếu có)
            if (extraSessions > 0) {
                nextDate = addSessionsToDate(nextDate, extraSessions, classDays);
            }
            break;
    }
    
    console.log(`Ngày thanh toán tiếp theo: ${nextDate.toISOString().split('T')[0]}`);
    return nextDate.toISOString().split('T')[0];
}

// Hàm hỗ trợ để thêm số buổi học vào một ngày
function addSessionsToDate(startDate, sessions, classDays) {
    let currentDate = new Date(startDate);
    let sessionsAdded = 0;
    
    while (sessionsAdded < sessions) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        
        if (classDays.includes(dayOfWeek)) {
            sessionsAdded++;
        }
    }
    
    return currentDate;
}

// Hàm chuyển đổi lịch học từ chữ sang số ngày trong tuần
function getClassDaysOfWeek(classData) {
    if (!classData || !classData.schedule || !Array.isArray(classData.schedule)) {
        return [];
    }
    
    const dayMapping = {
        'chủ nhật': 0, 'cn': 0, 'chu nhat': 0, 
        'thứ 2': 1, 'thứ hai': 1, 't.2': 1, 't2': 1,
        'thứ 3': 2, 'thứ ba': 2, 't.3': 2, 't3': 2,
        'thứ 4': 3, 'thứ tư': 3, 't.4': 3, 't4': 3,
        'thứ 5': 4, 'thứ năm': 4, 't.5': 4, 't5': 4,
        'thứ 6': 5, 'thứ sáu': 5, 't.6': 5, 't6': 5,
        'thứ 7': 6, 'thứ bảy': 6, 't.7': 6, 't7': 6
    };
    
    const result = [];
    
    for (const day of classData.schedule) {
        const normalizedDay = day.trim().toLowerCase();
        
        for (const [key, value] of Object.entries(dayMapping)) {
            if (normalizedDay.includes(key)) {
                if (!result.includes(value)) {
                    result.push(value);
                }
                break;
            }
        }
    }
    
    return result.sort((a, b) => a - b);
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

// Hàm kiểm tra xem lớp có lịch học vào một ngày cụ thể không
function isClassOnDay(classData, dayOfWeek) {
    if (!classData || !classData.schedule || !Array.isArray(classData.schedule)) {
        return false;
    }
    
    // Tạo tất cả các biến thể có thể có cho thứ trong tuần
    let dayVariants = [];
    
    if (dayOfWeek === 0) {
        // Chủ nhật
        dayVariants = ["Chủ nhật", "Chủ Nhật", "CN", "CN.", "Chu nhat", "chủ nhật"];
    } else {
        // Các ngày trong tuần
        const dayNumber = dayOfWeek + 1;
        dayVariants = [
            `Thứ ${dayNumber}`,
            `Thứ${dayNumber}`,
            `T${dayNumber}`,
            `T.${dayNumber}`,
            `Thu ${dayNumber}`
        ];
    }
    
    // Kiểm tra xem bất kỳ biến thể nào của thứ trong tuần có khớp với lịch học không
    for (const scheduleDay of classData.schedule) {
        // Chuẩn hóa để so sánh dễ dàng hơn
        const normalizedScheduleDay = scheduleDay.trim().toLowerCase();
        
        for (const variant of dayVariants) {
            if (normalizedScheduleDay === variant.toLowerCase() || 
                normalizedScheduleDay.includes(variant.toLowerCase())) {
                return true;
            }
        }
    }
    
    return false;
}

// Hàm kiểm tra xem lớp có lịch học vào hôm nay không
function isClassToday(classData) {
    if (!classData) return false;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: CN, 1: T2, ..., 6: T7
    
    return isClassOnDay(classData, dayOfWeek);
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

// Hàm lấy tên rút gọn (họ + tên) từ tên đầy đủ
function getShortName(fullName) {
    if (!fullName) return '';
    
    const nameParts = fullName.split(' ');
    if (nameParts.length <= 1) return fullName;
    
    // Lấy từ đầu tiên (họ) và từ cuối cùng (tên)
    return nameParts[0] + ' ' + nameParts[nameParts.length - 1];
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
                schedule: ['T.2', 'T.4', 'T.6'],
                timeStart: '08:00',
                timeEnd: '09:30',
                location: 'Phòng 101',
                fee: 500000,
                paymentCycle: '1 tháng',
                locked: false
            },
            {
                id: 'class002',
                name: 'Lớp 2',
                schedule: ['T.3', 'T.5'],
                timeStart: '14:00',
                timeEnd: '15:30',
                location: 'Phòng 202',
                fee: 450000,
                paymentCycle: '8 buổi',
                locked: false
            },
            {
                id: 'class003',
                name: 'Lớp Nghệ Thuật',
                schedule: ['CN', 'T.7'],
                timeStart: '09:00',
                timeEnd: '11:00',
                location: 'Phòng 303',
                fee: 600000,
                paymentCycle: '1 tháng',
                locked: false
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
            },
            {
                id: 'HS004',
                name: 'Hoàng Minh Tuấn',
                birthDate: '2009-12-03',
                phone: '0976543210',
                address: '456 Đường Nguyễn Huệ, Quận 5',
                classId: 'class003',
                registerDate: '2023-05-15',
                paymentCycle: '1 tháng',
                latestPaymentDate: '2023-05-15',
                nextPaymentDate: '2023-06-15',
                status: 'paid'
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

