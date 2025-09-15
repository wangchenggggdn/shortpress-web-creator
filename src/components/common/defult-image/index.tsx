import { IconPhoto } from "@tabler/icons-react";


interface DefultImageProps {
    poster: string;
    classNameSize?: string;
}

const DefultImage: React.FC<DefultImageProps> = ({
    poster,
    classNameSize = 'w-full h-full',
}) => {
    return <div className={`${classNameSize}`}>
    { poster ? (
            <img
                src={poster}
            alt="video cover"
            className="w-full h-full object-cover"
            onError={e => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                target.insertAdjacentHTML(
                  'afterend',
                                    `
                    <div class="w-full h-full bg-white/50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-photo-question" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M15 8h.01"></path>
                            <path d="M14.166 19.833l-.166 .167l-4 -4l-4 4v-13a3 3 0 0 1 3 -3h7a3 3 0 0 1 3 3v4.833"></path>
                            <path d="M19 22v.01"></path>
                            <path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
                        </svg>
                    </div>
                    `
                  );
            }}
        />
    ) : (
        <div className="w-full h-full bg-white/50 rounded-lg flex items-center justify-center ">
            <IconPhoto />
        </div>)}
    </div>;
}

export default DefultImage;

