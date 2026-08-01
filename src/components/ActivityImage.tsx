import type { CSSProperties } from 'react';
import type { ImagePosition } from '../types';

export const CARD_IMAGE_ASPECT = 3 / 2;

interface ActivityImageProps {
    src: string;
    alt: string;
    position?: ImagePosition | null;
    onError?: () => void;
}

function isUsable(p: ImagePosition | null | undefined): p is ImagePosition {
    return (
        !!p &&
        [p.x, p.y, p.width, p.height].every(n => typeof n === 'number' && Number.isFinite(n)) &&
        p.width > 0 &&
        p.height > 0
    );
}

export function positionStyle(p: ImagePosition): CSSProperties {
    return {
        width: `${10000 / p.width}%`,
        height: `${10000 / p.height}%`,
        left: `${-(p.x / p.width) * 100}%`,
        top: `${-(p.y / p.height) * 100}%`,
    };
}

export default function ActivityImage({ src, alt, position, onError }: ActivityImageProps) {
    if (!isUsable(position)) {
        return (
            <img
                src={src}
                alt={alt}
                referrerPolicy="no-referrer"
                onError={onError}
                className="absolute inset-0 w-full h-full object-cover"
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={onError}
            style={positionStyle(position)}
            className="absolute max-w-none"
        />
    );
}
