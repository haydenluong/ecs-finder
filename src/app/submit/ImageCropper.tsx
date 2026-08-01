import { useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { CARD_IMAGE_ASPECT } from '@/components/ActivityImage';
import type { ImagePosition } from '@/types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface ImageCropperProps {
    src: string;
    onChange: (position: ImagePosition) => void;
}

export default function ImageCropper({ src, onChange }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(MIN_ZOOM);

    function handleCropAreaChange(area: Area) {
        onChange({ x: area.x, y: area.y, width: area.width, height: area.height, zoom });
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-[3/2] rounded-[14px] overflow-hidden bg-sky border border-border">
                <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    aspect={CARD_IMAGE_ASPECT}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    showGrid
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropAreaChange={handleCropAreaChange}
                />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[12px] text-text-faint shrink-0">Phóng to</span>
                <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.05}
                    value={zoom}
                    aria-label="Phóng to ảnh"
                    onChange={e => setZoom(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                />
            </div>
            <span className="text-[12px] text-text-faint">
                Kéo để chọn khung ảnh · cuộn để phóng to
            </span>
        </div>
    );
}
