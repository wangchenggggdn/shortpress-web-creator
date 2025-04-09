'use client';
import { Website } from '@/types/website';
import CreateSiteModal from '../website-create-modal';
import Header from '@/components/system/header';
import PaymentSetting from '../payment-setting';
import { useState } from 'react';
import classNames from 'classnames';
import { WebsiteArgs } from '@/api/args';
import WebsiteApi from '@/api/website';
import { toast } from 'sonner';
import CreatorApi from '@/api/creator';
interface WebsiteSettingProps {
    website: Website;
}

const TABS = [
    { id: 'general', label: 'General' },
    { id: 'payments', label: 'Payments' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const WebsiteSetting: React.FC<WebsiteSettingProps> = ({ website }) => {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [loading, setLoading] = useState(false);
    /**
     * Handle website settings submission
     * @param args Website modification data
     * @param coverFile Optional logo file
     */
    const handleSubmit = async (args: WebsiteArgs.Modify, coverFile?: File) => {
        setLoading(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                args.logo = res.data ?? '';
            }
        }

        WebsiteApi.modify(args).then(res => {
            if (res.code === 0) {
                toast.success('save success');
            } else {
                toast.error(res.info);
            }
        });
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 min-h-0 px-6 flex flex-col pb-6">
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
                <div className="bg-white flex justify-start overflow-y-scroll rounded-lg p-6 h-full">
                    {activeTab === 'general' && (
                        <div className="w-full">
                            <CreateSiteModal loading={loading} isEdit={true} opened={true} onSubmit={handleSubmit} type="setting" websiteOld={website} />
                        </div>
                    )}
                    {activeTab === 'payments' && <PaymentSetting website={website} />}
                </div>
            </div>
        </div>
    );
};

export default WebsiteSetting;
