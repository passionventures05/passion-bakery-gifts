/**
 * Photos for the home-page gallery. Put image files in /public/gallery/ and list them here:
 *   { src: "/gallery/resin-coasters.webp", alt: "Ocean wave resin coaster set" },
 * While the list is empty the gallery shows an Instagram call-to-action instead.
 */
export interface GalleryImage {
  src: string;
  alt: string;
}

export const gallery: GalleryImage[] = [];
