'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@mantine/core';
import { toast } from 'sonner';
import SubscriptionList from './subscription-list';
import SubscriptionEdit from './subscription-edit';
import { SubscriptionData, SubscriptionStatus } from '@/types/subscription';
import { SiteContext } from '../../useContext/site-context';
import { PaymentAPI } from '@/api/payment';

const SubscriptionView: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<SubscriptionData | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { params } = useContext(SiteContext);
    const [hasPaymentConfig, setHasPaymentConfig] = useState(false);
    const siteId = params.siteId;

    useEffect(() => {
        loadSubscriptions();
        checkPaymentConfig();
    }, [siteId]);

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

    // TODO: Replace with real API call
    const loadSubscriptions = async () => {
        try {
            const response = await PaymentAPI.getSubscriptionList({ siteId });
            setSubscriptions(response.data??[]);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
            toast.error('Failed to load subscriptions');
        }
    };

    const handleEditSubscription = (sub: SubscriptionData) => {
        setEditingSubscription(sub);
        setModalOpened(true);
    };

    const handleStatusChange = (sub: SubscriptionData, status: SubscriptionStatus) => {
        const updatedSub = { ...sub, status: status === SubscriptionStatus.Active ? 1 : 2 };
        const updatedList = subscriptions.map(s => (s.packageId === sub.packageId ? updatedSub : s));
        setSubscriptions(updatedList);
        toast.success(`Subscription status updated to ${status}`);
        PaymentAPI.modifySubscription({ siteId, packageId: sub.packageId??'', status: status === SubscriptionStatus.Active ? 1 : 2 });
    };

    const handleSaveSubscription = async (sub: SubscriptionData) => {
        setIsLoading(true);
        try {
            if (sub.packageId) {
                const updatedList = subscriptions.map(s => (s.packageId === sub.packageId ? sub : s));
                setSubscriptions(updatedList);
                toast.success('Subscription updated successfully');
                PaymentAPI.modifySubscription({ siteId, packageId: sub.packageId??'', status: sub.status });
            } else {
                const newSub = {
                    ...sub,
                    packageId: Math.random().toString(36).slice(2),
                    status: 1,
                };
                setSubscriptions([...subscriptions, newSub]);
                toast.success('Subscription created successfully');
                PaymentAPI.createSubscription({ ...sub, siteId });
            }
        } catch (error) {
            toast.error('Failed to save subscription');
        } finally {
            setIsLoading(false);
            setModalOpened(false);
            setEditingSubscription(undefined);
        }
    };

    const handleNewSubscriptionClick = () => {
        if (!hasPaymentConfig) {
            toast.error('Please configure payment method first');
            return;
        }
        setEditingSubscription(undefined);
        setModalOpened(true);
    };

    return (
        <div className="h-full px-6 py-4 flex flex-col bg-layout rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl font-medium text-gray-900">Subscriptions</h2>
                    <span className="text-sm text-gray-500">Subscribe to unlock all playlists</span>
                </div>
                <Button onClick={handleNewSubscriptionClick} className="bg-primary hover:bg-primary/90">
                    + New Subscription
                </Button>
            </div>

            <div className="flex-1 h-full">
                <SubscriptionList subscriptions={subscriptions} onEdit={handleEditSubscription} onStatusChange={handleStatusChange} />
            </div>

            {modalOpened && (
                <SubscriptionEdit
                    subscriptionOld={editingSubscription}
                    onClose={() => {
                        setModalOpened(false);
                        setEditingSubscription(undefined);
                    }}
                    onSave={handleSaveSubscription}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default SubscriptionView;
