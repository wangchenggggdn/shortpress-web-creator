'use client';

import React from 'react';
import { TextInput, NumberInput, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX } from '@tabler/icons-react';

enum PlanStatus {
    ACTIVE = 0,
    PAUSED = 1,
    ARCHIVED = 2,
}

interface Plan {
    planId: string;
    name: string;
    coins: number;
    price: number;
    discountPrice?: number;
    discountPercent?: number;
    tips: string;
    status: PlanStatus;
}

interface PlanEditProps {
    planOld?: Plan;
    onClose: () => void;
    onSave: (plan: Plan) => void;
    isLoading?: boolean;
}

const PlanEdit: React.FC<PlanEditProps> = ({ planOld, onClose, onSave, isLoading = false }) => {
    const form = useForm({
        initialValues: {
            name: planOld?.name || '',
            coins: planOld?.coins || 0,
            price: planOld?.price || 0,
            discountPrice: planOld?.discountPrice || 0,
            discountPercent: planOld?.discountPercent || 0,
            tips: planOld?.tips || '',
            status: planOld?.status || PlanStatus.ACTIVE,
        },
        validate: {
            name: value => (value.length < 1 ? 'Plan name is required' : null),
            coins: value => (value <= 0 ? 'Coins must be greater than 0' : null),
            price: value => (value < 0 ? 'Price cannot be negative' : null),
            discountPrice: (value, values) => {
                if (value > values.price) return 'Discount price cannot be higher than original price';
                if (value < 0) return 'Discount price cannot be negative';
                return null;
            },
            discountPercent: value => {
                if (value < 0 || value > 100) return 'Discount percent must be between 0 and 100';
                return null;
            },
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        onSave({
            planId: planOld?.planId || '',
            ...values,
        });
    };

    const isEdit = planOld !== undefined;

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

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput label="Plan Name" placeholder="Enter plan name" required {...form.getInputProps('name')} />
                            <NumberInput label="Coins" placeholder="Enter coins amount" required min={0} {...form.getInputProps('coins')} />
                            <div className="flex items-center gap-2">
                                <NumberInput className="flex-1" label="Price" placeholder="Enter price" required min={0} {...form.getInputProps('price')} />
                                <span className="pt-5  text-gray-500">USD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <NumberInput className="flex-1" label="Discount Price" placeholder="Enter discount price" min={0} {...form.getInputProps('discountPrice')} />
                                <span className="pt-5  text-gray-500">USD</span>
                            </div>
                            <NumberInput label="Discount Percent" placeholder="Enter discount percent" min={0} max={100} {...form.getInputProps('discountPercent')} />
                            <TextInput label="Tips" placeholder="Enter promotional message" {...form.getInputProps('tips')} />
                            <Select
                                label="Status"
                                data={[
                                    { value: PlanStatus.ACTIVE.toString(), label: 'Active' },
                                    { value: PlanStatus.PAUSED.toString(), label: 'Paused' },
                                    { value: PlanStatus.ARCHIVED.toString(), label: 'Archived' },
                                ]}
                                {...form.getInputProps('status')}
                            />
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex-none bg-white">
                    <div className="px-6 py-4">
                        <Button loading={isLoading} type="submit" fullWidth className="bg-primary hover:bg-primary/90">
                            {isEdit ? 'Save Changes' : 'Create Plan'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanEdit;
