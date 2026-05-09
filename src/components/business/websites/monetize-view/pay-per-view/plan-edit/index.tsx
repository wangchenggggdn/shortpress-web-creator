'use client';

import React, { useState } from 'react';
import { TextInput, NumberInput, Select, Button, Textarea, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { CoinPackage, PackageStatus } from '@/types/payment';
import { toast } from 'sonner';

interface PlanEditProps {
    planOld?: CoinPackage;
    onClose: () => void;
    onSave: (plan: CoinPackage) => void;
    isLoading?: boolean;
}

interface FormValues {
    name: string;
    coinAmount: number;
    originalPrice: number;
    discountPrice: number | null;
    discountPercentage: number;
    description: string;
    features: string[];
    status: PackageStatus;
}

const PlanEdit: React.FC<PlanEditProps> = ({ planOld, onClose, onSave, isLoading = false }) => {
    const [status, setStatus] = useState<PackageStatus>(planOld?.status || PackageStatus.Enabled);
    const form = useForm<FormValues>({
        initialValues: {
            name: planOld?.name || '',
            coinAmount: planOld?.coinAmount || 0,
            originalPrice: planOld?.originalPrice || 0,
            discountPrice: planOld?.price || null,
            discountPercentage: planOld?.discountPercentage || 0,
            description: planOld?.description || '',
            features: planOld?.features || [],
            status: status,
        },
        validate: {
            name: (value: string) => (value.length < 1 ? 'Plan name is required' : null),
            coinAmount: (value: number) => (value <= 0 ? 'Coins must be greater than 0' : null),
            originalPrice: (value: number) => (value < 0 ? 'Price cannot be negative' : null),
            discountPrice: (value: number | null, values: FormValues) => {
                if (value === null) return null;
                if (value < 0) return 'Discount price cannot be negative';
                if (value > values.originalPrice) return 'Discount price must be less than original price';
                return null;
            },
        },
    });

    const handleSubmit = (values: FormValues) => {
        console.log(values);
        if (values.discountPrice === 0) {
            toast.error('Discount price cannot be 0');
            return;
        }
        onSave({
            name: values.name,
            coinAmount: values.coinAmount,
            price: values.discountPrice ?? values.originalPrice,
            originalPrice: values.originalPrice,
            discountPercentage: values.discountPercentage,
            description: values.description,
            features: values.features,
            packageId: planOld?.packageId || '',
            siteId: planOld?.siteId || '',
            status: status,
        });
    };

    const isEdit = planOld !== undefined;

    // Calculate discount percentage when price or original price changes
    const handlePriceChange = (field: 'originalPrice' | 'discountPrice', value: number | null) => {
        form.setFieldValue(field, value);

        const originalPrice = field === 'originalPrice' ? value : form.values.originalPrice;
        const discountPrice = field === 'discountPrice' ? value : form.values.discountPrice;

        if (discountPrice === null) {
            form.setFieldValue('discountPercentage', 0);
            return;
        }

        const discount = ((originalPrice! - discountPrice) / originalPrice!) * 100;
        form.setFieldValue('discountPercentage', Math.round(discount));
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-screen flex flex-col">
                {/* Fixed Header */}
                <div className="flex-none">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-xl font-medium text-black-purple/90">{isEdit ? 'Edit Plan' : 'Create Plan'}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col flex-1 h-full overflow-hidden">
                    {/* Scrollable Form Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput label="Plan Name" placeholder="Enter plan name" required {...form.getInputProps('name')} variant="filled" />
                            <NumberInput
                                label="Coins"
                                placeholder="Enter coins amount"
                                required
                                allowDecimal={false}
                                allowNegative={false}
                                {...form.getInputProps('coinAmount')}
                                variant="filled"
                            />
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Price"
                                    placeholder="Enter price"
                                    required
                                    allowNegative={false}
                                    decimalScale={2}
                                    disabled={isEdit}
                                    {...form.getInputProps('originalPrice')}
                                    onChange={value => {
                                        handlePriceChange('originalPrice', Number(value));
                                    }}
                                    variant="filled"
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Discount Price"
                                    placeholder="Enter discount price"
                                    allowNegative={false}
                                    decimalScale={2}
                                    disabled={isEdit}
                                    {...form.getInputProps('discountPrice')}
                                    onChange={value => {
                                        handlePriceChange('discountPrice', value === '' ? null : Number(value));
                                    }}
                                    variant="filled"
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>
                            <NumberInput
                                label="Discount Percentage (%)"
                                placeholder="Enter discount percentage"
                                min={0}
                                max={100}
                                disabled={true}
                                {...form.getInputProps('discountPercentage')}
                                variant="filled"
                            />
                            <TextInput label="Description" placeholder="Enter description" {...form.getInputProps('description')} variant="filled" />
                            <div>
                                <label className="block text-sm font-medium mb-2 text-black-purple/90">Features</label>
                                <div className="space-y-2">
                                    {form.values.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <TextInput className="flex-1" placeholder="Enter feature" {...form.getInputProps(`features.${index}`)} variant="filled" />
                                            <div className="flex gap-1 items-center">
                                                <ActionIcon
                                                    variant="light"
                                                    color="gray"
                                                    disabled={index === 0}
                                                    onClick={() => {
                                                        const newList = [...form.values.features];
                                                        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                                                        form.setFieldValue('features', newList);
                                                    }}
                                                >
                                                    <IconArrowUp size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="gray"
                                                    disabled={index === form.values.features.length - 1}
                                                    onClick={() => {
                                                        const newList = [...form.values.features];
                                                        [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
                                                        form.setFieldValue('features', newList);
                                                    }}
                                                >
                                                    <IconArrowDown size={16} />
                                                </ActionIcon>
                                                <ActionIcon variant="light" color="red" onClick={() => form.removeListItem('features', index)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="light" leftSection={<IconPlus size={16} />} fullWidth onClick={() => form.insertListItem('features', '')}>
                                        Add Feature
                                    </Button>
                                </div>
                            </div>
                            <Select
                                label="Status"
                                value={status.toString()}
                                data={[
                                    { value: PackageStatus.Enabled.toString(), label: 'Enabled' },
                                    { value: PackageStatus.Disabled.toString(), label: 'Disabled' },
                                    { value: PackageStatus.Deleted.toString(), label: 'Deleted' },
                                ]}
                                onChange={value => {
                                    setStatus(Number(value));
                                    form.setFieldValue('status', Number(value));
                                }}
                                variant="filled"
                            />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex-none border-t">
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
