import React, { useContext } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
interface PaymentConfigAlertModalProps {
    opened: boolean;
    onClose: () => void;
}

const PaymentConfigAlertModal: React.FC<PaymentConfigAlertModalProps> = ({ opened, onClose }) => {
    const router = useRouter();
    const { params } = useContext(SiteContext);
    const siteId = params?.siteId ?? '';

    const handleNavigateToPayment = () => {
        onClose();
        router.push(`/websites/${siteId}/settings`);
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
