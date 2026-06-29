'use client';

import React, { useContext, useState } from 'react';
import { Button, Table } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse } from '@/api/respones';
import dayjs from 'dayjs';
import Header from '@/components/system/header';
import { IconArrowLeft } from '@tabler/icons-react';
import ConfirmDialog from '@/components/common/confirm-dialog';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import { PaymentAPI } from '@/api/payment';
import { toast } from 'sonner';

interface TransactionDetailProps {
    transaction: AnalyticsResponse.IncomeTransactionInfo;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
    const router = useRouter();
    const { params } = useContext(SiteContext);
    const siteId = params.siteId;
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);

    const showCancelSubscription = !!transaction.subscriptionId && !subscriptionCancelled;

    const handleCancelSubscription = async () => {
        if (!transaction.subscriptionId || cancelling) {
            return;
        }

        setCancelling(true);
        try {
            const response = await PaymentAPI.cancelCustomerSubscription({
                siteId,
                subscriptionId: transaction.subscriptionId,
            });

            if (response.code === 0) {
                toast.success('Subscription cancelled successfully');
                setSubscriptionCancelled(true);
                setCancelDialogOpen(false);
                router.refresh();
            } else {
                toast.error(response.info || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            toast.error('Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div>
            <Header
                customTitle={
                    <div className="font-medium text-xl flex items-center gap-2">
                        <div
                            onClick={() => {
                                router.back();
                            }}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <IconArrowLeft size={20} />
                        </div>
                        <span className="text-black-purple/50">Analytics / Transactions / </span> Detail
                    </div>
                }
            />
            <div className="flex-1 min-h-0 px-6 flex flex-col">
                {/* Payment Amount */}
                <div className="my-6">
                    <h3 className="text-gray-500 mb-2">Payment</h3>
                    <div className="text-4xl font-bold text-primary">${transaction.amount.toFixed(2)} USD</div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Details</h2>

                        <div className="flex items-center gap-3">
                            {showCancelSubscription && (
                                <Button
                                    variant="outline"
                                    color="red"
                                    className="text-sm font-medium"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    Cancel Subscription
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    if (!transaction.userId) {
                                        return;
                                    }
                                    const identityEmail = transaction.email || transaction.payerEmail || transaction.userId;
                                    const encodedEmail = btoa(identityEmail);
                                    const urlSafeEmail = encodeURIComponent(encodedEmail);
                                    router.push(`../../customers/${urlSafeEmail}?userId=${encodeURIComponent(transaction.userId)}`);
                                }}
                                variant="outline"
                                className="text-sm font-medium"
                                disabled={!transaction.userId}
                            >
                                View Customer
                            </Button>
                        </div>
                    </div>
                    <Table withRowBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th className="text-black-purple/60">Account Email</Table.Th>
                                <Table.Th className="text-black-purple/60">Payment Email</Table.Th>
                                <Table.Th className="text-black-purple/60">Method</Table.Th>
                                <Table.Th className="text-black-purple/60">Plan</Table.Th>
                                <Table.Th className="text-black-purple/60">Date</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td className="text-black-purple/70">{transaction.email || '—'}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.payerEmail || '—'}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.provider}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.name}</Table.Td>
                                <Table.Td className="text-black-purple/70">{dayjs(transaction.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </div>
            </div>

            <ConfirmDialog
                opened={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onConfirm={handleCancelSubscription}
                title="Cancel Subscription"
                message="Are you sure you want to cancel this customer's subscription? This action cannot be undone."
                confirmText={cancelling ? 'Cancelling...' : 'Confirm'}
                cancelText="Back"
                confirmColor="red"
            />
        </div>
    );
};

export default TransactionDetail;
