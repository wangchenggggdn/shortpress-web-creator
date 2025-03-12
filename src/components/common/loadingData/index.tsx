import React from 'react';
import LoadingSVG from '../loadingSVG';

interface LoadingDataProps {
    className?: string;
}
const LoadingData: React.FC<LoadingDataProps> = ({ className = 'w-20 h-20' }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center ">
            <div className={className}>
                <LoadingSVG />
            </div>
        </div>
    );
};

export default LoadingData;
