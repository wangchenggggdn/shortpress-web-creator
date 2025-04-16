'use client';

import { Website } from '@/types/website';
import { Button, Select } from '@mantine/core';
import payment_strpe from '@/assets/images/payment/payment_stripe.webp';
import payment_paypal from '@/assets/images/payment/payment_paypal.webp';
import { useState, useEffect } from 'react';
import PaypalConnect from './paypal-connect';
import StripeConnect from './stripe-connect';
import { PaymentAPI } from '@/api/payment';
import { toast } from 'sonner';
import { PaymentArgs } from '@/api/args';

interface PaymentSettingProps {
    website: Website;
}

const PaymentSetting: React.FC<PaymentSettingProps> = ({ website }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [paypalModalOpened, setPaypalModalOpened] = useState(false);
    const [stripeModalOpened, setStripeModalOpened] = useState(false);
    const [paypalStatus, setPaypalStatus] = useState<string>('Not connected');
    const [stripeStatus, setStripeStatus] = useState<string>('Not connected');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch payment account information
        const fetchPaymentAccountInfo = async () => {
            try {
                const [paypalResponse, stripeResponse] = await Promise.all([
                    PaymentAPI.getAccountInfo({ provider: 'paypal', siteId: website.siteId }),
                    PaymentAPI.getAccountInfo({ provider: 'stripe', siteId: website.siteId }),
                ]);

                if (paypalResponse.data) {
                    setPaypalStatus(paypalResponse.data.email || 'Not connected');
                }
                if (stripeResponse.data) {
                    setStripeStatus(stripeResponse.data.email || 'Not connected');
                }
            } catch (error) {
                console.error('Failed to fetch payment account info:', error);
            }
        };

        fetchPaymentAccountInfo();
    }, [website.siteId]);

    const handleCurrencyChange = (value: string | null) => {
        setSelectedCurrency(value ?? 'USD');
    };

    const handlePaypalConnect = async (clientId: string, clientSecret: string) => {
        setLoading(true);
        try {
            const config: PaymentArgs.SaveConfig = {
                provider: 'paypal',
                siteId: website.siteId,
                paypalConf: {
                    clientId: clientId,
                    clientSecret: clientSecret,
                },
            };

            await PaymentAPI.saveConfig(config);
            const response = await PaymentAPI.getAccountInfo({ provider: 'paypal', siteId: website.siteId });
            if (response.data) {
                setPaypalStatus(response.data.email || 'Not connected');
                toast.success('PayPal connected successfully');
            }
        } catch (error) {
            console.error('Failed to connect PayPal:', error);
            toast.error('Failed to connect PayPal');
        } finally {
            setLoading(false);
        }
    };

    const handleStripeConnect = async (publicKey: string, secretKey: string) => {
        setLoading(true);
        try {
            const config: PaymentArgs.SaveConfig = {
                provider: 'stripe',
                siteId: website.siteId,
                stripeConf: {
                    pk: publicKey,
                    sk: secretKey,
                },
            };

            await PaymentAPI.saveConfig(config);
            const response = await PaymentAPI.getAccountInfo({ provider: 'stripe', siteId: website.siteId });
            if (response.data) {
                setStripeStatus(response.data.email || 'Not connected');
                toast.success('Stripe connected successfully');
            }
        } catch (error) {
            console.error('Failed to connect Stripe:', error);
            toast.error('Failed to connect Stripe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg px-6">
                <h2 className="text-xl font-medium mb-2">Payment Methods</h2>
                <p className="text-gray-500 mb-6">Add one or more payment methods to collecting payments in your website.</p>

                {/* Stripe Integration */}
                <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-2">
                            <img src={payment_strpe.src} alt="Stripe" className="h-8" />
                        </div>
                        <div className="text-sm text-gray-500">Stripe account: {stripeStatus}</div>
                    </div>
                    <Button variant="filled" color="primary" onClick={() => setStripeModalOpened(true)}>
                        {stripeStatus === 'Not connected' ? 'Connect' : 'Manage'}
                    </Button>

                    <StripeConnect opened={stripeModalOpened} onClose={() => setStripeModalOpened(false)} onSubmit={handleStripeConnect} />
                </div>

                {/* PayPal Integration */}
                <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-2">
                            <img src={payment_paypal.src} alt="PayPal" className="h-6" />
                        </div>
                        <div className="text-sm text-gray-500">PayPal account: {paypalStatus}</div>
                    </div>
                    <Button variant="filled" color="primary" onClick={() => setPaypalModalOpened(true)}>
                        {paypalStatus === 'Not connected' ? 'Connect' : 'Manage'}
                    </Button>

                    <PaypalConnect opened={paypalModalOpened} onClose={() => setPaypalModalOpened(false)} onSubmit={handlePaypalConnect} />
                </div>

                {/* Currency Settings */}
                {/* <div className="mt-8">
                    <h2 className="text-xl font-medium mb-6">Currency</h2>
                    <div className="max-w-xs">
                        <Select
                            data={[
                                { value: 'USD', label: 'United States Dollar (USD, $)' },
                                { value: 'EUR', label: 'Euro (EUR, €)' },
                                { value: 'GBP', label: 'British Pound (GBP, £)' },
                                { value: 'JPY', label: 'Japanese Yen (JPY, ¥)' },
                            ]}
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            className="mb-4"
                        />
                        <Button variant="filled" color="primary">
                            Update
                        </Button>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default PaymentSetting;
