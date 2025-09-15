import React, { useState, useEffect } from 'react';
import { TextInput, Button } from '@mantine/core';
import { toast } from 'sonner';
import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';

interface AnalyticsSettingProps {
    website: Website;
    onSuccess?: () => void;
}

const AnalyticsSetting: React.FC<AnalyticsSettingProps> = ({ website, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [facebookPixelId, setFacebookPixelId] = useState('');
    const [thinkingdataAppId, setThinkingdataAppId] = useState('');

    useEffect(() => {
        const fetchSiteDetails = async () => {
            try {
                const res = await WebsiteApi.get(website.siteId);
                if (res.code === 0 && res.data) {
                    setGoogleAnalyticsId(res.data.googleAnalyticsId || '');
                    setFacebookPixelId(res.data.facebookPixelId || '');
                    setThinkingdataAppId(res.data.thinkingdataAppId || '');
                }
            } catch (error) {
                toast.error('Failed to fetch site details');
            }
        };

        fetchSiteDetails();
    }, [website.siteId]);

    const handleSubmit = async () => {
        const trimmedId = googleAnalyticsId.trim();
        const trimmedFacebookPixelId = facebookPixelId.trim();
        const trimmedThinkingdataAppId = thinkingdataAppId.trim();

        try {
            setLoading(true);
            const res = await WebsiteApi.modify({
                siteId: website.siteId,
                googleAnalyticsId: trimmedId,
                facebookPixelId: trimmedFacebookPixelId,
                thinkingdataAppId: trimmedThinkingdataAppId,
            });
            if (res.code === 0) {
                toast.success('updated successfully');
                onSuccess?.();
            } else {
                toast.error(res.info || 'Update failed');
            }
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-medium mb-2">Analytics</h2>
                <p className="text-gray-500 text-sm mb-4">Add third-party analytics tools to track your website data</p>
            </div>

            <div className="space-y-4">
                <TextInput
                    label="Google Analytics ID"
                    placeholder="Enter Google Analytics ID"
                    value={googleAnalyticsId}
                    onChange={e => setGoogleAnalyticsId(e.target.value)}
                    description="Enter your Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)"
                />

                <TextInput
                    label="Pixel ID"
                    placeholder="Enter Facebook Pixel ID"
                    value={facebookPixelId}
                    onChange={e => setFacebookPixelId(e.target.value)}
                    description="Enter your Facebook Pixel ID (e.g., 1234567890)"
                />

                <TextInput
                    label="ThinkingData AppId"
                    placeholder="Enter ThinkingData AppId"
                    value={thinkingdataAppId}
                    onChange={e => setThinkingdataAppId(e.target.value)}
                    description="Enter your ThinkingData AppId (e.g., b3bf631b0...8e7fbc8d1)"
                />

                <div className="flex justify-end">
                    <Button color="primary" loading={loading} onClick={handleSubmit}>
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSetting;
