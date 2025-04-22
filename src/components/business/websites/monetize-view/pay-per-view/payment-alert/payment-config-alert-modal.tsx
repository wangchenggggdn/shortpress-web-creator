import React from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';

interface PaymentConfigAlertModalProps {
    opened: boolean;
    onClose: () => void;
    siteId: string;
}

const PaymentConfigAlertModal: React.FC<PaymentConfigAlertModalProps> = ({ opened, onClose, siteId }) => {
    const router = useRouter();

    const handleNavigateToPayment = () => {
        onClose();
        router.push(`/websites/${siteId}/payment-setting`);
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Payment Configuration Required" centered>
            <Text size="sm" mb="md">
                Before creating a new plan, you need to configure your payment method. Please set up your payment configuration first.
            </Text>
            <div className="flex justify-end gap-2">
                <Button variant="default" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleNavigateToPayment} className="bg-primary hover:bg-primary/90">
                    Go to Payment Settings
                </Button>
            </div>
        </Modal>
    );
};

export default PaymentConfigAlertModal;
