'use client';

import { Website } from '@/types/website';
import { Button, Select } from '@mantine/core';
import payment_strpe from '@/assets/images/payment/payment_stripe.webp';
import payment_paypal from '@/assets/images/payment/payment_paypal.webp';
import { useState } from 'react';
import PaypalConnect from './paypal-connect';

interface PaymentSettingProps {
    website: Website;
}

const PaymentSetting: React.FC<PaymentSettingProps> = ({ website }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [paypalModalOpened, setPaypalModalOpened] = useState(false);

    const handleCurrencyChange = (value: string | null) => {
        setSelectedCurrency(value ?? 'USD');
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg px-6">
                <h2 className="text-xl font-medium mb-2">Payment Methods</h2>
                <p className="text-gray-500 mb-6">Add one or more payment methods to collecting payments in your website.</p>

                {/* Stripe Integration */}
                <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <img src={payment_strpe.src} alt="Stripe" className="h-8" />
                    </div>
                    <Button variant="filled" color="primary" onClick={() => setPaypalModalOpened(true)}>
                        Connect
                    </Button>

                    <PaypalConnect
                        opened={paypalModalOpened}
                        onClose={() => setPaypalModalOpened(false)}
                        onSubmit={(clientId, clientSecret) => {
                            console.log('PayPal credentials:', { clientId, clientSecret });
                            setPaypalModalOpened(false);
                        }}
                    />
                </div>

                {/* PayPal Integration */}
                <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-2">
                            <img src={payment_paypal.src} alt="PayPal" className="h-6" />
                        </div>
                        <div className="text-sm text-gray-500">Your PayPal account email: {'Not connected'}</div>
                    </div>
                    <Button variant="filled" color="primary">
                        Manage
                    </Button>
                </div>

                {/* Currency Settings */}
                <div className="mt-8">
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
                </div>
            </div>
        </div>
    );
};

export default PaymentSetting;
