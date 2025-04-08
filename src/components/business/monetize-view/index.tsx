'use client';

import React, { useState } from 'react';
import Advertisement from '@/components/business/monetize-view/advertisement';
import { AdUnit } from '@/types/ads';
import classNames from 'classnames';
import Header from '@/components/system/header';

interface MonetizeViewProps {
    initialAdUnits: AdUnit[];
}

const TABS = [
    { id: 'advertisement', label: 'Advertisement' },
    { id: 'payPerView', label: 'Pay per View' },
    { id: 'bundles', label: 'Bundles' },
    { id: 'subscription', label: 'Subscription' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const MonetizeView: React.FC<MonetizeViewProps> = ({ initialAdUnits }) => {
    const [activeTab, setActiveTab] = useState<TabId>('advertisement');

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 min-h-0 px-6 flex flex-col">
                {/* Custom Navigation */}
                <div className="flex gap-4 my-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={classNames(
                                'px-4 py-2 text-base font-medium rounded-full transition-colors',
                                activeTab === tab.id ? 'text-primary border border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-900'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-0 mb-6">
                    {activeTab === 'advertisement' && <Advertisement initialAdUnits={initialAdUnits} />}

                    {activeTab === 'payPerView' && <div className="text-center py-12 text-gray-500">Pay per View feature coming soon</div>}

                    {activeTab === 'bundles' && <div className="text-center py-12 text-gray-500">Bundles feature coming soon</div>}

                    {activeTab === 'subscription' && <div className="text-center py-12 text-gray-500">Subscription feature coming soon</div>}
                </div>
            </div>
        </div>
    );
};

export default MonetizeView;
