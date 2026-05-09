import fetch from '@/libs/fetch/fetch';
import { TemplateListArgs, TemplateListResponse } from '@/types/template';

/**
 * API class for template related operations
 */
export default class TemplateApi {
    /**
     * Get template list
     * @returns Promise with template list
     */
    static getTemplateLists(args: TemplateListArgs) {
        return fetch.get<TemplateListResponse>('/api/pages-builder/templates', args);
    }
}
