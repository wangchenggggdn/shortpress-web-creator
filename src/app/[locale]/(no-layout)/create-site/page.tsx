import TemplateApi from '@/api/template';
import { Template } from '@/types/template';
import CreateSiteClient from './components/create-site-client';

const CreateSitePage: React.FC = async () => {
    let templateList: Template[] = [] as Template[];
    try {
        const res = await TemplateApi.getTemplateLists({
            page: 1,
            pageSize: 10,
        });
        if (res.code === 0 && res.data) {
            templateList = res.data.items;
        }
    } catch (error) {
        console.error(error);
    }
    return <CreateSiteClient templateList={templateList} />;
};

export default CreateSitePage;
