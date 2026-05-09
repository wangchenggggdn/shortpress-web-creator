'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronDown, IconTrash, IconPhoto, IconStarFilled, IconX, IconPlus, IconInfoCircle } from '@tabler/icons-react';
import { Menu, Switch, FileButton } from '@mantine/core';
import { Section } from '@/types/editor';
import { useSearchParams } from 'next/navigation';
import BaseSection from '../common/base-section';

// --- Constants & Config ---
const MODEL_CONFIG = {
    A4: { id: 'A4', name: 'A4', values: { textToVideo: 'A4_T2V', imageToVideo: 'A4_I2V' } },
    A2E: { id: 'A2E', name: 'A2E', values: { textToImage: 'A2E_T2I', imageToVideo: 'A2E_I2V' } },
};

// --- Style System ---
const S = {
    container: 'w-full h-full bg-black min-h-screen text-white flex flex-col font-sans',
    header: 'flex items-center px-4 py-3 bg-black relative',
    headerTitle: 'text-lg font-medium w-full',

    // Form Elements
    label: 'text-sm font-medium text-white mb-2 flex items-center gap-1',
    labelOptional: 'text-gray-500 font-normal text-xs ml-1',

    inputWrapper: 'relative w-full bg-[#1A1A1A] rounded-xl border border-[#333] overflow-hidden hover:border-[#22C58F] focus-within:border-[#22C58F] transition-colors',
    input: 'w-full bg-transparent text-white p-3 text-sm resize-none focus:outline-none placeholder-gray-500',

    dropdownTrigger:
        'w-full bg-[#1A1A1A] rounded-xl border border-[#333] p-3 flex items-center justify-between hover:border-[#22C58F] transition-colors data-[expanded=true]:border-[#22C58F]',

    // Option Buttons (Pills)
    optionGroup: 'flex gap-3',
    optionBtn: 'px-6 py-2.5 rounded-lg border text-sm font-medium transition-colors',
    optionBtnActive: 'border-[#22C58F] text-[#22C58F] bg-[rgba(34,197,143,0.1)]',
    optionBtnInactive: 'border-[#333] text-gray-400 hover:border-gray-500',

    // Tabs
    tabContainer: 'flex items-center px-4 border-b border-[#333] mb-4',
    tab: 'flex-1 py-3 text-sm font-medium relative text-center capitalize transition-colors',
    tabActive: 'text-[#22C58F]',
    tabInactive: 'text-gray-400 hover:text-gray-300',
    tabIndicator: 'absolute bottom-0 left-0 w-full h-[2px] bg-[#22C58F] rounded-t-sm',

    // Upload
    uploadBox:
        'relative w-full aspect-[16/9] bg-[#1A1A1A] rounded-xl overflow-hidden mb-2 border border-[#333] flex flex-col items-center justify-center transition-colors hover:border-[#22C58F]',
    uploadDashed: 'border-dashed',

    // Action Buttons
    generateBtn:
        'w-[220px] bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all',
    iconBtn: 'p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors',
};

// --- Reusable UI Components ---

const ParamLabel = ({ title, optional, info, required }: { title: string; optional?: boolean; info?: boolean; required?: boolean }) => (
    <div className={S.label}>
        {title}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className={S.labelOptional}>(Optional)</span>}
        {info && <IconInfoCircle size={14} className="text-gray-500" />}
    </div>
);

const DropdownSelect = <T,>({ label, value, options, onSelect, renderValue, renderOption, keyExtractor }: any) => {
    return (
        <div className="mb-4">
            {label && <ParamLabel title={label} />}
            <Menu
                shadow="md"
                width="target"
                classNames={{
                    dropdown: '!bg-[#1A1A1A] !border-[#333] !p-1',
                    item: '!text-gray-200 hover:!bg-[#333] data-[hovered]:!bg-[#333] !bg-transparent',
                }}
            >
                <Menu.Target>
                    <button className={S.dropdownTrigger}>
                        <div className="text-left w-full">{renderValue ? renderValue(value) : <div className="text-sm text-gray-300">{String(value)}</div>}</div>
                        <IconChevronDown size={20} className="text-gray-500" />
                    </button>
                </Menu.Target>
                <Menu.Dropdown>
                    {options.map((opt: any) => {
                        const key = keyExtractor ? keyExtractor(opt) : String(opt);
                        const isSelected = value === opt || (keyExtractor && keyExtractor(value) === key);
                        return (
                            <Menu.Item key={key} onClick={() => onSelect(opt)} data-selected={isSelected} className={isSelected ? '!bg-[#333]' : ''}>
                                {renderOption ? renderOption(opt, !!isSelected) : <div className="text-sm text-gray-200">{String(opt)}</div>}
                            </Menu.Item>
                        );
                    })}
                </Menu.Dropdown>
            </Menu>
        </div>
    );
};

const OptionGroup = <T extends string | number>({ label, value, options, onChange, formatter }: any) => (
    <div className="mb-4">
        <ParamLabel title={label} />
        <div className={S.optionGroup}>
            {options.map((opt: T) => (
                <button key={opt} onClick={() => onChange(opt)} className={`${S.optionBtn} ${value === opt ? S.optionBtnActive : S.optionBtnInactive}`}>
                    {formatter ? formatter(opt) : opt}
                </button>
            ))}
        </div>
    </div>
);

const ToggleRow = ({ label, checked, onChange, info }: any) => (
    <div className="flex items-center justify-between mb-4">
        <ParamLabel title={label} info={info} />
        <Switch
            checked={checked}
            onChange={event => onChange(event.currentTarget.checked)}
            color="teal"
            styles={{
                track: { backgroundColor: checked ? '#22C58F' : '#333', borderColor: 'transparent' },
                thumb: { backgroundColor: '#fff' },
            }}
        />
    </div>
);

// --- Main Component ---

interface CreateSectionProps {
    section: Section;
    pageId: string;
}

const CreateSection: React.FC<CreateSectionProps> = ({ section, pageId }) => {
    const searchParams = useSearchParams();

    // Determine initial tab from URL or default to 'text-to-image'
    const typeParam = searchParams.get('type');
    const [activeTab, setActiveTab] = useState<'text-to-image' | 'text-to-video' | 'image-to-video'>('text-to-image');

    // UI State
    const [selectedModel, setSelectedModel] = useState<any>(null); // Start null, allow effect to set default

    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState(false);
    const [refImages, setRefImages] = useState<{ file: File; isVideo: boolean }[]>([]);

    // Model Specific Params
    const [resolution, setResolution] = useState('1080P');
    const [duration, setDuration] = useState(5);
    const [a2eVideoDuration, setA2eVideoDuration] = useState(5);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [disableFaceEnhance, setDisableFaceEnhance] = useState(false);

    // Initial Tab Setup
    useEffect(() => {
        if (typeParam && ['text-to-image', 'text-to-video', 'image-to-video'].includes(typeParam)) {
            setActiveTab(typeParam as any);
        }
    }, [typeParam]);

    const availableModels = useMemo(() => {
        switch (activeTab) {
            case 'text-to-image':
                return [{ ...MODEL_CONFIG.A2E, name: 'Frame' }];
            case 'text-to-video':
                return [{ ...MODEL_CONFIG.A4, name: 'Reel' }];
            case 'image-to-video':
                return [
                    { ...MODEL_CONFIG.A4, name: 'Lite' },
                    { ...MODEL_CONFIG.A2E, name: 'Pro' },
                ];
            default:
                return [];
        }
    }, [activeTab]);

    // Automatically select the first model when the available models change (e.g., switching tabs)
    useEffect(() => {
        if (availableModels.length > 0) {
            setSelectedModel(availableModels[0]);
        }
    }, [availableModels]);

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            setIsVideo(file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.webm'));
        }
    };

    const handleRefImageUpload = (files: File[]) => {
        if (files.length) {
            const newFiles = files.map(file => ({
                file,
                isVideo: file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.webm'),
            }));
            setRefImages(prev => [...prev, ...newFiles].slice(0, 2));
        }
    };

    const price = useMemo(() => {
        if (!selectedModel) return 0;

        // A2E (Frame) Text-to-Image
        if (selectedModel.id === 'A2E' && activeTab === 'text-to-image') return 20;

        // A2E (Pro) Image-to-Video
        if (selectedModel.id === 'A2E' && activeTab === 'image-to-video') {
            if (a2eVideoDuration === 5) return 60;
            if (a2eVideoDuration === 10) return 120;
            if (a2eVideoDuration === 15) return 180;
            return 60;
        }

        // A4 (Reel/Lite)
        if (selectedModel.id === 'A4') {
            return 50;
        }

        return 0;
    }, [selectedModel, activeTab, a2eVideoDuration, duration]);

    if (!selectedModel) return null; // Prevent rendering before model selection

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className={S.container}>
                {/* Header */}
                <div className={S.header}>
                    <h2 className={S.headerTitle}>{section?.title || 'Create'}</h2>
                </div>

                {/* Tabs */}
                <div className={S.tabContainer}>
                    {['text-to-image', 'text-to-video', 'image-to-video'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`${S.tab} ${activeTab === tab ? S.tabActive : S.tabInactive}`}>
                            {tab.replace(/-/g, ' ')}
                            {activeTab === tab && <div className={S.tabIndicator} />}
                        </button>
                    ))}
                </div>

                <div className="flex-1 px-4 overflow-y-auto">
                    {/* Models Dropdown */}
                    <DropdownSelect
                        label="Models"
                        value={selectedModel}
                        options={availableModels}
                        onSelect={setSelectedModel}
                        keyExtractor={(opt: any) => opt.id}
                        renderValue={(opt: any) => <div className="text-sm text-gray-300">{opt.name}</div>}
                        renderOption={(opt: any) => <div className="text-sm text-gray-200">{opt.name}</div>}
                    />

                    {/* Prompt Input */}
                    <div className="mb-4">
                        <ParamLabel
                            title="Prompt"
                            optional={activeTab === 'image-to-video' && selectedModel?.id !== 'A2E'}
                            required={activeTab !== 'image-to-video' || selectedModel?.id === 'A2E'}
                        />
                        <div className={S.inputWrapper}>
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Type anything you want to draw..." className={`${S.input} h-32`} />
                            <button onClick={() => setPrompt('')} className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-300">
                                <IconTrash size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Conditional Fields based on Tab & Model */}

                    {/* A2E Text-to-Image */}
                    {activeTab === 'text-to-image' && selectedModel.id === 'A2E' && (
                        <>
                            <DropdownSelect label="Resolution" value={resolution} options={['1080P']} onSelect={setResolution} />

                            <div className="mb-4">
                                <ParamLabel title="Reference Images" optional />
                                <div className="p-4 border border-dashed border-[#333] rounded-xl bg-[#1A1A1A]">
                                    <div className="flex gap-4">
                                        {refImages.map((item, index) => (
                                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#333]">
                                                {item.isVideo ? (
                                                    <video src={URL.createObjectURL(item.file)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={URL.createObjectURL(item.file)} alt="Ref" className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    onClick={() => setRefImages(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                                                >
                                                    <IconX size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {refImages.length < 2 && (
                                            <FileButton onChange={handleRefImageUpload} accept="image/png,image/jpeg,image/webp,video/webm" multiple>
                                                {props => (
                                                    <button
                                                        {...props}
                                                        className="w-24 h-24 flex flex-col items-center justify-center border border-[#333] rounded-lg hover:bg-[#222] transition-colors text-gray-500"
                                                    >
                                                        <IconPlus size={24} />
                                                        <span className="text-xs mt-1">Upload</span>
                                                    </button>
                                                )}
                                            </FileButton>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 text-center">Support PNG, JPG, JPEG, WebP formats, up to 2 images, max 20MB each</div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Image Upload for Image-to-Video */}
                    {activeTab === 'image-to-video' && (
                        <div className="mb-4">
                            <ParamLabel title="Image" required />
                            <div className={`${S.uploadBox} ${!imageUrl ? S.uploadDashed : ''}`}>
                                {imageUrl ? (
                                    <>
                                        {isVideo ? (
                                            <video src={imageUrl} className="w-full h-full object-contain bg-black/50" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain bg-black/50" />
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,video/webm">
                                                {props => (
                                                    <button {...props} className={S.iconBtn}>
                                                        <IconPhoto size={18} />
                                                    </button>
                                                )}
                                            </FileButton>
                                            <button onClick={() => setImageUrl(null)} className={`${S.iconBtn} text-red-400`}>
                                                <IconX size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,video/webm">
                                        {props => (
                                            <button
                                                {...props}
                                                className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2 hover:bg-[#222] transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center">
                                                    <IconPhoto size={20} />
                                                </div>
                                                <span className="text-sm text-gray-400">Select Image/Video</span>
                                            </button>
                                        )}
                                    </FileButton>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Please upload the image according to the reference example to ensure optimal quality.</p>

                            <div className="grid grid-cols-4 gap-2 mt-3">
                                {Array.from({ length: 4 }).map((_, index) => {
                                    const img = section.params.extend?.exampleImages?.[index];
                                    return (
                                        <div
                                            key={index}
                                            className={`aspect-square rounded-lg overflow-hidden bg-[#1A1A1A] flex items-center justify-center border border-[#333] ${img ? 'cursor-pointer hover:border-[#22C58F]' : ''}`}
                                            onClick={() => img && setImageUrl(img)}
                                        >
                                            {img ? (
                                                img.toLowerCase().includes('.webm') ? (
                                                    <video src={img} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={img} className="w-full h-full object-cover" />
                                                )
                                            ) : (
                                                <IconPhoto size={28} className="text-gray-500" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Common Parameters */}
                    <DropdownSelect label="Aspect Ratio" value={aspectRatio} options={['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2']} onSelect={setAspectRatio} />

                    {/* Model Specific Params */}
                    {/* A4 Duration (Both T2V and I2V) */}
                    {selectedModel.id === 'A4' && (activeTab === 'text-to-video' || activeTab === 'image-to-video') && (
                        <div className="mt-4">
                            <OptionGroup label="Duration" value={duration} options={[5]} onChange={setDuration} formatter={(v: number) => `${v}s`} />
                        </div>
                    )}

                    {/* A2E Video Specifics */}
                    {activeTab === 'image-to-video' && selectedModel.id === 'A2E' && (
                        <div className="mt-4 space-y-6">
                            <OptionGroup label="Video Duration" value={a2eVideoDuration} options={[5, 10, 15]} onChange={setA2eVideoDuration} formatter={(v: number) => `${v}s`} />

                            <div>
                                <ParamLabel title="Negative Prompt (Undesired Effect)" required />
                                <div className={S.inputWrapper}>
                                    <textarea
                                        value={negativePrompt}
                                        onChange={e => setNegativePrompt(e.target.value)}
                                        placeholder="blurry, low quality, chaotic, deformed..."
                                        className={`${S.input} h-24`}
                                    />
                                </div>
                            </div>

                            <ToggleRow label="Disable Face Similarity Enhancement" checked={disableFaceEnhance} onChange={setDisableFaceEnhance} />
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="w-full py-4 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <button className={S.generateBtn}>
                            <span>Generate</span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span className="text-white/90 text-base">{price}</span>
                                <IconStarFilled size={16} className="text-[#FCD34D]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default CreateSection;
