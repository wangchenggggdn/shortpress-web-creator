'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@mantine/core';
import { toast } from 'sonner';
import PlanList from './plan-list';
import PlanEdit from './plan-edit';
import { PaymentAPI } from '@/api/payment';
import { CoinPackage, PackageStatus } from '@/types/payment';
import { SiteContext } from '../../useContext/site-context';
import PaymentConfigAlertModal from './payment-alert/payment-config-alert-modal';

interface PayPerViewProps {
    siteId: string;
}

const PayPerView: React.FC<PayPerViewProps> = ({ siteId }) => {
    const [plans, setPlans] = useState<CoinPackage[]>([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingPlan, setEditingPlan] = useState<CoinPackage | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentConfigAlertOpened, setPaymentConfigAlertOpened] = useState(false);
    const [hasPaymentConfig, setHasPaymentConfig] = useState(false);
    const { params } = useContext(SiteContext);

    useEffect(() => {
        loadPlans();
        checkPaymentConfig();
    }, [siteId]);

    const loadPlans = async () => {
        const response = await PaymentAPI.getCoinPackageList({ siteId: params.siteId });
        if (response.code === 0 && response.data) {
            setPlans(response.data);
        }
    };

    const checkPaymentConfig = async () => {
        try {
            const response = await PaymentAPI.getConfig({ siteId });
            const hasConfig = !!(response.data?.stripe?.pk || response.data?.paypal?.clientId);
            setHasPaymentConfig(hasConfig);
        } catch (error) {
            console.error('Failed to check payment config:', error);
            toast.error('Failed to check payment configuration');
        }
    };

    const handleEditPlan = (plan: CoinPackage) => {
        setEditingPlan(plan);
        setModalOpened(true);
    };

    const handleStatusChange = (plan: CoinPackage, status: PackageStatus) => {
        // TODO: Implement API call
        const updatedPlan = { ...plan, status };
        const updatedPlans = plans.map(p => (p.packageId === plan.packageId ? updatedPlan : p));
        setPlans(updatedPlans);
        toast.success(`Plan status updated to ${PackageStatus[status]}`);
    };

    const handleSavePlan = async (plan: CoinPackage) => {
        setIsLoading(true);
        try {
            if (plan.packageId) {
                const updatedPlans = plans.map(p => (p.packageId === plan.packageId ? plan : p));
                setPlans(updatedPlans);
                toast.success('Plan updated successfully');
            } else {
                const response = await PaymentAPI.createCoinPackage({
                    siteId: params.siteId,
                    name: plan.name,
                    coinAmount: plan.coinAmount,
                    price: plan.price,
                    originalPrice: plan.originalPrice,
                    discountPercentage: plan.discountPercentage,
                    description: plan.description,
                });

                if (response.data?.packageId) {
                    const newPlan = {
                        ...plan,
                        packageId: response.data.packageId,
                        siteId: params.siteId,
                        status: PackageStatus.Enabled,
                    };
                    setPlans([...plans, newPlan]);
                    toast.success('Plan created successfully');
                }
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

    const handleNewPlanClick = () => {
        if (!hasPaymentConfig) {
            setPaymentConfigAlertOpened(true);
            return;
        }
        setModalOpened(true);
    };

    return (
        <div className="h-full px-6 py-4 flex flex-col bg-layout rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Plans</h2>
                <Button onClick={handleNewPlanClick} className="bg-primary hover:bg-primary/90">
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

            <PaymentConfigAlertModal opened={paymentConfigAlertOpened} onClose={() => setPaymentConfigAlertOpened(false)} siteId={siteId} />
        </div>
    );
};

export default PayPerView;
