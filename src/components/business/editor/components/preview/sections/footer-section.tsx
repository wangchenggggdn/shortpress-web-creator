'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';

interface FooterSectionProps {
    section: Section;
    pageId: string;
}

const FooterSection: React.FC<FooterSectionProps> = ({ section, pageId }) => {
    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="bg-black text-white p-4">
                <div className="flex justify-center space-x-4 mb-4">
                    <a  className="hover:text-gray-300">Terms of Service</a>
                    <a  className="hover:text-gray-300">Privacy Policy</a>
                </div>
                <div className="text-center text-sm text-gray-400">
                    <p>© 2025 Dramahub.tv. All Rights reserved</p>
                    <p>Powered by ShortPress.com</p>
                </div>
            </div>
        </BaseSection>
    );
};

export default FooterSection; 