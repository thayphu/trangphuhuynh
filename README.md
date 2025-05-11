# HoEdu Solution - Hệ thống Quản lý Giáo dục

HoEdu Solution là phần mềm quản lý giáo dục toàn diện được triển khai dưới dạng ứng dụng web tĩnh, hoạt động hoàn toàn trên trình duyệt mà không cần máy chủ backend. Ứng dụng được thiết kế để chạy trên GitHub Pages hoặc bất kỳ máy chủ web tĩnh nào.

## Tính năng chính

- **Quản lý lớp học**: Thêm, sửa, xóa thông tin lớp học
- **Quản lý học sinh**: Thông tin chi tiết học sinh, tìm kiếm, lọc
- **Quản lý học phí**: Thu học phí, báo cáo, lịch sử thanh toán
- **Điểm danh**: Quản lý điểm danh, báo cáo vắng mặt, đặt lịch học bù
- **Cổng thông tin phụ huynh**: Tra cứu thông tin học sinh, thanh toán học phí
- **Báo cáo và thống kê**: Tổng quan tài chính, điểm danh, hoạt động

## Cài đặt và Triển khai

### Triển khai trên GitHub Pages

1. Fork repository này
2. Đi đến Settings > Pages
3. Chọn nguồn triển khai (main branch)
4. Lưu cấu hình và đợi vài phút để trang web được xuất bản

### Cài đặt trên máy cục bộ

1. Clone repository:
```
git clone https://github.com/your-username/hoedu-solution.git
```

2. Mở file `index.html` bằng trình duyệt web hoặc sử dụng một máy chủ web tĩnh đơn giản như:

```
# Với Python
python -m http.server

# Với Node.js
npx serve
```

## Đăng nhập hệ thống

- Username: dongphubte
- Password: @Bentre2013

## Lưu trữ dữ liệu

HoEdu Solution sử dụng localStorage của trình duyệt để lưu trữ dữ liệu. Dữ liệu sẽ được giữ nguyên sau khi đóng và mở lại trình duyệt (trừ khi bạn xóa cache/cookies).

## Tối ưu hóa và bảo mật

- Sử dụng hashing cho mật khẩu
- Timeout phiên đăng nhập tự động sau 30 phút không hoạt động
- Tối ưu hóa tải trang với preconnect và async/defer
- Xác thực mã nguồn (integrity) cho các thư viện bên ngoài

## Yêu cầu hệ thống

- Trình duyệt web hiện đại hỗ trợ HTML5, CSS3 và JavaScript ES6+
- Kết nối Internet (chỉ khi tải trang lần đầu và sử dụng một số tính năng như mã QR)

## Giấy phép

HoEdu Solution được phát triển bởi [Tran Dong Phu] và được phân phối dưới [Giấy phép MIT].