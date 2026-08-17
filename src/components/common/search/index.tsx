'use client';

import React, { useState, useEffect } from 'react';
import { ActionIcon, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface SearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    delay?: number;
}

const Search: React.FC<SearchProps> = ({ value, onChange, placeholder = 'Search', className, delay = 300 }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [inputValue, delay, onChange, value]);

    const handleClear = () => {
        setInputValue('');
        onChange('');
    };

    return (
        <div className="relative z-10">
            <TextInput
                placeholder={placeholder}
                value={inputValue}
                onChange={e => {
                    setInputValue(e.currentTarget.value);
                }}
                rightSectionPointerEvents="all"
                rightSection={
                    inputValue ? (
                        <ActionIcon variant="subtle" color="gray" radius="xl" size="sm" aria-label="Clear search" onClick={handleClear}>
                            <IconX size={14} />
                        </ActionIcon>
                    ) : (
                        <IconSearch size={16} className="text-gray-500" />
                    )
                }
                variant="unstyled"
                className={className}
                styles={theme => ({
                    input: {
                        height: '36px',
                        backgroundColor: 'rgba(99, 85, 255, 0.1)',
                        borderRadius: '9999px',
                        textAlign: 'left',
                        paddingLeft: '1.5rem',
                        paddingRight: '3rem',
                        '&::placeholder': {
                            color: theme.colors.gray[10],
                        },
                    },
                    section: {
                        color: '#666',
                        right: '1rem',
                    },
                })}
            />
        </div>
    );
};

export default Search;
