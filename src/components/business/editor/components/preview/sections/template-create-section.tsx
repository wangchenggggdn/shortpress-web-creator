import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import { IconBrandRumble, IconPhoto, IconRefresh, IconStarFilled, IconX } from '@tabler/icons-react';
import { FileButton } from '@mantine/core';
import { useState } from 'react';

interface TemplateSectionProps {
    section: Section;
    pageId: string;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({ section, pageId }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState(false);

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            setIsVideo(file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.webm'));
        }
    };

    const clearImage = () => {
        setImageUrl(null);
    };

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="w-full h-full bg-black min-h-screen text-white flex flex-col font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black">
                    <h2 className="text-lg font-medium">{section.title}</h2>
                </div>

                <div className="flex-1 px-4 overflow-y-auto">
                    {/* Result Preview Card */}
                    <div className="relative w-full aspect-[4/3] bg-[#1A1A1A] rounded-xl overflow-hidden mb-3 border border-[#333]">
                        {/* Placeholder for the result video/image */}
                        <div className="w-full h-full flex items-center justify-center bg-[#2A2A2A]">
                            <IconBrandRumble size={48} className="text-gray-500 mb-2" />
                        </div>

                        {/* Refresh Button */}
                        <button className="absolute top-3 right-3 p-1.5 bg-black/20 backdrop-blur-sm rounded-full pointer-events-auto">
                            <IconRefresh size={20} color="white" />
                        </button>
                    </div>

                    {/* Upload Card */}
                    <div
                        className={`relative w-full aspect-[4/3] bg-[#1A1A1A] rounded-xl overflow-hidden mb-4 border border-[#333] flex flex-col items-center justify-center group transition-colors ${!imageUrl ? 'border-dashed' : ''}`}
                    >
                        {imageUrl ? (
                            <>
                                {imageUrl.startsWith('blob:') && /* simple check for now, can improve if needed */ null}
                                {
                                    /* For blob URLs we might not know type easily without tracking file object, but user just uploaded it.
                                    However, we have imageUrl state string.
                                    Wait, in handleImageUpload we only setImageUrl.
                                    Ideally we should detect type from file. But here we only have URL.
                                    Actually URL.createObjectURL(file) creates a blob url.
                                    Let's check if we can infer or if we should modify state to hold file type.
                                    OR, since it's preview, maybe just render video if image fails? No.
                                    Let's check handleImageUpload. It receives `file`.
                                    We can check file.type there? No, we need to store it.
                                    Let's check lines 13-19. `setImageUrl(URL.createObjectURL(file))`.
                                    It's better to update the img tag to `<video>` if we know it is video.
                                    Since we don't store the file type in state, let's assume if the upload accepts video/webm, we might get one.
                                    Actually, for preview of *uploaded* file, we can just try to render as video if type suggests?
                                    Wait, `imageUrl` is just a string. 
                                    Let's update `handleImageUpload` or state?
                                    Actually, the user sees `imageUrl`.
                                    Let's look at how `feature-section` did it. It checked `item.cover` extension for .webm.
                                    But here it is a Blob URL (e.g. blob:http://localhost...). No extension.
                                    So we MUST check `file.type` or `file.name`.
                                    Line 15: `handleImageUpload = (file: File | null)`
                                    I should modify `handleImageUpload` or `setImageUrl` to also store type?
                                    Or simpler: Keep state `isVideo`.
                                    
                                    Let's check lines 13: `const [imageUrl, setImageUrl] = useState<string | null>(null);`
                                    I can add `const [isVideo, setIsVideo] = useState(false);`
                                    
                                    Wait, `multi_replace` can't easily insert new state variables unless I replace the whole component start.
                                    Lines 12-14:
                                    ```tsx
                                    const TemplateSection: React.FC<TemplateSectionProps> = ({ section, pageId }) => {
                                        const [imageUrl, setImageUrl] = useState<string | null>(null);
                                    ```
                                    I can replace line 13 with:
                                    ```tsx
                                        const [imageUrl, setImageUrl] = useState<string | null>(null);
                                        const [isVideo, setIsVideo] = useState(false);
                                    ```
                                    And update `handleImageUpload`.
                                    
                                    This seems robust.
                                    
                                    Chunk 1: Add `isVideo` state.
                                    Chunk 2: Update `handleImageUpload`.
                                    Chunk 3: Update `FileButton` props (lines 55, 68).
                                    Chunk 4: Update Preview (lines 53).
                                    Chunk 5: Update Reference Images (line 89) -> these are URLs from `section.params`, so check extension.
                                */
                                    imageUrl &&
                                        (isVideo ? (
                                            <video src={imageUrl} className="w-full h-full object-contain bg-black/50" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain bg-black/50" />
                                        ))
                                }
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,video/webm">
                                        {props => (
                                            <button {...props} className="p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors">
                                                <IconPhoto size={18} />
                                            </button>
                                        )}
                                    </FileButton>
                                    <button onClick={clearImage} className="p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-red-400 hover:bg-black/60 transition-colors">
                                        <IconX size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,video/webm">
                                {props => (
                                    <button {...props} className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3 hover:bg-[#222] transition-colors">
                                        <IconPhoto size={48} className="text-gray-500 mb-2" />
                                        <span className="text-base font-medium text-gray-400">Select Image/Video</span>
                                    </button>
                                )}
                            </FileButton>
                        )}
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-gray-400 mb-3 leading-tight">Please upload the image according to the reference example to ensure optimal quality.</p>

                    {/* Reference Images */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {Array.from({ length: 4 }).map((_, index) => {
                            const img = section.params.extend.exampleImages?.[index];
                            return (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-[#1A1A1A] flex items-center justify-center">
                                    {img ? (
                                        img.toLowerCase().includes('.webm') ? (
                                            <video src={img} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={img} alt={`Reference ${index}`} className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <IconPhoto size={28} className="text-gray-500 mb-2" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Generate Button */}
                    <div className="w-full py-4 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <button className="w-[220px] bg-[#10B981] text-white py-3.5 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors">
                            <span>Generate</span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span className="text-white/90 text-base">10</span>
                                <IconStarFilled size={16} className="text-[#FCD34D]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default TemplateSection;
