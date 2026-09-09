// 1. Xử lý logic chuyển đổi Theme (Sáng / Tối)
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Kiểm tra trạng thái theme đã lưu trước đó
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
} else {
    htmlElement.classList.remove('dark');
    themeToggleBtn.textContent = '🌙';
}

themeToggleBtn.addEventListener('click', () => {
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.theme = 'light';
        themeToggleBtn.textContent = '🌙';
    } else {
        htmlElement.classList.add('dark');
        localStorage.theme = 'dark';
        themeToggleBtn.textContent = '☀️';
    }
});

// 2. Dữ liệu và hàm hiển thị thống kê động bằng JavaScript
const hospitalData = {
    users: 5,
    doctors: 2,
    patients: 5,
    appointments: 6
};

function renderStats(data) {
    const container = document.getElementById('stats-container');
    container.innerHTML = `
        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-slate-500 dark:text-slate-400">Tổng người dùng</p>
            <p class="text-xl font-bold text-sky-500 mt-1">${data.users}</p>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-slate-500 dark:text-slate-400">Tổng bác sĩ</p>
            <p class="text-xl font-bold text-sky-500 mt-1">${data.doctors}</p>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-slate-500 dark:text-slate-400">Tổng bệnh nhân</p>
            <p class="text-xl font-bold text-sky-500 mt-1">${data.patients}</p>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-slate-500 dark:text-slate-400">Tổng lịch khám</p>
            <p class="text-xl font-bold text-sky-500 mt-1">${data.appointments}</p>
        </div>
    `;
}

// Khởi chạy khi trang được tải xong
document.addEventListener('DOMContentLoaded', () => {
    renderStats(hospitalData);
});