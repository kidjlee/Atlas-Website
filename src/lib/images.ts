import type { ImageMetadata } from 'astro';

const teamPhotos = import.meta.glob<{ default: ImageMetadata }>('../assets/team/*.{png,jpg,jpeg,webp}', {
  eager: true,
});

/** Looks up a therapist photo in src/assets/team/ by file name (without extension). */
export function teamPhoto(name: string): ImageMetadata | undefined {
  const match = Object.entries(teamPhotos).find(([path]) => path.split('/').pop()?.replace(/\.\w+$/, '') === name);
  return match?.[1].default;
}
