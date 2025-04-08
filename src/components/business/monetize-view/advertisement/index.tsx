'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import AdUnitList from '@/components/business/monetize-view/advertisement/ad-unit-list';
import AdUnitEdit from '@/components/business/monetize-view/advertisement/ad-unit-edit';
import AdsApi from '@/api/ads';
import { AdUnit } from '@/types/ads';
import { toast } from 'sonner';
import userStore from '@/store/useUserStore';

interface AdvertisementProps {
    initialAdUnits: AdUnit[];
}

const Advertisement: React.FC<AdvertisementProps> = ({ initialAdUnits }) => {
    const [adUnits, setAdUnits] = useState<AdUnit[]>(initialAdUnits);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingAdUnit, setEditingAdUnit] = useState<AdUnit | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { userInfo } = userStore();

    useEffect(() => {
        console.log('userInfo', userInfo);
    }, [userInfo]);

    const loadAdUnits = async () => {
        try {
            const response = await AdsApi.list({ siteId: userInfo?.website?.siteId ?? '' });
            if (response.code === 0) {
                setAdUnits(response.data.items);
            } else {
                toast.error('Failed to load ad units');
            }
        } catch (error) {
            console.error('Load ad units error:', error);
            toast.error('Failed to load ad units');
        }
    };

    const handleCreateAdUnit = async (adUnit: AdUnit) => {
        try {
            setIsLoading(true);
            const response = await AdsApi.create({
                ...adUnit,
                siteId: userInfo?.website?.siteId ?? '',
            });
            if (response.code === 0) {
                toast.success('Ad unit created successfully');
                loadAdUnits();
                setModalOpened(false);
            } else {
                toast.error('Failed to create ad unit');
            }
        } catch (error) {
            console.error('Create ad unit error:', error);
            toast.error('Failed to create ad unit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditAdUnit = async (adUnit: AdUnit) => {
        try {
            setIsLoading(true);
            const response = await AdsApi.modify(adUnit);
            if (response.code === 0) {
                toast.success('Ad unit updated successfully');
                loadAdUnits();
                setModalOpened(false);
            } else {
                toast.error('Failed to update ad unit');
            }
        } catch (error) {
            console.error('Update ad unit error:', error);
            toast.error('Failed to update ad unit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (adUnit: AdUnit, status: number) => {
        handleEditAdUnit({ ...adUnit, status });
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setEditingAdUnit(undefined);
    };

    return (
        <div className="h-full px-6 py-4 flex flex-col bg-layout rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Ad Units</h2>
                <Button onClick={() => setModalOpened(true)} className="bg-primary hover:bg-primary/90">
                    Create Ad Unit
                </Button>
            </div>

            <div className="flex-1 h-full">
                <AdUnitList
                    adUnits={adUnits}
                    onEdit={adUnit => {
                        setEditingAdUnit(adUnit);
                        setModalOpened(true);
                    }}
                    onStatusChange={handleStatusChange}
                />
            </div>

            {modalOpened && (
                <AdUnitEdit adUnitOld={editingAdUnit} onClose={handleCloseModal} onSave={editingAdUnit ? handleEditAdUnit : handleCreateAdUnit} isLoading={isLoading} />
            )}
        </div>
    );
};

export default Advertisement;
