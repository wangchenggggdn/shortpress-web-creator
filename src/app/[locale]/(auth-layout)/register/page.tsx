'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Text, Tooltip } from '@mantine/core';
import { IconUser, IconLock, IconMail, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import CreatorApi from '@/api/creator';
import { useRouter } from '@/libs/navigation';
import { toast } from 'sonner';

const RegisterPage = () => {
    const [creatorName, setCreatorName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email');
            return;
        }
        const res = await CreatorApi.register({
            creatorName,
            nickname,
            email,
            password,
        });
        if (res.code === 0) {
            router.push('/login');
        } else {
            toast.error(res.info);
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black-purple">Create an Account</h2>
                <Text size="sm" c="dimmed">
                    Join Shortify to start monetizing your content
                </Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* createName with tooltip */}
                <div className="relative">
                    <TextInput
                        value={creatorName}
                        onChange={e => setCreatorName(e.target.value)}
                        placeholder="Username"
                        leftSection={<IconUser size={16} />}
                        rightSection={
                            <Tooltip label="This username will be used as your unique identifier and cannot be changed later" position="top-start" withArrow>
                                <IconInfoCircle size={16} className="text-gray-400 cursor-help" />
                            </Tooltip>
                        }
                        required
                    />
                </div>
                {/* nickname */}
                <TextInput value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Nickname" leftSection={<IconUser size={16} />} required />
                <TextInput value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" leftSection={<IconMail size={16} />} required />
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" leftSection={<IconLock size={16} />} required />
                <div className="flex flex-row w-full items-center justify-center">
                    <Text size="sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </Text>
                </div>
                <Button type="submit" fullWidth color="primary">
                    Register
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Text size="xs" c="dimmed" ta="center">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </Link>
                </Text>
            </div>
        </div>
    );
};

export default RegisterPage;
