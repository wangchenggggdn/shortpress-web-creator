'use client';

import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { toast } from 'sonner';
import userStore from '@/store/useUserStore';
import PlanList from './plan-list';
import PlanEdit from './plan-edit';

interface Plan {
    planId: string;
    name: string;
    coins: number;
    price: number;
    tips: string;
    status: PlanStatus;
}

enum PlanStatus {
    ACTIVE = 0,
    PAUSED = 1,
    ARCHIVED = 2,
}

interface PayPerViewProps {
    initialPlans?: Plan[];
}

const PayPerView: React.FC<PayPerViewProps> = ({ initialPlans = [] }) => {
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { userInfo } = userStore();

    const handleEditPlan = (plan: Plan) => {
        setEditingPlan(plan);
        setModalOpened(true);
    };

    const handleStatusChange = (plan: Plan, status: PlanStatus) => {
        // TODO: Implement API call
        const updatedPlan = { ...plan, status };
        const updatedPlans = plans.map(p => (p.planId === plan.planId ? updatedPlan : p));
        setPlans(updatedPlans);
        toast.success(`Plan status updated to ${PlanStatus[status]}`);
    };

    const handleSavePlan = (plan: Plan) => {
        setIsLoading(true);
        try {
            // TODO: Implement API call
            if (editingPlan) {
                const updatedPlans = plans.map(p => (p.planId === plan.planId ? plan : p));
                setPlans(updatedPlans);
                toast.success('Plan updated successfully');
            } else {
                const newPlan = { ...plan, planId: Date.now().toString() };
                setPlans([...plans, newPlan]);
                toast.success('Plan created successfully');
            }
        } catch (error) {
            console.error('Save plan error:', error);
            toast.error('Failed to save plan');
        } finally {
            setIsLoading(false);
            setModalOpened(false);
            setEditingPlan(undefined);
        }
    };

    return (
        <div className="h-full px-6 py-4 flex flex-col bg-layout rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Plans</h2>
                <Button onClick={() => setModalOpened(true)} className="bg-primary hover:bg-primary/90">
                    New Plan
                </Button>
            </div>

            <div className="flex-1 h-full">
                <PlanList plans={plans} onEdit={handleEditPlan} onStatusChange={handleStatusChange} />
            </div>

            {modalOpened && (
                <PlanEdit
                    planOld={editingPlan}
                    onClose={() => {
                        setModalOpened(false);
                        setEditingPlan(undefined);
                    }}
                    onSave={handleSavePlan}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default PayPerView;
