import React from 'react';
import { Modal, NumberInput, Button } from '@mantine/core';

interface RefillCoinsModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => Promise<void>;
    initialAmount?: number;
}

const RefillCoinsModal: React.FC<RefillCoinsModalProps> = ({ opened, onClose, onConfirm, initialAmount = 100 }) => {
    const [amount, setAmount] = React.useState(initialAmount);

    const handleConfirm = async () => {
        await onConfirm(amount);
        setAmount(initialAmount); // Reset amount after confirm
    };

    const handleClose = () => {
        setAmount(initialAmount); // Reset amount when closing
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Refill Coins"
            size="sm"
            centered
            styles={{
                inner: {
                    padding: '20px',
                },
                content: {
                    borderRadius: '8px',
                },
            }}
        >
            <div className="flex flex-col gap-4">
                <NumberInput label="Amount of coins to add" value={amount} onChange={val => setAmount(Number(val))} min={1} step={100} placeholder="Enter amount" />
                <div className="flex justify-end gap-2">
                    <Button variant="subtle" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Confirm</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RefillCoinsModal;
