'use client';

import React, { useEffect, useState } from 'react';
import { IconArrowLeft, IconDotsVertical } from '@tabler/icons-react';
import Link from 'next/link';
import Header from '@/components/system/header';
import { Customer, CustomerStatus } from '@/types/customer';
import CustomerApi from '@/api/customer';
import { toast } from 'sonner';
import userStore from '@/store/useUserStore';
import LoadingData from '@/components/common/loadingData';
import { Card, Badge, Stack, Group, Menu, ActionIcon, Table } from '@mantine/core';
import dayjs from 'dayjs';

interface CustomerDetailPageProps {
    params: {
        customerId: string;
    };
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ params }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const { userInfo } = userStore();

    useEffect(() => {
        loadCustomerInfo();
    }, [params.customerId]);

    const getEmail = () => {
        const base64Email = decodeURIComponent(params.customerId);
        const decodedEmail = atob(base64Email);
        return decodedEmail;
    };
    const loadCustomerInfo = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.getInfo({
                email: getEmail(),
                siteId: userInfo?.website?.siteId ?? '',
            });
            setCustomer(response.data);
        } catch (error) {
            console.error('Failed to load customer info:', error);
            toast.error('Failed to load customer information');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case CustomerStatus.ACTIVE:
                return 'Active';
            case CustomerStatus.BLOCKED:
                return 'Blocked';
            case CustomerStatus.DELETED:
                return 'Deleted';
            default:
                return 'Unknown';
        }
    };

    const handleBlock = async () => {
        try {
            await handleChangeStatus(3);
            toast.success('Customer blocked successfully');
            loadCustomerInfo(); // Reload customer info
        } catch (error) {
            console.error('Failed to block customer:', error);
            toast.error('Failed to block customer');
        }
    };

    const handleDelete = async () => {
        await handleChangeStatus(127);
        try {
            toast.success('Customer deleted successfully');
            window.history.back();
        } catch (error) {
            console.error('Failed to delete customer:', error);
            toast.error('Failed to delete customer');
        }
    };

    const handleActive = async () => {
        await handleChangeStatus(2);
        try {
            toast.success('Customer activated successfully');
            loadCustomerInfo();
        } catch (error) {
            console.error('Failed to activate customer:', error);
            toast.error('Failed to activate customer');
        }
    };

    const handleChangeStatus = async (status: number) => {
        return await CustomerApi.changeStatus({
            email: customer?.email ?? '',
            siteId: userInfo?.website?.siteId ?? '',
            status: status, // Active status
        });
    };

    return (
        <div className="h-full flex flex-col">
            <Header
                customTitle={
                    <div className="flex items-center gap-4">
                        <h1 className="font-medium">
                            <span className="text-gray-500">Customers</span> {' / ' + getEmail()}
                        </h1>
                    </div>
                }
            />

            <div className="flex-1 min-h-0 p-6">
                <div className=" bg-layout rounded-lg border border-gray-200">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <LoadingData />
                        </div>
                    ) : customer ? (
                        <Table>
                            <Table.Thead></Table.Thead>
                            <Table.Tbody>
                                <Table.Tr>
                                    <div className="flex p-4 justify-between items-center">
                                        <div>
                                            <div className="text-sm text-gray-500">Email</div>
                                            <div className="text-base font-medium">{customer.email}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Status</div>
                                            <div
                                                className={`text-base font-medium ${customer.status === 2 ? 'text-green-500' : customer.status === 3 ? 'text-red-500' : 'text-gray-500'}`}
                                            >
                                                {getStatusLabel(customer.status)}
                                            </div>
                                        </div>
                                        <Menu>
                                            <Menu.Target>
                                                <IconDotsVertical size={16} className="cursor-pointer" />
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                {customer?.status === CustomerStatus.BLOCKED ? (
                                                    <Menu.Item color="green" onClick={handleActive}>
                                                        Active
                                                    </Menu.Item>
                                                ) : (
                                                    <Menu.Item color="text-black-purple" onClick={handleBlock}>
                                                        Block
                                                    </Menu.Item>
                                                )}
                                                {customer?.status !== CustomerStatus.DELETED && (
                                                    <Menu.Item color="red" onClick={handleDelete}>
                                                        Delete
                                                    </Menu.Item>
                                                )}
                                            </Menu.Dropdown>
                                        </Menu>
                                    </div>
                                </Table.Tr>
                                <Table.Tr>
                                    <div className="flex gap-8 p-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Registration Time</div>
                                            <div className="text-base font-medium">{dayjs(customer.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Last Login</div>
                                            <div className="text-base font-medium">{dayjs(customer.lastLoginAt * 1000).format('YYYY-MM-DD HH:mm')}</div>
                                        </div>
                                    </div>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-lg text-black-purple mb-2">Customer not found</div>
                                <div className="text-sm text-gray-500">The customer you're looking for doesn't exist or has been removed</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
