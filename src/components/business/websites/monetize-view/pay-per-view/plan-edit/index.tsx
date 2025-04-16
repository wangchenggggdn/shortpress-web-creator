'use client';

import React, { useState } from 'react';
import { TextInput, NumberInput, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX } from '@tabler/icons-react';
import { CoinPackage, PackageStatus } from '@/types/payment';

interface PlanEditProps {
    planOld?: CoinPackage;
    onClose: () => void;
    onSave: (plan: CoinPackage) => void;
    isLoading?: boolean;
}

const PlanEdit: React.FC<PlanEditProps> = ({ planOld, onClose, onSave, isLoading = false }) => {
    const [status, setStatus] = useState<PackageStatus>(planOld?.status || PackageStatus.Enabled);
    const form = useForm({
        initialValues: {
            name: planOld?.name || '',
            coinAmount: planOld?.coinAmount || 0,
            price: planOld?.originalPrice || 0,
            originalPrice: planOld?.price || 0,
            discountPercentage: planOld?.discountPercentage || 0,
            description: planOld?.description || '',
            status: status,
        },
        validate: {
            name: value => (value.length < 1 ? 'Plan name is required' : null),
            coinAmount: value => (value <= 0 ? 'Coins must be greater than 0' : null),
            price: value => (value < 0 ? 'Price cannot be negative' : null),
            originalPrice: (value, values) => {
                if (value <= 0) return 'Original price must be greater than 0';
                if (value < values.price) return 'Original price must be greater than current price';
                return null;
            },
            discountPercentage: (value, values) => {
                if (values.originalPrice <= 0) return 'Please set original price first';
                const calculatedDiscount = ((values.originalPrice - values.price) / values.originalPrice) * 100;
                if (Math.abs(calculatedDiscount - value) > 0.01) {
                    return 'Discount percentage does not match price difference';
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        onSave({
            ...values,
            packageId: planOld?.packageId || '',
            siteId: planOld?.siteId || '',
            status: status,
        });
    };

    const isEdit = planOld !== undefined;

    // Calculate discount percentage when price or original price changes
    const handlePriceChange = (field: 'price' | 'originalPrice', value: number) => {
        form.setFieldValue(field, value);
        if (field === 'price' && form.values.originalPrice > 0) {
            const discount = ((form.values.originalPrice - value) / form.values.originalPrice) * 100;
            form.setFieldValue('discountPercentage', Math.round(discount * 100) / 100);
        } else if (field === 'originalPrice' && value > 0) {
            const discount = ((value - form.values.price) / value) * 100;
            form.setFieldValue('discountPercentage', Math.round(discount * 100) / 100);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md flex flex-col h-screen">
                {/* Fixed Header */}
                <div className="flex-none border-b">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-medium text-black-purple/90">{isEdit ? 'Edit Plan' : 'Create Plan'}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                {/* Form with both content and submit button */}
                <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col flex-1">
                    {/* Scrollable Form Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput label="Plan Name" placeholder="Enter plan name" required {...form.getInputProps('name')} />
                            <NumberInput label="Coins" placeholder="Enter coins amount" required min={0} {...form.getInputProps('coinAmount')} />
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Price"
                                    placeholder="Enter price"
                                    required
                                    min={0}
                                    disabled={isEdit}
                                    onChange={value => {
                                        form.getInputProps('originalPrice').onChange(value);
                                        handlePriceChange('originalPrice', Number(value));
                                    }}
                                />
                                <span className="pt-5  text-gray-500">USD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Original Price"
                                    placeholder="Enter original price"
                                    min={0}
                                    disabled={isEdit}
                                    onChange={value => {
                                        form.getInputProps('price').onChange(value);
                                        handlePriceChange('price', Number(value));
                                    }}
                                />
                                <span className="pt-5  text-gray-500">USD</span>
                            </div>
                            <NumberInput
                                label="Discount Percentage"
                                placeholder="Enter discount percentage"
                                min={0}
                                max={100}
                                disabled={true}
                                {...form.getInputProps('discountPercentage')}
                            />
                            <TextInput label="Description" placeholder="Enter description" {...form.getInputProps('description')} />
                            <Select
                                label="Status"
                                value={status.toString()}
                                data={[
                                    { value: PackageStatus.Enabled.toString(), label: 'Enabled' },
                                    { value: PackageStatus.Disabled.toString(), label: 'Disabled' },
                                    { value: PackageStatus.Deleted.toString(), label: 'Deleted' },
                                ]}
                                onChange={value => setStatus(Number(value))}
                            />
                        </div>
                    </div>

                    {/* Fixed Footer with Submit Button */}
                    <div className="flex-none bg-white border-t">
                        <div className="px-6 py-4">
                            <Button loading={isLoading} type="submit" fullWidth className="bg-primary hover:bg-primary/90">
                                {isEdit ? 'Save Changes' : 'Create Plan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanEdit;
