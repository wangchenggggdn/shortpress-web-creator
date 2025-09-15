import { Modal, Button } from '@mantine/core';

interface ConfirmDialogProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
}

const ConfirmDialog = ({
    opened,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this video? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmColor = 'red',
}: ConfirmDialogProps) => {
    return (
        <Modal opened={opened} onClose={onClose} title={title} centered radius="lg">
            <div className="space-y-4">
                <p>{message}</p>
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button color={confirmColor} onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
