import React from 'react';

interface IProps {
    size?: number;
}

const IconTime: React.FC<IProps> = ({ size = 24 }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="clock">
                <g id="clock_2">
                    <g id="vuesax/linear/clock">
                        <g id="clock_3">
                            <path
                                id="Vector"
                                d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
                                stroke="white"
                                strokeOpacity="0.7"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                id="Vector_2"
                                d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51001"
                                stroke="white"
                                strokeOpacity="0.7"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default IconTime;
