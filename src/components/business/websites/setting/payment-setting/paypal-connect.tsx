'use client';

import React, { useState, useEffect, useContext } from 'react';
import { TextInput, Button, Radio } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PaymentAPI } from '@/api/payment';
import { SiteContext } from '@/components/business/websites/useContext/site-context';

interface PaypalConnectProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (clientId: string, clientSecret: string, isSandbox: boolean) => Promise<void>;
}

const PaypalConnect: React.FC<PaypalConnectProps> = ({ opened, onClose, onSubmit }) => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [environment, setEnvironment] = useState<'sandbox' | 'live'>('live');
    const [loading, setLoading] = useState(false);
    const { params } = useContext(SiteContext);
    const siteId = params?.siteId ?? '';

    useEffect(() => {
        if (opened && siteId) {
            setClientId('');
            setClientSecret('');
            setEnvironment('live');
            setLoading(true);
            PaymentAPI.getConfig({ siteId })
                .then(response => {
                    if (response.data?.paypal) {
                        setClientId(response.data.paypal.clientId || '');
                        setClientSecret(response.data.paypal.clientSecret || '');
                        setEnvironment(response.data.paypal.isSandbox ? 'sandbox' : 'live');
                    }
                })
                .catch(error => {
                    console.error('Failed to load PayPal config:', error);
                    toast.error('Failed to load PayPal configuration');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [opened, siteId]);

    const handleSubmit = async () => {
        if (!clientId) {
            toast.error('Please enter Client ID');
            return;
        }
        if (!clientSecret) {
            toast.error('Please enter Client Secret');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(clientId, clientSecret, environment === 'sandbox');
            onClose();
        } catch (error) {
            console.error('PayPal configuration error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!opened) return null;

    return (
        <div className="fixed inset-0 bg-black/20 z-50">
            <div className="fixed top-0 right-0 z-50 h-screen shadow-lg">
                <div className="w-[480px] bg-white h-full flex flex-col">
                    <div className="overflow-y-scroll">
                        <div className="flex items-center justify-between px-6 h-16">
                            <h2 className="text-2xl font-medium">Connect PayPal</h2>
                            <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                                <IconX size={20} />
                            </Button>
                        </div>

                        <div className="flex-1 px-6 space-y-6">
                            <div>
                                <TextInput
                                    label="Client ID*"
                                    value={clientId}
                                    onChange={e => setClientId(e.target.value)}
                                    placeholder="Enter your PayPal Client ID"
                                    variant="filled"
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <TextInput
                                    label="Client Secret*"
                                    value={clientSecret}
                                    onChange={e => setClientSecret(e.target.value)}
                                    placeholder="Enter your PayPal client secret"
                                    variant="filled"
                                    type="password"
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Environment*</label>
                                <Radio.Group value={environment} onChange={value => setEnvironment(value as 'sandbox' | 'live')}>
                                    <div className="flex gap-8">
                                        <Radio value="live" label="Live" />
                                        <Radio value="sandbox" label="Sandbox" />
                                    </div>
                                </Radio.Group>
                            </div>

                            <div className="text-center">
                                <a
                                    href="https://developer.paypal.com/docs/api/overview/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                >
                                    How to set PayPal?
                                </a>
                            </div>
                        </div>

                        <div className="p-6">
                            <Button fullWidth size="md" color="primary" onClick={handleSubmit} loading={loading}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaypalConnect;
