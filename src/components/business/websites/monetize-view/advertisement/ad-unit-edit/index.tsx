'use client';

import React, { useState, useEffect } from 'react';
import { TextInput, Select, NumberInput, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { AdUnit, AdFormat, AdStatus, AdNetwork } from '@/types/ads';

interface AdUnitEditProps {
    /** Existing ad unit data for editing */
    adUnitOld?: AdUnit;
    /** Loading state for save button */
    isLoading?: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when form is submitted */
    onSave: (adUnit: AdUnit) => void;
}

const PAGE_FORMAT_MAP = [{ page: 'Home', format: AdFormat.DISPLAY, label: 'Home' }] as const;

const FORMAT_LABELS = ['', 'Display', 'Interstitial', 'Native', 'Rewarded'] as const;

const AdUnitEdit: React.FC<AdUnitEditProps> = ({ adUnitOld, onClose, onSave, isLoading = false }) => {
    const [adUnit, setAdUnit] = useState<AdUnit>(
        adUnitOld || {
            adNetwork: AdNetwork.GOOGLE,
            clientId: '',
            format: AdFormat.DISPLAY,
            frequency: 3,
            name: '',
            page: PAGE_FORMAT_MAP[0].page,
            siteId: '',
            status: AdStatus.ACTIVE,
            unitId: '',
        }
    );

    const [errors, setErrors] = useState<{
        name?: string;
        clientId?: string;
        unitId?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (!adUnit.name) newErrors.name = 'Name is required';
        if (!adUnit.clientId) newErrors.clientId = 'Client ID is required';
        if (!adUnit.unitId) newErrors.unitId = 'Ad Unit ID is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(adUnit);
        }
    };

    // Get format label for current page
    const getCurrentFormatLabel = (page: string) => {
        const pageFormat = PAGE_FORMAT_MAP.find(item => item.page === page);
        return FORMAT_LABELS[pageFormat?.format ?? 0];
    };

    // Auto set format when page changes
    const handlePageChange = (selectedPage: string) => {
        const pageFormat = PAGE_FORMAT_MAP.find(item => item.page === selectedPage);
        if (pageFormat) {
            setAdUnit(prev => ({
                ...prev,
                page: selectedPage,
                format: pageFormat.format,
            }));
        }
    };

    const isEdit = !adUnitOld === undefined;

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md flex flex-col h-screen">
                {/* Fixed Header */}
                <div className="flex-none border-b">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-medium text-black-purple/90">{isEdit ? 'Edit Ad Unit' : 'Create Ad Unit'}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex flex-col gap-6">
                            <TextInput
                                label="Name"
                                value={adUnit.name}
                                onChange={e => {
                                    setAdUnit({ ...adUnit, name: e.target.value });
                                    if (e.target.value) setErrors({ ...errors, name: undefined });
                                }}
                                required
                                error={errors.name}
                            />

                            <Select
                                label="Ad Network"
                                data={[
                                    { value: AdNetwork.GOOGLE, label: 'Google AdSense' },
                                    // { value: AdNetwork.FACEBOOK, label: 'Facebook Ads' },
                                    // { value: AdNetwork.ADMOB, label: 'AdMob' },
                                ]}
                                value={adUnit.adNetwork}
                                onChange={value => setAdUnit({ ...adUnit, adNetwork: value || AdNetwork.GOOGLE })}
                            />

                            <Select
                                label="Page"
                                data={PAGE_FORMAT_MAP.map(item => ({
                                    value: item.page,
                                    label: item.label,
                                }))}
                                value={adUnit.page}
                                onChange={value => handlePageChange(value || PAGE_FORMAT_MAP[0].page)}
                            />

                            <div>
                                <label className="text-sm font-medium">Format</label>
                                <div className="h-[36px] px-3 border rounded flex items-center bg-gray-50">{getCurrentFormatLabel(adUnit.page)}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Frequency</label>
                                <div className="flex flex-row items-center gap-2">
                                    One ad every
                                    <NumberInput className="w-20" value={adUnit.frequency} onChange={value => setAdUnit({ ...adUnit, frequency: Number(value) })} min={3} />
                                    videos
                                </div>
                            </div>

                            <TextInput
                                label="Client ID"
                                value={adUnit.clientId}
                                onChange={e => {
                                    setAdUnit({ ...adUnit, clientId: e.target.value });
                                    if (e.target.value) setErrors({ ...errors, clientId: undefined });
                                }}
                                required
                                error={errors.clientId}
                            />

                            <TextInput
                                label="Ad Unit ID"
                                value={adUnit.unitId}
                                onChange={e => {
                                    setAdUnit({ ...adUnit, unitId: e.target.value });
                                    if (e.target.value) setErrors({ ...errors, unitId: undefined });
                                }}
                                required
                                error={errors.unitId}
                            />

                            <Select
                                label="Status"
                                data={[
                                    { value: AdStatus.ACTIVE.toString(), label: 'Active' },
                                    { value: AdStatus.PAUSED.toString(), label: 'Paused' },
                                    { value: AdStatus.ARCHIVED.toString(), label: 'Archived' },
                                ]}
                                value={adUnit.status.toString()}
                                onChange={value => setAdUnit({ ...adUnit, status: Number(value) })}
                            />
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex-none bg-white">
                    <div className="px-6 py-4">
                        <Button loading={isLoading} fullWidth onClick={handleSave} className="bg-primary hover:bg-primary/90">
                            {isEdit ? 'Save Changes' : 'Create Ad Unit'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdUnitEdit;
