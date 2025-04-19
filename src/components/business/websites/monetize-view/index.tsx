'use client';

import React, { useState } from 'react';
import Advertisement from '@/components/business/websites/monetize-view/advertisement';
import PayPerView from '@/components/business/websites/monetize-view/pay-per-view';
import classNames from 'classnames';
import Header from '@/components/system/header';

const TABS = [
    { id: 'advertisement', label: 'Advertisement' },
    { id: 'payPerView', label: 'Pay per View' },
    // { id: 'bundles', label: 'Bundles' },
    // { id: 'subscription', label: 'Subscription' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const MonetizeView: React.FC = () => {
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
                    {activeTab === 'advertisement' && <Advertisement />}

                    {activeTab === 'payPerView' && <PayPerView />}

                    {/* {activeTab === 'bundles' && <div className="text-center py-12 text-gray-500">Bundles feature coming soon</div>}

                    {activeTab === 'subscription' && <div className="text-center py-12 text-gray-500">Subscription feature coming soon</div>} */}
                </div>
            </div>
        </div>
    );
};

export default MonetizeView;
