import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';
import { getCachedConfig } from '@/utils/config';
import { ActionIcon, Button, CopyButton, TextInput, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { parse } from 'tldts';

interface DomainSettingProps {
    website: Website;
    onSuccess?: () => void;
}

const DomainSetting: React.FC<DomainSettingProps> = ({ website, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');
    const cached = getCachedConfig();

    const rootDomain = useMemo(() => {
        const sanitizedInput = domain.trim().replace(/^\.|\.$/g, '');
        const parsed = parse(sanitizedInput);
        if (!parsed.domain) return '';
        return parsed.domain;
    }, [domain]);

    const showTips = useMemo(() => {
        return cached?.nodeEnv === 'production' && rootDomain && !error;
    }, [cached?.nodeEnv, rootDomain, error]);

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

        // Domain validation regex - only allows pure domain names
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/;

        if (!domainRegex.test(trimmedValue)) {
            setError('Please enter a valid domain (e.g., example.com or sub.example.com)');
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
                    placeholder={`yourdomain.com`}
                    value={domain}
                    onChange={handleDomainChange}
                    error={error}
                    description="Enter your domain without http:// or https://, subdomain is allowed"
                />

                <div className={`flex items-center gap-4 ${showTips ? 'justify-between' : 'justify-end'}`}>
                    {showTips && (
                        <div className="flex gap-1 flex-col text-sm text-gray-500 max-w-[80%] ">
                            <p className="truncate"> You need to rerun the script in order to update your domain configuration:</p>
                            <div className="flex items-center gap-2">
                                <p className="truncate">{`sh ./deploy.sh --domain ${rootDomain}`}</p>
                                <CopyButton value={'sh ./deploy.sh --domain ' + rootDomain} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="left">
                                            <ActionIcon size="md" color={copied ? 'teal' : ''} variant="filled" onClick={copy}>
                                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </div>
                        </div>
                    )}
                    <Button color="primary" loading={loading} onClick={handleSubmit} disabled={!!error}>
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DomainSetting;
