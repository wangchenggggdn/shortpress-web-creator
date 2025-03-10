import React from 'react';
import LoadingSVG from '../loadingSVG';

const LoadingData: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center ">
            <div className="w-20 h-20">
                <LoadingSVG />
            </div>
        </div>
    );
};

export default LoadingData;
