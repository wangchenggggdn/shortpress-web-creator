import React from 'react';
import CustomerList from '../../../../components/business/customerList';
import CustomerApi from '@/api/customer';
import userStore from '@/store/useUserStore';
import { IPaginationResponse } from '@/types/public';
import { Customer } from '@/types/customer';

interface CustomersPageProps {
    // 如果有props可以在这里定义
}

const CustomersPage: React.FC<CustomersPageProps> = async () => {
    async function getCustomers() {
        try {
            const { userInfo } = userStore.getState();
            const siteId = userInfo?.website?.siteId;

            if (!siteId) {
                throw new Error('Site ID not found');
            }

            const response = await CustomerApi.list({
                page: 1,
                pageSize: 20,
                siteId,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
        }
    }
    const initialData = await getCustomers();
    return <CustomerList initialData={initialData} />;
};

export default CustomersPage;
