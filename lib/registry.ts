export type ComponentMeta = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
};

export const components: ComponentMeta[] = [
  {
    slug: "cube-word-stack",
    name: "Cube Word Stack",
    description:
      "White highlight blocks stacked vertically, each word a 3D cube that flips on hover. Floating ornaments drift outward when a nearby word flips.",
    tags: ["Web Component", "3D", "Hover"],
    category: "Text",
  },
  {
    slug: "staircase-reveal",
    name: "Staircase Reveal",
    description:
      "A full-screen solid cover made of N equal bands that slide out to the same side — each delayed by a fixed offset, sweeping a diagonal staircase across the screen. Direction randomises on every play.",
    tags: ["Transition", "Full-screen", "CSS"],
    category: "Transitions",
  },
];

export function getComponent(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug);
}

export const categories = [...new Set(components.map((c) => c.category))];
