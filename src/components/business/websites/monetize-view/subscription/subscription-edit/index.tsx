import React, { useState } from 'react';
import { TextInput, NumberInput, Select, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { SubscriptionData, SubscriptionStatus } from '@/types/subscription';
import { toast } from 'sonner';

interface SubscriptionEditProps {
    subscriptionOld?: SubscriptionData;
    onClose: () => void;
    onSave: (sub: SubscriptionData) => void;
    isLoading?: boolean;
}

const billingPeriodOptions = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
];

const SubscriptionEdit: React.FC<SubscriptionEditProps> = ({ subscriptionOld, onClose, onSave, isLoading = false }) => {
    const [form, setForm] = useState<SubscriptionData>({
        packageId: subscriptionOld?.packageId || '',
        siteId: subscriptionOld?.siteId || '',
        name: subscriptionOld?.name || '',
        interval: subscriptionOld?.interval || 'month',
        price: subscriptionOld?.price || 0,
        originalPrice: subscriptionOld?.originalPrice || 0,
        discountPercentage: subscriptionOld?.discountPercentage || 0,
        currency: subscriptionOld?.currency || 'USD',
        status: subscriptionOld?.status || SubscriptionStatus.Active,
        description: subscriptionOld?.description || '',
    });

    const isEdit = !!subscriptionOld;

    const handleChange = (field: keyof SubscriptionData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        if (!form.interval) return;
        if (form.price <= 0) {
            toast.error('Price must be greater than 0');
            return;
        };
        if (!form.originalPrice) {
            form.originalPrice = form.price;
        }
        if (form.originalPrice && form.originalPrice <= 0) return;
        if (form.originalPrice && form.originalPrice < form.price) {
            toast.error('Original price must be greater than price');
            return;
        };
        const discount = ((form.originalPrice! - form.price) / form.originalPrice!) * 100;
        form.discountPercentage = Math.round(discount);
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-screen flex flex-col">
                {/* Header */}
                <div className="flex-none">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-xl font-medium text-black-purple/90">{isEdit ? 'Edit Subscription' : 'Create Subscription'}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput label="Name" placeholder="Enter name" required value={form.name} onChange={e => handleChange('name', e.target.value)} variant="filled" />
                            <Select
                                label="Billing period"
                                value={form.interval}
                                data={billingPeriodOptions}
                                onChange={value => handleChange('interval', value)}
                                required
                                variant="filled"
                            />
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Price"
                                    placeholder="Enter discount price"
                                    value={form.originalPrice}
                                    onChange={value => handleChange('originalPrice', Number(value))}
                                    min={0}
                                    decimalScale={2}
                                    variant="filled"
                                    disabled={isEdit}
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Discount price"
                                    placeholder="Enter discount price"
                                    required
                                    value={form.price}
                                    onChange={value => handleChange('price', Number(value))}
                                    min={0}
                                    decimalScale={2}
                                    variant="filled"
                                    disabled={isEdit}
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>
                            <TextInput label="Description" placeholder="Enter description" value={form.description} onChange={e => handleChange('description', e.target.value)} variant="filled" />
                            <Select
                                label="Status"
                                value={form.status.toString()}
                                data={[
                                    { value: SubscriptionStatus.Active.toString(), label: 'Active' },
                                    { value: SubscriptionStatus.Paused.toString(), label: 'Paused' },
                                    { value: SubscriptionStatus.Deleted.toString(), label: 'Deleted' },
                                ]}
                                onChange={value => handleChange('status', Number(value))}
                                variant="filled"
                            />
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="flex-none border-t">
                        <div className="px-6 py-4">
                            <Button loading={isLoading} type="submit" fullWidth className="bg-primary hover:bg-primary/90">
                                {isEdit ? 'Save Changes' : 'Create Subscription'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionEdit; 