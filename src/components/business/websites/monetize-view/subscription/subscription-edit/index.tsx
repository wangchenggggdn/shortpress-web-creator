import React, { useState } from 'react';
import { TextInput, NumberInput, Select, Button, ActionIcon, Group, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconPlus, IconTrash, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
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

const statusOptions = [
    { value: SubscriptionStatus.Active.toString(), label: 'Active' },
    { value: SubscriptionStatus.Paused.toString(), label: 'Paused' },
    { value: SubscriptionStatus.Deleted.toString(), label: 'Deleted' },
];

interface FormValues {
    name: string;
    interval: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    currency: string;
    status: number;
    description: string;
    coins: number;
    rights: string[];
}

const SubscriptionEdit: React.FC<SubscriptionEditProps> = ({ subscriptionOld, onClose, onSave, isLoading = false }) => {
    const isEdit = !!subscriptionOld;

    const form = useForm<FormValues>({
        initialValues: {
            name: subscriptionOld?.name || '',
            interval: subscriptionOld?.interval || 'month',
            price: subscriptionOld?.price || 0,
            originalPrice: subscriptionOld?.originalPrice || 0,
            discountPercentage: subscriptionOld?.discountPercentage || 0,
            currency: subscriptionOld?.currency || 'USD',
            status: subscriptionOld?.status || SubscriptionStatus.Active,
            description: subscriptionOld?.description || '',
            coins: subscriptionOld?.coins || 0,
            rights: subscriptionOld?.rights || [],
        },
        validate: {
            name: value => (!value ? 'Name is required' : null),
            interval: value => (!value ? 'Billing period is required' : null),
            price: value => (value <= 0 ? 'Price must be greater than 0' : null),
        },
    });

    const handleSubmit = (values: FormValues) => {
        if (!values.originalPrice) {
            values.originalPrice = values.price;
        }

        if (values.originalPrice < values.price) {
            toast.error('Original price must be greater than price');
            return;
        }

        const discount = ((values.originalPrice - values.price) / values.originalPrice) * 100;
        const finalValues: SubscriptionData = {
            ...subscriptionOld,
            ...values,
            discountPercentage: Math.round(discount),
            siteId: subscriptionOld?.siteId || '',
        };
        onSave(finalValues);
    };

    // Calculate discount percentage when price or original price changes
    const handlePriceChange = (field: 'originalPrice' | 'price', value: number) => {
        form.setFieldValue(field, value);

        const originalPrice = field === 'originalPrice' ? value : form.values.originalPrice;
        const discountPrice = field === 'price' ? value : form.values.price;

        if (originalPrice === 0) {
            form.setFieldValue('discountPercentage', 0);
            return;
        }

        const discount = ((originalPrice - discountPrice) / originalPrice) * 100;
        form.setFieldValue('discountPercentage', Math.round(discount));
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
                <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col flex-1 h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput label="Name" placeholder="Enter name" required {...form.getInputProps('name')} variant="filled" />

                            <Select label="Billing period" data={billingPeriodOptions} required disabled={isEdit} {...form.getInputProps('interval')} variant="filled" />

                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Original Price"
                                    placeholder="Enter original price"
                                    min={0}
                                    decimalScale={2}
                                    variant="filled"
                                    disabled={isEdit}
                                    {...form.getInputProps('originalPrice')}
                                    onChange={val => handlePriceChange('originalPrice', Number(val))}
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1"
                                    label="Discount Price"
                                    placeholder="Enter discount price"
                                    required
                                    min={0}
                                    decimalScale={2}
                                    variant="filled"
                                    disabled={isEdit}
                                    {...form.getInputProps('price')}
                                    onChange={val => handlePriceChange('price', Number(val))}
                                />
                                <span className="pt-5 text-gray-500">USD</span>
                            </div>

                            <NumberInput label="Coins" placeholder="Enter coins amount" min={0} variant="filled" {...form.getInputProps('coins')} />

                            <div>
                                <label className="block text-sm font-medium mb-2 text-black-purple/90">Benefits</label>
                                <div className="space-y-2">
                                    {form.values.rights.map((_, index) => (
                                        <div key={index} className="flex gap-2">
                                            <TextInput className="flex-1" placeholder="Enter benefit" {...form.getInputProps(`rights.${index}`)} variant="filled" />
                                            <div className="flex gap-1 items-center">
                                                <ActionIcon
                                                    variant="light"
                                                    color="gray"
                                                    disabled={index === 0}
                                                    onClick={() => {
                                                        const newList = [...form.values.rights];
                                                        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                                                        form.setFieldValue('rights', newList);
                                                    }}
                                                >
                                                    <IconChevronUp size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="gray"
                                                    disabled={index === form.values.rights.length - 1}
                                                    onClick={() => {
                                                        const newList = [...form.values.rights];
                                                        [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
                                                        form.setFieldValue('rights', newList);
                                                    }}
                                                >
                                                    <IconChevronDown size={16} />
                                                </ActionIcon>
                                                <ActionIcon variant="light" color="red" onClick={() => form.removeListItem('rights', index)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="light" leftSection={<IconPlus size={16} />} fullWidth onClick={() => form.insertListItem('rights', '')}>
                                        Add Benefit
                                    </Button>
                                </div>
                            </div>

                            <TextInput label="Description" placeholder="Enter description" {...form.getInputProps('description')} variant="filled" />

                            <Select
                                label="Status"
                                data={statusOptions}
                                value={form.values.status?.toString()}
                                onChange={val => form.setFieldValue('status', Number(val))}
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
