export interface Review {
  avatar: string;
  name: string;
  stars: string;
  text: string;
  date: string;
}

/**
 * Customer reviews for the gift store. Add real reviews here, e.g.
 *   { avatar: "A", name: "Asha K", stars: "★★★★★", text: "Beautiful coasters!", date: "2 weeks ago" }
 * While the list is empty the Reviews section is hidden from the home page.
 */
export const reviews: Review[] = [];
