import React from 'react';

interface IProps {
    size?: number;
}

const IconForYou: React.FC<IProps> = ({ size = 24 }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="vuesax/linear/lovely">
                <g id="vuesax/linear/lovely_2">
                    <g id="lovely">
                        <g id="Group">
                            <path
                                id="Vector"
                                d="M19.78 9.31009C19.83 8.92009 19.86 8.51009 19.86 8.09009C19.86 5.33009 17.64 3.1001 14.9 3.1001C13.28 3.1001 11.84 3.88009 10.93 5.09009C10.03 3.88009 8.58999 3.1001 6.95999 3.1001C4.21999 3.1001 2 5.33009 2 8.09009C2 14.3501 7.79 18.0301 10.38 18.9201C10.68 19.0301 11.18 19.0301 11.48 18.9201C11.53 18.9001 11.58 18.8901 11.63 18.8601M19.78 9.31009C19.32 9.11009 18.82 9.00009 18.29 9.00009C17.07 9.00009 15.99 9.59008 15.32 10.4901C14.64 9.59008 13.56 9.00009 12.34 9.00009C10.29 9.00009 8.63 10.6701 8.63 12.7401C8.63 15.4201 10.05 17.4701 11.63 18.8601M19.78 9.31009C21.09 9.89009 22 11.2001 22 12.7401C22 17.4201 17.67 20.1801 15.73 20.8401C15.5 20.9201 15.13 20.9201 14.9 20.8401C14.07 20.5601 12.8 19.8901 11.63 18.8601"
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

export default IconForYou;
