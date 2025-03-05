module.exports = {
    extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    rules: {
        'prettier/prettier': 2,
        'import/no-anonymous-default-export': 0,
        'react-hooks/exhaustive-deps': 0,
        'react/no-children-prop': 0,
        'react/no-unescaped-entities': 0,
    },
};
