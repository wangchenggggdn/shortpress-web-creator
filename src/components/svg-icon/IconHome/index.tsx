import React from 'react';

interface IProps {
    size?: number;
}

const IconHome: React.FC<IProps> = ({ size = 24 }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="home">
                <g id="home_2">
                    <g id="vuesax/linear/home">
                        <g id="home_3">
                            <path id="Vector" d="M12 18V15" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path
                                id="Vector_2"
                                d="M10.07 2.82009L3.13999 8.37009C2.35999 8.99009 1.85999 10.3001 2.02999 11.2801L3.35999 19.2401C3.59999 20.6601 4.95999 21.8101 6.39999 21.8101H17.6C19.03 21.8101 20.4 20.6501 20.64 19.2401L21.97 11.2801C22.13 10.3001 21.63 8.99009 20.86 8.37009L13.93 2.83009C12.86 1.97009 11.13 1.97009 10.07 2.82009Z"
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

export default IconHome;
