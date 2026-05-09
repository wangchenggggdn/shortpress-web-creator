export interface Template {
    templateId: string;
    name: string;
    description: string;
    cover: string;
    version: number;
}

export interface TemplateListArgs {
    page?: number; // Page number, default 1
    pageSize?: number; // Items per page, default 10
}

export interface TemplateListResponse {
    items: Template[];
    page: number;
    pageSize: number;
    total: number;
}
