import WebsiteApi from '@/api/website';
import WebsiteSetting from '@/components/business/websites/setting';

interface SettingsPageProps {
    params: {
        siteId: string;
    };
}
const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
    const res = await WebsiteApi.get(params.siteId);
    console.log('website', res);
    if (res.code !== 0) return null;
    return <WebsiteSetting website={res.data} />;
};

export default SettingsPage;
