import { MONTHS, allSpeciesNames, species, type Species } from "@/lib/data";

export type MonthSeasonProfile = {
  month: number;
  name: string;
  slug: string;
  shortAnswer: string;
  lead: string;
  shift: string;
  fieldNote: string;
  preserveNote: string;
  featuredNames: string[];
  photoNames: string[];
};

export const MONTH_SEASON_PROFILES: MonthSeasonProfile[] = [
  {
    month: 8,
    name: "August",
    slug: "august",
    shortAnswer:
      "August is the handoff from summer stone fruit to figs, berries, early apples and pears, with tomatoes and several nuts joining the search.",
    lead:
      "Start with common fig, blackberry, tomato, elderberry, lime, almond, Guadalupe palm, and purslane. Those eight guides mark August as a typical peak, while apples, pears, grapes, plums, peaches, and peppers sit inside broader season windows.",
    shift:
      "Late-summer fruit is still broad, but the useful question changes from what has started to what is softening, dropping, or nearing the end of its run.",
    fieldNote:
      "A ripe fig should feel soft and droop at the neck. Elderberries need careful identification and cooking, and almond hulls should be splitting before the nut is worth checking.",
    preserveNote:
      "Freeze berries on a tray, dry figs once fully ripe, and keep bruised stone fruit for jam or compote rather than storage.",
    featuredNames: [
      "Common fig",
      "Blackberry",
      "Tomato",
      "Elderberry",
      "Almond",
      "Purslane",
    ],
    photoNames: ["Common fig", "Blackberry", "Elderberry"],
  },
  {
    month: 9,
    name: "September",
    slug: "september",
    shortAnswer:
      "September has the widest late-summer overlap: apples, pears, figs, grapes, guavas, prickly pear, tomatoes, peppers, squash, and early fall nuts can all be worth checking.",
    lead:
      "Fourteen guides list September as a typical peak, including apple, pear, common fig, grape, strawberry guava, prickly pear, crabapple, carob, and hazelnut. Blackberries and elderberries may still appear, but they are outside their narrower peak windows in the guide data.",
    shift:
      "Tree fruit and garden volunteers overlap with the first strong nut and pod signals. That makes September better for a mixed walk than a single-species trip.",
    fieldNote:
      "Pears are often picked firm and ripened indoors. Prickly pear fruit carries tiny glochids, and carob is used as the pod rather than the hard seed.",
    preserveNote:
      "Store sound apples cool, ripen pears on the counter, dry grapes or figs, and turn tart crabapples into jelly or a cider blend.",
    featuredNames: [
      "Apple",
      "Pear",
      "Common fig",
      "Grape",
      "Crabapple",
      "Hazelnut",
    ],
    photoNames: ["Apple", "Common fig", "Grape"],
  },
  {
    month: 10,
    name: "October",
    slug: "october",
    shortAnswer:
      "October is the strongest fall overlap in the guide data, combining late apples and pears with pomegranate, quince, pumpkin, walnuts, chestnuts, acorns, rosehips, and hawthorn.",
    lead:
      "Fourteen guides mark October as a typical peak. Pomegranate, pumpkin, walnut, pecan, quince, date palm, hawthorn, chestnut, oak, juniper, rose, California bay, lime, and lucuma lead the narrower peak list.",
    shift:
      "The center of gravity moves from soft summer fruit to fruit that cooks well and nuts that need drying, cracking, curing, roasting, or leaching.",
    fieldNote:
      "Quince is hard and astringent raw, chestnuts are cooked, and acorns must be leached before eating. Treat each preparation step as part of identification, not an optional recipe note.",
    preserveNote:
      "Dry walnuts and chestnuts correctly, cook quince into paste or compote, and keep sound apples and pears cool for later use.",
    featuredNames: [
      "Pomegranate",
      "Quince",
      "Walnut",
      "Chestnut",
      "Oak",
      "Rose",
    ],
    photoNames: ["Pomegranate", "Quince", "Chestnut"],
  },
  {
    month: 11,
    name: "November",
    slug: "november",
    shortAnswer:
      "November narrows toward persimmon, pineapple guava, strawberry tree, Pacific madrone, olives, California bay, late nuts, and cool-season greens.",
    lead:
      "Six guides list November as a typical peak: strawberry tree, Pacific madrone, persimmon, feijoa, olive, and California bay. Pomegranate, quince, walnut, chestnut, hawthorn, rosehips, and acorns remain inside broader season windows.",
    shift:
      "The easy summer abundance is gone. November rewards slower checks for fruit texture, windfall, cured or cooked uses, and late-season ground crops.",
    fieldNote:
      "Let feijoa drop when ripe, wait until Hachiya persimmons are jelly-soft, and never eat raw olives. Pacific madrone and strawberry-tree fruit are usually more useful cooked than eaten by the handful.",
    preserveNote:
      "Pulp soft persimmons, cook quince or madrone fruit, cure olives with a trusted method, and dry sound nuts before storage.",
    featuredNames: [
      "Strawberry tree",
      "Pacific madrone",
      "Persimmon",
      "Feijoa",
      "Olive",
      "California bay",
    ],
    photoNames: ["Persimmon", "Feijoa", "Strawberry tree"],
  },
  {
    month: 12,
    name: "December",
    slug: "december",
    shortAnswer:
      "December is a smaller winter list led by lemons, persimmons, magenta lilly pilly, other citrus, cool-season greens, and evergreen culinary herbs.",
    lead:
      "Lemon, persimmon, and magenta lilly pilly are the three December peaks in the guide data. Orange, kumquat, feijoa, olive, miner's lettuce, kale, chickweed, rosemary, and bay remain inside broader season windows.",
    shift:
      "Fruit variety drops sharply, while citrus, greens, and dependable leaves matter more. A winter walk is usually a short list of careful checks rather than a broad harvest sweep.",
    fieldNote:
      "Persimmon texture still depends on type, kumquats are eaten whole, and miner's lettuce favors cool, damp places. Avoid assuming that any evergreen hedge is culinary bay or rosemary.",
    preserveNote:
      "Turn citrus peel into zest before juicing, freeze persimmon pulp, and use tender winter greens promptly rather than trying to store them for long.",
    featuredNames: [
      "Lemon",
      "Persimmon",
      "Magenta lilly pilly",
      "Orange",
      "Kumquat",
      "Miner's lettuce",
    ],
    photoNames: ["Lemon", "Persimmon", "Miner's lettuce"],
  },
  {
    month: 1,
    name: "January",
    slug: "january",
    shortAnswer:
      "January is mainly a citrus-and-greens month in the climate-tuned calendar, with lemons, oranges, kumquats, kale, chickweed, miner's lettuce, and evergreen herbs worth checking.",
    lead:
      "Lemon, orange, kumquat, and kale are the four January peaks in the guide data. Persimmon, avocado, nasturtium, dandelion, wild mustard, wood sorrel, chickweed, rosemary, and bay sit inside broader winter windows.",
    shift:
      "The calendar resets around winter fruit and young greens. Smaller, repeatable finds replace the heavy fruit-and-nut overlap of early fall.",
    fieldNote:
      "Citrus color alone does not prove sweetness, and young greens are easier to use than older, tougher leaves. Check every hedge herb carefully before taking even a small amount.",
    preserveNote:
      "Juice or zest citrus soon after picking, blanch sturdy greens before freezing, and dry only herbs you have identified with confidence.",
    featuredNames: [
      "Lemon",
      "Orange",
      "Kumquat",
      "Kale",
      "Chickweed",
      "Miner's lettuce",
    ],
    photoNames: ["Orange", "Kumquat", "Kale"],
  },
];

export type MonthlySpeciesItem = {
  name: string;
  details: Species;
  isPeak: boolean;
};

export function monthProfileFromSlug(slug: string) {
  return MONTH_SEASON_PROFILES.find((profile) => profile.slug === slug) ?? null;
}

export function monthProfileFromNumber(month: number) {
  return MONTH_SEASON_PROFILES.find((profile) => profile.month === month) ?? null;
}

export function monthlySpecies(month: number): MonthlySpeciesItem[] {
  return allSpeciesNames()
    .filter((name) => species[name]?.edible && species[name].season.includes(month))
    .map((name) => ({
      name,
      details: species[name],
      isPeak: species[name].peak?.includes(month) ?? false,
    }))
    .sort((a, b) => Number(b.isPeak) - Number(a.isPeak) || a.name.localeCompare(b.name));
}

export function monthName(month: number) {
  return MONTHS[month - 1];
}
