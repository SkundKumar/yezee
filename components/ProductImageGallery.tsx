
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Image {
    id: number;
    src: string;
    alt: string;
}

interface Props {
    images: Image[];
}

export default function ProductImageGallery({ images }: Props) {
    const [mainImage, setMainImage] = useState(images[0]);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    const handleThumbnailClick = (image: Image) => {
        setOpacity(0);
        setTimeout(() => {
            setMainImage(image);
            setOpacity(1);
        }, 300); // This duration should match the CSS transition time
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                <Image
                    src="/placeholder.svg"
                    alt="Product image placeholder"
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-square w-full overflow-hidden rounded-md border">
                <Image
                    src={mainImage.src}
                    alt={mainImage.alt}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain transition-opacity duration-300 ease-in-out"
                    style={{ opacity: opacity }}
                />
            </div>
            <div className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className={`aspect-square w-full overflow-hidden rounded-md border cursor-pointer ${mainImage.id === image.id ? 'border-black' : 'border-gray-200'}`}
                        onClick={() => handleThumbnailClick(image)}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={100}
                            height={100}
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
