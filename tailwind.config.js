/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6355FF',
                    hover: '#4F44CC',
                    light: '#F0EEFF',
                    20: 'rgba(99, 85, 255, 0.2)',
                },
                layout: {
                    DEFAULT: '#FFFFFF',    // 侧边栏和头部背景色
                    page: '#F8F9FA',       // 主内容区域背景色
                },
                'black-purple': '#00106D',
            },
        },
    },
    plugins: [],
}; 