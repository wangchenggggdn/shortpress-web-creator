import React from 'react';
import { Modal, Button, CopyButton } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

interface ResetPasswordResultModalProps {
    opened: boolean;
    onClose: () => void;
    email: string;
    password: string;
}

const buildCredentialText = (email: string, password: string) => `Email: ${email}\nPassword: ${password}`;

const ResetPasswordResultModal: React.FC<ResetPasswordResultModalProps> = ({ opened, onClose, email, password }) => {
    const credentialText = buildCredentialText(email, password);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Password Reset Successfully"
            size="sm"
            centered
            styles={{
                inner: { padding: '20px' },
                content: { borderRadius: '8px' },
            }}
        >
            <div className="flex flex-col gap-4">
                <p className="text-sm text-black-purple/70">Please save the new credentials and share them with the customer securely.</p>
                <CopyButton value={credentialText} timeout={2000}>
                    {({ copied, copy }) => (
                        <button
                            type="button"
                            onClick={copy}
                            className="w-full rounded-lg border border-black-purple/10 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                        >
                            <p className="break-all text-sm text-black-purple">
                                <span className="text-black-purple/60">Email: </span>
                                {email}
                            </p>
                            <p className="mt-2 break-all text-sm text-black-purple">
                                <span className="text-black-purple/60">Password: </span>
                                {password}
                            </p>
                        </button>
                    )}
                </CopyButton>
                <div className="flex justify-end gap-2">
                    <CopyButton value={credentialText} timeout={2000}>
                        {({ copied, copy }) => (
                            <Button leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />} onClick={copy}>
                                {copied ? 'Copied' : 'Copy All'}
                            </Button>
                        )}
                    </CopyButton>
                    <Button variant="subtle" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ResetPasswordResultModal;
