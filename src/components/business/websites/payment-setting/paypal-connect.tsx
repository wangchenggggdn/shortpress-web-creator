'use client';

import React, { useState } from 'react';
import { TextInput, Button } from '@mantine/core';
import { IconX, IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';

interface PaypalConnectProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (clientId: string, clientSecret: string) => void;
}

const PaypalConnect: React.FC<PaypalConnectProps> = ({ opened, onClose, onSubmit }) => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const webhookUrl = 'https://shortpress.com/addons/dramas/pay/notify_paypal/payment/paypal/sign/edum';

    const handleSubmit = () => {
        if (!clientId) {
            toast.error('Please enter Client ID');
            return;
        }
        if (!clientSecret) {
            toast.error('Please enter Client Secret');
            return;
        }
        onSubmit(clientId, clientSecret);
    };

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast.success('Webhook URL copied');
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
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Webhook URL</span>
                                    <Button variant="subtle" color="primary" onClick={copyWebhookUrl} leftSection={<IconCopy size={16} />}>
                                        Copy
                                    </Button>
                                </div>
                                <div className="p-3 bg-gray-50 rounded text-sm break-all">{webhookUrl}</div>
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
                            <Button fullWidth size="md" color="primary" onClick={handleSubmit}>
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
