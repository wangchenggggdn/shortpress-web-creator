'use client';

import React, { useState, useEffect, useContext } from 'react';
import { TextInput, Button, LoadingOverlay } from '@mantine/core';
import { IconX, IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PaymentAPI } from '@/api/payment';
import { SiteContext } from '@/components/business/websites/useContext/site-context';

interface StripeConnectProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (publicKey: string, secretKey: string) => Promise<void>;
}

const StripeConnect: React.FC<StripeConnectProps> = ({ opened, onClose, onSubmit }) => {
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);
    const { params } = useContext(SiteContext);
    const siteId = params?.siteId ?? '';

    useEffect(() => {
        if (opened && siteId) {
            setLoading(true);
            PaymentAPI.getConfig({ siteId })
                .then(response => {
                    if (response.data?.stripe) {
                        setPublicKey(response.data.stripe.pk || '');
                        setSecretKey(response.data.stripe.sk || '');
                    }
                })
                .catch(error => {
                    console.error('Failed to load Stripe config:', error);
                    toast.error('Failed to load Stripe configuration');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [opened, siteId]);

    const handleSubmit = async () => {
        if (!publicKey) {
            toast.error('Please enter Publishable key');
            return;
        }
        if (!secretKey) {
            toast.error('Please enter Secret key');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(publicKey, secretKey);
            onClose();
        } catch (error) {
            console.error('Stripe configuration error:', error);
        } finally {
            setLoading(false);
        }
    };

    // const copyWebhookUrl = () => {
    //     navigator.clipboard.writeText(webhookUrl);
    //     toast.success('Webhook URL copied');
    // };

    if (!opened) return null;

    return (
        <div className="fixed inset-0 bg-black/20 z-50">
            <div className="fixed top-0 right-0 z-50 h-screen shadow-lg">
                <div className="w-[480px] bg-white h-full flex flex-col">
                    <div className="overflow-y-scroll">
                        <div className="flex items-center justify-between px-6 h-16">
                            <h2 className="text-2xl font-medium">Connect to Stripe</h2>
                            <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                                <IconX size={20} />
                            </Button>
                        </div>

                        <div className="flex-1 px-6 space-y-6">
                            <div>
                                <TextInput
                                    label="Publishable key*"
                                    value={publicKey}
                                    onChange={e => setPublicKey(e.target.value)}
                                    placeholder="Enter your Stripe Publishable key"
                                    variant="filled"
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <TextInput
                                    label="Secret key*"
                                    value={secretKey}
                                    onChange={e => setSecretKey(e.target.value)}
                                    placeholder="Enter your Stripe Secret key"
                                    variant="filled"
                                    type="password"
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Webhook URL</span>
                                    <Button variant="subtle" color="primary" onClick={copyWebhookUrl} leftSection={<IconCopy size={16} />}>
                                        Copy
                                    </Button>
                                </div>
                                <div className="p-3 bg-gray-50 rounded text-sm break-all">{webhookUrl}</div>
                            </div> */}

                            <div className="text-center">
                                <a href="https://stripe.com/docs/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                    How to set up Stripe?
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

export default StripeConnect;
