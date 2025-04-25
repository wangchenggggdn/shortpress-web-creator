import React, { useState, useEffect } from 'react';
import { TextInput, Button } from '@mantine/core';
import { toast } from 'sonner';
import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';

interface DomainSettingProps {
    website: Website;
    onSuccess?: () => void;
}

const DomainSetting: React.FC<DomainSettingProps> = ({ website, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSiteDetails = async () => {
            try {
                const res = await WebsiteApi.get(website.siteId);
                if (res.code === 0 && res.data) {
                    setDomain(res.data.domain || '');
                }
            } catch (error) {
                toast.error('Failed to fetch site details');
            }
        };

        fetchSiteDetails();
    }, [website.siteId]);

    const validateDomain = (value: string) => {
        // Remove leading and trailing whitespace
        const trimmedValue = value.trim();

        // Domain validation regex
        const domainRegex = /^@?https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/;

        if (!domainRegex.test(trimmedValue)) {
            setError('Please enter a valid domain (e.g., https://example.com or @https://example.com)');
            return false;
        }

        setError('');
        return true;
    };

    const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDomain(value);
        validateDomain(value);
    };

    const handleSubmit = async () => {
        const trimmedDomain = domain.toLowerCase().trim();
        if (!validateDomain(trimmedDomain)) {
            return;
        }

        try {
            setLoading(true);
            const res = await WebsiteApi.modify({
                siteId: website.siteId,
                domain: trimmedDomain,
            });
            if (res.code === 0) {
                toast.success('Domain updated successfully');
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
                <h2 className="text-xl font-medium mb-2">Domain Settings</h2>
                <p className="text-gray-500 text-sm mb-4">
                    A URL will be generated automatically when your website is created. You can add your custom domain below.
                    <a href="#" className="text-primary ml-1">
                        Learn more
                    </a>
                </p>
            </div>

            <div className="space-y-4">
                <TextInput
                    label="Enter Domain"
                    placeholder="yourdomain.com or sub.yourdomain.com"
                    value={domain}
                    onChange={handleDomainChange}
                    error={error}
                    description="Enter your domain without http:// or https://, subdomain is allowed"
                />

                <div className="flex justify-end">
                    <Button color="primary" loading={loading} onClick={handleSubmit} disabled={!!error}>
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DomainSetting;
