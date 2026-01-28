import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const getPlaceholderImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};
