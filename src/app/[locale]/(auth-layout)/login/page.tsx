'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Text } from '@mantine/core';
import { IconUser, IconLock, IconEyeOff, IconEye } from '@tabler/icons-react';
import Link from 'next/link';
import CreatorApi from '@/api/creator';
import CookieMap from '@/config/cookie-map';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await CreatorApi.login({
            email,
            password,
        });

        if (res.code === 0 && res.data) {
            Cookies.set(CookieMap.UserState, encodeURIComponent(JSON.stringify(res.data)));
            window.location.href = '/';
        } else {
            toast.error('Login failed: email or password is incorrect');
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black-purple">Welcome to Shortify</h2>
                <Text size="sm" c="dimmed">
                    All-in-One Platform to Monetize your short videos
                </Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" leftSection={<IconUser size={16} />} required />

                <PasswordInput
                    visibilityToggleIcon={({ reveal }) => (!reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />)}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    leftSection={<IconLock size={16} />}
                    required
                />

                {/* <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot Password?
                    </Link>
                </div> */}

                <Button type="submit" fullWidth color="primary">
                    Sign in
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Text size="sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Register
                    </Link>
                </Text>
            </div>
        </div>
    );
};

export default LoginPage;
