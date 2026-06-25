#!/usr/bin/env python3
"""Turn Falling Fruit CSV into a clean trees.json + species.json for Scrump.

Season data in the raw CSV is sparse (11/500 rows), so we join each point to a
curated species table with Mediterranean-climate harvest windows,
edible part, and a fermentation idea (Scrump's hook: forage -> ferment).
"""
import csv, json, re, os

RAW = os.path.join(os.path.dirname(__file__), "data_raw.csv")
OUT = os.path.join(os.path.dirname(__file__), "app", "assets", "data")

# seasonMonths = months (1-12) the fruit/edible is typically ready in a
# Mediterranean climate. peakMonths optional. edible=False -> ornamental / not worth foraging.
# cat: fruit | citrus | herb | green | flower | veg | nut
SPECIES = {
    "Sugar maple":        dict(edible=False, cat="ornamental", emoji="\U0001F341", part="—", season=[], note="Street tree. Not tapped for syrup in this climate.", ferment=None),
    "Norfolk island pine":dict(edible=False, cat="ornamental", emoji="\U0001F332", part="—", season=[], note="Ornamental conifer.", ferment=None),
    "Sydney golden wattle":dict(edible=False, cat="ornamental", emoji="\U0001F33F", part="—", season=[], note="Acacia. Skip — many wattles are mildly toxic raw.", ferment=None),
    "Strawberry tree":    dict(edible=True, cat="fruit", emoji="\U0001F353", part="Berries", season=[10,11,12], peak=[11], note="Arbutus unedo. Soft red berries, mealy-sweet when fully ripe.", ferment="Mash ripe berries into a fermented country wine or Portuguese-style medronho."),
    "Pacific madrone":    dict(edible=True, cat="fruit", emoji="\U0001F7E0", part="Berries", season=[10,11,12], peak=[11], note="Small orange-red berries. Edible, a bit mealy — best cooked.", ferment="Cook down and lacto-ferment into a tart fruit sauce."),
    "Lemon":              dict(edible=True, cat="citrus", emoji="\U0001F34B", part="Fruit", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[12,1,2,3], note="Backyard lemons fruit much of the year here.", ferment="Salt-pack into preserved lemons (lacto). 3-4 weeks to umami gold."),
    "Lime":               dict(edible=True, cat="citrus", emoji="\U0001F7E2", part="Fruit", season=[6,7,8,9,10,11], peak=[8,9,10], note="Backyard limes, peak late summer/fall.", ferment="Preserve in salt like lemons, or ferment into a lime kosho."),
    "Orange":             dict(edible=True, cat="citrus", emoji="\U0001F34A", part="Fruit", season=[12,1,2,3,4,5], peak=[1,2,3], note="Navels winter-spring; Valencias trail into summer.", ferment="Ferment the peel + flesh into a marmalade-adjacent preserve."),
    "Kumquat":            dict(edible=True, cat="citrus", emoji="\U0001F7E0", part="Whole fruit", season=[11,12,1,2,3,4], peak=[1,2], note="Eat whole, skin and all — sweet rind, tart flesh.", ferment="Salt-ferment whole, or fold into a fermented hot sauce."),
    "Apple":              dict(edible=True, cat="fruit", emoji="\U0001F34F", part="Fruit", season=[8,9,10], peak=[9], note="Look for public or permission-granted apple trees dropping fruit, and avoid sprayed or uncertain trees.", ferment="The original Scrump: press windfall apples into scrumpy cider."),
    "Pear":               dict(edible=True, cat="fruit", emoji="\U0001F350", part="Fruit", season=[8,9,10], peak=[9], note="Pick slightly firm and ripen on the counter.", ferment="Ferment into perry (pear cider) or a lacto pear hot sauce."),
    "European pear":      dict(edible=True, cat="fruit", emoji="\U0001F350", part="Fruit", season=[8,9,10], peak=[9], note="Pick firm, ripen indoors.", ferment="Perry, or pear + ginger water kefir soda."),
    "Common fig":         dict(edible=True, cat="fruit", emoji="\U0001FAD2", part="Fruit", season=[6,7,8,9,10], peak=[8,9], note="Breba crop early summer, main crop late summer. Ripe = soft and drooping.", ferment="Lacto-ferment whole figs, or make a fig vinegar from the surplus."),
    "Plum":               dict(edible=True, cat="fruit", emoji="\U0001FAD0", part="Fruit", season=[6,7,8], peak=[7], note="Ornamental plums fruit heavily in summer.", ferment="Salt-cure into umeboshi-style sour plums, or ferment plum wine."),
    "Peach":              dict(edible=True, cat="fruit", emoji="\U0001F351", part="Fruit", season=[6,7,8], peak=[7], note="Fragrant when ripe; bruises easily.", ferment="Lacto peaches for a tart topping, or a peach country wine."),
    "Nectarine":          dict(edible=True, cat="fruit", emoji="\U0001F351", part="Fruit", season=[6,7,8], peak=[7], note="Like peach, smooth-skinned.", ferment="Lacto-ferment slices, or ferment into a stone-fruit soda."),
    "Persimmon":          dict(edible=True, cat="fruit", emoji="\U0001F7E0", part="Fruit", season=[10,11,12,1], peak=[11,12], note="Hachiya must be jelly-soft; Fuyu eaten firm.", ferment="Ferment a persimmon vinegar — a Korean staple (gam-sikcho)."),
    "Loquat":             dict(edible=True, cat="fruit", emoji="\U0001F7E0", part="Fruit", season=[4,5,6], peak=[5], note="In season NOW. Sweet-tart, large seeds. Very common.", ferment="Loquat wine or liqueur; pit and lacto-ferment the flesh."),
    "Feijoa":             dict(edible=True, cat="fruit", emoji="\U0001F7E2", part="Fruit", season=[10,11,12], peak=[11], note="Pineapple guava. Let them drop — ripe fruit falls.", ferment="Scoop and ferment into a tropical-tasting soda or wine."),
    "Strawberry guava":   dict(edible=True, cat="fruit", emoji="\U0001F352", part="Fruit", season=[8,9,10], peak=[9], note="Small red guavas, eat skin and all.", ferment="Ferment into a pink fruit soda or vinegar."),
    "Guadalupe palm":     dict(edible=True, cat="fruit", emoji="\U0001F334", part="Dates", season=[7,8,9], peak=[8], note="Brahea edulis. Black date-like fruit, sweet.", ferment="Soak and ferment into a date wine."),
    "Grape":              dict(edible=True, cat="fruit", emoji="\U0001F347", part="Fruit", season=[8,9,10], peak=[9], note="Backyard arbors and fences. Taste before picking.", ferment="Wine, obviously — or verjus from unripe green clusters."),
    "Pomegranate":        dict(edible=True, cat="fruit", emoji="\U0001F7E5", part="Fruit", season=[9,10,11], peak=[10], note="Ripe when heavy and the skin turns leathery.", ferment="Ferment the juice into a tart wine or a pomegranate vinegar."),
    "Blackberry":         dict(edible=True, cat="fruit", emoji="⬛", part="Berries", season=[7,8,9], peak=[8], note="Himalayan blackberry is everywhere — creeks, fences, lots.", ferment="Wild blackberry soda (wild yeast), country wine, or shrub."),
    "Raspberry":          dict(edible=True, cat="fruit", emoji="\U0001F7E5", part="Berries", season=[6,7,8,9], peak=[7], note="Less common than blackberry; check garden edges.", ferment="Ferment a raspberry shrub or water-kefir soda."),
    "Sour cherry":        dict(edible=True, cat="fruit", emoji="\U0001F352", part="Fruit", season=[5,6], peak=[6], note="In season NOW. Tart — best cooked or preserved.", ferment="Ferment into a kriek-style sour, or salt-brine like a pickle."),
    "Prickly pear":       dict(edible=True, cat="fruit", emoji="\U0001F33B", part="Fruit + pads", season=[8,9,10], peak=[9], note="Tunas (fruit) late summer; nopales (pads) in spring. Mind the glochids.", ferment="Ferment the magenta juice into a soda, or lacto the pads."),
    "Olive":              dict(edible=True, cat="fruit", emoji="\U0001FAD2", part="Fruit (cure first)", season=[10,11,12], peak=[11], note="Street-tree olives are edible ONLY after curing — raw they're brutally bitter.", ferment="The whole point: brine-ferment them for weeks into table olives."),
    "Paper mulberry":     dict(edible=True, cat="fruit", emoji="\U0001F7E3", part="Berries", season=[5,6,7], peak=[6], note="Soft red-orange fruit, mild and sweet. Messy but edible.", ferment="Mash into a fermented fruit soda."),
    "Lucuma":             dict(edible=True, cat="fruit", emoji="\U0001F7E1", part="Fruit", season=[9,10,11], peak=[10], note="Rare here. Dry, maple-custard flavor when ripe.", ferment="Blend into a fermented cream or fruit leather."),
    "Nasturtium":         dict(edible=True, cat="flower", emoji="\U0001F33A", part="Leaves, flowers, seeds", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[3,4,5], note="Peppery leaves & flowers year-round here; green seed pods in spring/summer.", ferment="Brine-ferment the green seed pods into 'poor man's capers'."),
    "Miner's lettuce":    dict(edible=True, cat="green", emoji="\U0001F957", part="Leaves", season=[12,1,2,3,4,5], peak=[2,3], note="Native succulent green, mild. Loves shady, damp spots. Season ending now.", ferment="Best fresh in salad; not really a ferment."),
    "Fennel":             dict(edible=True, cat="herb", emoji="\U0001F33F", part="Fronds, pollen, seeds, bulb", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[5,6,7], note="Wild fennel grows everywhere. Fronds & pollen spring/summer, seeds in fall.", ferment="Ferment the bulb into a kraut, or seeds into a spiced brine."),
    "Rosemary":           dict(edible=True, cat="herb", emoji="\U0001F33F", part="Leaves", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[], note="Evergreen hedges everywhere. Snip year-round.", ferment="Layer into vegetable krauts and brined olives for aroma."),
    "Kale":               dict(edible=True, cat="green", emoji="\U0001F96C", part="Leaves", season=[10,11,12,1,2,3,4], peak=[1,2], note="Cool-season garden escapee. Sweeter after frost.", ferment="The classic: ferment into a kraut or kimchi."),
    "Tomato":             dict(edible=True, cat="veg", emoji="\U0001F345", part="Fruit", season=[7,8,9,10], peak=[8,9], note="Volunteer tomatoes in lots and curb strips, late summer.", ferment="Lacto-ferment for a tangy salsa or a fermented hot sauce base."),
    "Pepper":             dict(edible=True, cat="veg", emoji="\U0001F336", part="Fruit", season=[7,8,9,10], peak=[9], note="Garden escapees, late summer/fall.", ferment="The base of every great fermented hot sauce."),
    "Green bean":         dict(edible=True, cat="veg", emoji="\U0001FAD8", part="Pods", season=[6,7,8,9], peak=[7], note="Garden volunteer, summer.", ferment="Brine-ferment into dilly beans."),
    "Squash":             dict(edible=True, cat="veg", emoji="\U0001F383", part="Fruit", season=[8,9,10], peak=[9], note="Summer & winter squash from garden escapees.", ferment="Lacto-ferment summer squash like a cucumber pickle."),
    "Pumpkin":            dict(edible=True, cat="veg", emoji="\U0001F383", part="Fruit", season=[9,10,11], peak=[10], note="Fall garden volunteer.", ferment="Lacto-ferment cubes with warm spices."),
    "Magenta lilly pilly":dict(edible=True, cat="fruit", emoji="\U0001F7E3", part="Berries", season=[11,12,1], peak=[12], note="Syzygium. Crisp magenta berries, tart-sweet, faint clove note.", ferment="Ferment into a pink shrub or a tart soda."),
    # Common species added for the full Falling Fruit taxonomy (matched by keyword too)
    "Cherry":             dict(edible=True, cat="fruit", emoji="\U0001F352", part="Fruit", season=[5,6,7], peak=[6], note="Sweet cherries ripen late spring/early summer.", ferment="Ferment into a cherry soda or a kriek-style sour."),
    "Apricot":            dict(edible=True, cat="fruit", emoji="\U0001F351", part="Fruit", season=[5,6,7], peak=[6], note="Fragrant, soft when ripe; ripens early summer.", ferment="Lacto-ferment slices, or ferment a tart apricot wine."),
    "Mulberry":           dict(edible=True, cat="fruit", emoji="\U0001F7E3", part="Berries", season=[5,6,7], peak=[6], note="Black/red mulberries stain everything — ripe = falls at a touch.", ferment="Mulberry wine, or a wild-yeast mulberry soda."),
    "Walnut":             dict(edible=True, cat="nut", emoji="\U0001F90E", part="Nuts", season=[9,10,11], peak=[10], note="Drop in fall; husk stains hands. Dry before cracking.", ferment="Pick green in spring to ferment 'nocino'-style; or lacto green walnuts."),
    "Almond":             dict(edible=True, cat="nut", emoji="\U0001F330", part="Nuts", season=[8,9], peak=[8], note="Splitting hulls in late summer. Avoid bitter (wild) almonds.", ferment="Soak and ferment into a cultured almond cheese or milk."),
    "Pecan":              dict(edible=True, cat="nut", emoji="\U0001F90E", part="Nuts", season=[10,11], peak=[10], note="Fall drop; dry and crack.", ferment="Best roasted; not typically fermented."),
    "Elderberry":         dict(edible=True, cat="fruit", emoji="\U0001FAD0", part="Berries (cook first)", season=[8,9], peak=[8], note="Flowers late spring, berries late summer. Cook berries — raw are mildly toxic.", ferment="Elderflower 'champagne' (wild soda) in spring; elderberry wine in fall."),
    "Quince":             dict(edible=True, cat="fruit", emoji="\U0001F7E1", part="Fruit (cook first)", season=[10,11], peak=[10], note="Hard and astringent raw; aromatic when cooked.", ferment="Ferment into a quince vinegar or a spiced shrub."),
    "Avocado":            dict(edible=True, cat="fruit", emoji="\U0001F7E2", part="Fruit", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[3,4,5], note="Backyard trees fruit much of the year in the Bay Area.", ferment="Not a ferment — but the leaves flavor some braises."),
    "Crabapple":          dict(edible=True, cat="fruit", emoji="\U0001F34F", part="Fruit", season=[9,10], peak=[9], note="Small, tart apples. Great for jelly and cider blends.", ferment="High-pectin addition to apple cider; or a tart crabapple shrub."),
    # Usable (non-fruit) trees & herbs
    "California bay":      dict(edible=True, cat="herb", emoji="\U0001F33F", part="Leaves + nuts", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[10,11], note="California bay / pepperwood (Umbellularia). One leaf does the work of two regular bay leaves — potent. 'Bay nuts' ripen in fall.", ferment="Tuck a leaf into brines and krauts for aroma."),
    "Bay laurel":         dict(edible=True, cat="herb", emoji="\U0001F33F", part="Leaves", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[], note="Culinary bay (Laurus nobilis). Common hedge — pick a few leaves anytime.", ferment="Drop a leaf into pickle brines and krauts."),
    "Carob":              dict(edible=True, cat="fruit", emoji="\U0001F7EB", part="Pods", season=[8,9,10], peak=[9], note="Long leathery brown pods on a common street tree. Sweet, roasted-malt flavor — a caffeine-free cocoa substitute. Roast and grind the pods (not the hard seeds).", ferment=None),
    "Date palm":          dict(edible=True, cat="fruit", emoji="\U0001F334", part="Dates", season=[9,10,11], peak=[10], note="Tall feather palm. Dates ripen amber to brown in fall; many ornamental palms fruit lightly.", ferment=None),
    "Pindo palm":         dict(edible=True, cat="fruit", emoji="\U0001F334", part="Fruit", season=[6,7,8], peak=[7], note="Jelly palm (Butia). Yellow-orange fruit, tangy-sweet and fibrous — eat fresh or strain.", ferment=None),
    "Hawthorn":           dict(edible=True, cat="fruit", emoji="\U0001F534", part="Haws (berries)", season=[9,10,11], peak=[10], note="Thorny tree/shrub. Small red haws, mild apple-rosehip flavor. Don't eat the seeds.", ferment=None),
    "Hazelnut":           dict(edible=True, cat="nut", emoji="\U0001F330", part="Nuts", season=[9,10], peak=[9], note="Filbert. Husked nuts drop in early fall — beat the squirrels.", ferment=None),
    "Chestnut":           dict(edible=True, cat="nut", emoji="\U0001F330", part="Nuts", season=[10,11], peak=[10], note="Spiny burrs split to drop glossy nuts. Always cooked, never raw.", ferment=None),
    "Oak":                dict(edible=True, cat="nut", emoji="\U0001F330", part="Acorns", season=[9,10,11], peak=[10], note="Acorns MUST be leached of tannins (cold or hot water) before eating — never raw.", ferment=None),
    "Juniper":            dict(edible=True, cat="herb", emoji="\U0001F332", part="Berries", season=[9,10,11], peak=[10], note="Use the ripe blue berries as a spice (that gin aroma). A few go a long way; some species are better than others.", ferment=None),
    "Rose":               dict(edible=True, cat="fruit", emoji="\U0001F339", part="Hips + petals", season=[9,10,11], peak=[10], note="Rosehips ripen red in fall (sweeter after frost); fragrant petals in late spring. Strip the irritating seeds/hairs from hips.", ferment=None),
    "Dandelion":          dict(edible=True, cat="green", emoji="\U0001F33C", part="Leaves, flowers, root", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[3,4], note="The whole plant is edible. Young leaves are least bitter; flowers fry up, roots roast like chicory.", ferment=None),
    "Wild mustard":       dict(edible=True, cat="green", emoji="\U0001F33C", part="Leaves, flowers, seeds", season=[1,2,3,4,5,11,12], peak=[3,4], note="Peppery greens and bright flowers in the cool months; collect seeds to make mustard.", ferment=None),
    "Mallow":             dict(edible=True, cat="green", emoji="\U0001F33F", part="Leaves + fruit", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[4,5], note="Mild, slightly mucilaginous leaves; the little round 'cheeses' (fruit) are edible too.", ferment=None),
    "Wood sorrel":        dict(edible=True, cat="green", emoji="\U0001F33F", part="Leaves, flowers", season=[1,2,3,4,5,6,7,8,9,10,11,12], peak=[3,4,5], note="Bright lemony leaves and yellow flowers (oxalis). A lovely sour garnish — use in moderation.", ferment=None),
    "Chickweed":          dict(edible=True, cat="green", emoji="\U0001F33F", part="Leaves, stems", season=[11,12,1,2,3,4], peak=[2,3], note="Mild cool-season green with a corn-silk taste. Best raw in salads.", ferment=None),
    "Plantain":           dict(edible=True, cat="green", emoji="\U0001F33F", part="Leaves, seeds", season=[3,4,5,6,7,8,9,10], peak=[5,6], note="Broadleaf plantain (the weed, not the banana). Young leaves cooked; seeds are psyllium.", ferment=None),
    "Purslane":           dict(edible=True, cat="green", emoji="\U0001F33F", part="Leaves, stems", season=[6,7,8,9], peak=[7,8], note="Succulent, lemony, crunchy and omega-3 rich. Great raw or quickly cooked.", ferment=None),
}

# Ways to eat / use each species (NOT fermentation — that's revealed separately).
USES = {
    "Strawberry tree": ["Eat the ripe red berries straight off the tree", "Cook into a soft jam or fruit paste", "Fold into muffins and quick breads"],
    "Pacific madrone": ["Best cooked into a sauce or syrup", "Dry and grind the berries into a meal", "Steep into a tea"],
    "Lemon": ["Juice over everything; zest into baking", "Slice into water or tea", "Make lemonade or lemon curd"],
    "Lime": ["Squeeze over tacos, fish and fruit", "Zest into desserts", "Limeade or a fresh marinade"],
    "Orange": ["Eat fresh in segments", "Fresh-squeezed juice", "Candy the peel; zest into cakes"],
    "Kumquat": ["Eat whole, skin and all", "Slice into salads", "Simmer into marmalade"],
    "Apple": ["Eat fresh; slice with nut butter", "Bake into pies, crisps and sauce", "Press into fresh juice"],
    "Pear": ["Eat ripe and raw", "Poach in wine or spices", "Roast alongside savory dishes"],
    "European pear": ["Eat ripe and raw", "Poach in wine or spices", "Roast alongside savory dishes"],
    "Common fig": ["Eat fresh, warm off the tree", "Roast with honey", "Dry for later; bake into tarts"],
    "Plum": ["Eat fresh and ripe", "Bake into cakes and crumbles", "Cook into a quick jam"],
    "Peach": ["Eat fresh over the sink", "Grill in halves", "Bake into cobbler or pie"],
    "Nectarine": ["Eat fresh", "Slice into salads", "Roast or grill"],
    "Persimmon": ["Fuyu: eat firm like an apple", "Hachiya: scoop when jelly-soft", "Bake into pudding or bread"],
    "Loquat": ["Eat fresh; spit the big seeds", "Poach into a light syrup", "Bake into a tart or crumble"],
    "Feijoa": ["Scoop the jelly center with a spoon", "Blend into smoothies", "Bake into muffins"],
    "Strawberry guava": ["Eat whole, skin and all", "Blend into juice", "Cook into jelly"],
    "Guadalupe palm": ["Eat the sweet date-like flesh", "Dry like dates", "Simmer into syrup"],
    "Grape": ["Eat fresh off the vine", "Roast with meats", "Press into juice or verjus"],
    "Pomegranate": ["Eat the arils by the spoonful", "Scatter over salads and yogurt", "Juice for grenadine"],
    "Blackberry": ["Eat fresh and warm", "Bake into cobbler or pie", "Cook into jam or syrup"],
    "Raspberry": ["Eat fresh", "Mash into a quick sauce", "Bake into muffins or tarts"],
    "Sour cherry": ["Best cooked, not eaten raw", "Pie, clafoutis, compote", "Cook into a tart syrup or preserve"],
    "Prickly pear": ["Peel the tuna; eat the fruit chilled", "Blend the juice into agua fresca", "Grill the pads (nopales) as a veg"],
    "Olive": ["Must be cured first — never raw", "Brine-cure for the table", "Press for oil (in quantity)"],
    "Paper mulberry": ["Eat the soft ripe fruit raw", "Mash into a sauce", "Blend into smoothies"],
    "Lucuma": ["Scoop ripe flesh; maple-custard flavor", "Blend into ice cream or shakes", "Dry and powder as a sweetener"],
    "Nasturtium": ["Toss peppery leaves & flowers into salad", "Stuff the flowers", "Blend leaves into a pesto"],
    "Miner's lettuce": ["Eat raw as a mild salad green", "Wilt briefly like spinach", "Pile onto sandwiches"],
    "Fennel": ["Fronds: herb for fish & salads", "Pollen: sprinkle as seasoning", "Bulb: roast or shave raw"],
    "Rosemary": ["Roast with potatoes and meats", "Infuse oil or honey", "Steep into tea"],
    "Kale": ["Massage raw into a salad", "Sauté with garlic", "Bake into chips"],
    "Tomato": ["Eat fresh with salt", "Roast into sauce", "Slice onto everything"],
    "Pepper": ["Eat raw or roasted", "Blister in a hot pan", "Dry and grind to flakes"],
    "Green bean": ["Blanch or sauté", "Add to stir-fries", "Roast with olive oil"],
    "Squash": ["Sauté summer squash; roast winter squash", "Grate into fritters", "Soups and gratins"],
    "Pumpkin": ["Roast the flesh", "Soups and pies", "Toast the seeds"],
    "Magenta lilly pilly": ["Eat raw, crisp and tart", "Cook into jam or jelly", "Scatter over desserts"],
    "Cherry": ["Eat fresh by the handful", "Bake into pies and clafoutis", "Cook into compote"],
    "Apricot": ["Eat fresh and ripe", "Halve and grill or roast", "Dry, or cook into jam"],
    "Mulberry": ["Eat fresh (wear dark clothes)", "Bake into pies and crumbles", "Cook into syrup or jam"],
    "Walnut": ["Crack and eat the nutmeat", "Toast for salads and baking", "Press for oil; green ones for nocino"],
    "Almond": ["Eat raw or roasted (sweet types only)", "Blanch and slice for baking", "Grind into flour or milk"],
    "Pecan": ["Eat raw or toasted", "Bake into pies and cookies", "Candy or spice them"],
    "Elderberry": ["Cook the berries — never raw", "Simmer into syrup for colds", "Elderflowers: cordial & fritters"],
    "Quince": ["Always cook — too hard raw", "Poach into rosy slices", "Cook into membrillo or jelly"],
    "Avocado": ["Eat ripe with salt and lemon", "Mash into guacamole", "Slice onto toast and salads"],
    "Crabapple": ["Too tart raw — cook them", "Cook into a rosy jelly", "Roast whole as a garnish"],
}


# Ways to preserve each species — jam, vinegar, cider/wine, ferment, dry, cure.
# Fermentation is just one option among several.
PRESERVE = {
    "Strawberry tree": ["Soft jam or fruit paste", "Country wine or liqueur (ferment)", "Dry the berries"],
    "Pacific madrone": ["Cook into a fruit sauce", "Tart syrup", "Dry and grind into a meal"],
    "Lemon": ["Preserved lemons (salt-ferment)", "Lemon marmalade", "Freeze juice in cubes", "Dry the zest"],
    "Lime": ["Salt-preserved limes", "Lime cordial or syrup", "Freeze the juice"],
    "Orange": ["Marmalade", "Candied peel", "Orange wine (ferment)", "Freeze segments or juice"],
    "Kumquat": ["Whole-fruit marmalade", "Candy them", "Salt-cure (ferment)"],
    "Apple": ["Cider or scrumpy (ferment)", "Apple butter & sauce", "Apple cider vinegar", "Dry into rings"],
    "Pear": ["Perry / pear cider (ferment)", "Pear butter or jam", "Spiced pickled pears (vinegar)", "Dry into chips"],
    "European pear": ["Perry / pear cider (ferment)", "Pear butter or jam", "Spiced pickled pears (vinegar)", "Dry into chips"],
    "Common fig": ["Fig jam", "Fig vinegar", "Lacto-ferment whole", "Dry the figs"],
    "Plum": ["Plum jam or butter", "Umeboshi-style salt cure (ferment)", "Plum vinegar (shrub)", "Plum wine", "Dry into prunes"],
    "Peach": ["Peach jam", "Can in syrup", "Peach wine (ferment)", "Dry into leather"],
    "Nectarine": ["Jam", "Can or freeze in slices", "Stone-fruit soda (ferment)", "Dry into leather"],
    "Persimmon": ["Persimmon vinegar (ferment)", "Dry into hoshigaki", "Persimmon jam or butter", "Freeze Hachiya pulp"],
    "Loquat": ["Loquat jam", "Loquat wine or liqueur (ferment)", "Light poaching syrup", "Dry"],
    "Feijoa": ["Feijoa jam or chutney", "Tropical soda or wine (ferment)", "Freeze the pulp"],
    "Strawberry guava": ["Guava jelly", "Fruit vinegar or soda (ferment)", "Juice and freeze"],
    "Guadalupe palm": ["Dry like dates", "Date syrup", "Date wine (ferment)"],
    "Grape": ["Wine (ferment)", "Verjus from unripe clusters", "Grape jelly", "Grape vinegar", "Raisins (dry)"],
    "Pomegranate": ["Grenadine syrup", "Pomegranate vinegar or wine (ferment)", "Molasses (reduce)", "Freeze the arils"],
    "Blackberry": ["Blackberry jam", "Wild soda or wine (ferment)", "Blackberry shrub (vinegar)", "Freeze whole"],
    "Raspberry": ["Raspberry jam", "Raspberry shrub (vinegar)", "Cordial syrup", "Freeze"],
    "Sour cherry": ["Cherry preserves or jam", "Kriek-style sour (ferment)", "Cherry vinegar", "Dry into tart cherries"],
    "Prickly pear": ["Prickly-pear jelly or syrup", "Lacto pads or fruit soda (ferment)", "Freeze the juice"],
    "Olive": ["Brine-cure / ferment for the table", "Salt-cure (dry)", "Press for oil"],
    "Paper mulberry": ["Fruit soda (ferment)", "Mash into a sauce and freeze"],
    "Lucuma": ["Dry and powder as a sweetener", "Cultured cream (ferment)", "Freeze the pulp"],
    "Nasturtium": ["'Poor man's capers' — brine the seed pods (ferment)", "Vinegar-pickle the pods", "Flower-infused vinegar"],
    "Miner's lettuce": ["Best fresh — barely keeps", "Quick vinegar pickle of the stems"],
    "Fennel": ["Dry the seeds", "Fennel-bulb kraut (ferment)", "Pickle the bulb (vinegar)", "Pollen keeps dry for months"],
    "Rosemary": ["Dry the sprigs", "Infuse oil, vinegar or honey", "Freeze in oil cubes"],
    "Kale": ["Kraut or kimchi (ferment)", "Blanch & freeze", "Dry into chips"],
    "Tomato": ["Can or freeze the sauce", "Lacto salsa or hot sauce (ferment)", "Tomato vinegar", "Sun-dry"],
    "Pepper": ["Fermented hot sauce", "Pickle (vinegar)", "Dry & grind to flakes", "Freeze whole"],
    "Green bean": ["Dilly beans — brine (ferment)", "Pickle (vinegar)", "Blanch & freeze"],
    "Squash": ["Lacto summer squash (ferment)", "Pickle (vinegar)", "Freeze cubes", "Winter squash keeps for months"],
    "Pumpkin": ["Lacto-ferment cubes", "Pickle (vinegar)", "Freeze the puree", "Keeps whole for months"],
    "Magenta lilly pilly": ["Jam or jelly", "Pink shrub (vinegar)", "Tart soda (ferment)"],
    "Cherry": ["Cherry jam", "Cherry soda or sour (ferment)", "Cherry vinegar", "Freeze pitted", "Dry"],
    "Apricot": ["Apricot jam", "Apricot wine (ferment)", "Can in syrup", "Dry into halves"],
    "Mulberry": ["Mulberry jam", "Mulberry wine or soda (ferment)", "Cordial syrup", "Freeze whole"],
    "Walnut": ["Dry & store in the shell", "Nocino from green nuts (infuse)", "Pickled green walnuts (vinegar)", "Press for oil"],
    "Almond": ["Dry & store", "Cultured almond cheese or milk (ferment)", "Grind into flour"],
    "Pecan": ["Dry & store", "Candy or spice them", "Freeze the nutmeats"],
    "Elderberry": ["Elderberry syrup", "Elderflower cordial", "Elderberry wine or soda (ferment)", "Elderberry vinegar", "Dry the berries"],
    "Quince": ["Membrillo (paste)", "Quince jelly", "Quince vinegar (ferment)", "Spiced quince (vinegar)"],
    "Avocado": ["Best fresh — barely keeps", "Freeze mashed with lime"],
    "Crabapple": ["Crabapple jelly", "Cider blend (ferment)", "Spiced crabapple pickle (vinegar)", "Dry"],
    "California bay": ["Dry the leaves for the spice rack", "Roast & store the bay nuts", "Bay-infused oil or vinegar"],
    "Bay laurel": ["Dry the leaves", "Bay-infused oil or vinegar", "Freeze fresh leaves"],
}

USES.update({
    "California bay": ["Use a leaf (half a regular bay) in soups & braises", "Roast the 'bay nuts' — taste of bitter chocolate-coffee", "Infuse into broth or oil"],
    "Bay laurel": ["Drop into soups, stews and braises", "Steep into béchamel or rice", "Infuse oil or vinegar"],
})

# Wikipedia page titles for fetching photos (defaults to the species name).
WIKI = {
    "Common fig": "Common fig", "Strawberry tree": "Arbutus unedo",
    "Pacific madrone": "Arbutus menziesii", "Guadalupe palm": "Brahea edulis",
    "Magenta lilly pilly": "Syzygium paniculatum", "Miner's lettuce": "Claytonia perfoliata",
    "Prickly pear": "Opuntia", "Sour cherry": "Prunus cerasus", "Cherry": "Cherry",
    "Paper mulberry": "Broussonetia papyrifera", "Mulberry": "Morus (plant)",
    "Lucuma": "Pouteria lucuma", "Nasturtium": "Tropaeolum majus",
    "Orange": "Orange (fruit)", "Lime": "Lime (fruit)", "Pepper": "Bell pepper",
    "Squash": "Cucurbita", "Elderberry": "Sambucus", "Feijoa": "Feijoa",
    "California bay": "California bay laurel", "Bay laurel": "Laurus nobilis",
    "Strawberry guava": "Psidium cattleyanum", "Guadalupe palm ": "Brahea edulis",
    "Crabapple": "Malus", "Kumquat": "Kumquat", "Avocado": "Avocado",
    "Carob": "Ceratonia siliqua", "Date palm": "Date palm", "Pindo palm": "Butia capitata",
    "Hawthorn": "Crataegus", "Hazelnut": "Hazelnut", "Chestnut": "Chestnut", "Oak": "Acorn",
    "Juniper": "Juniper berry", "Rose": "Rose hip", "Dandelion": "Taraxacum officinale",
    "Wild mustard": "Sinapis arvensis", "Mallow": "Malva", "Wood sorrel": "Oxalis",
    "Chickweed": "Stellaria media", "Plantain": "Plantago major", "Purslane": "Portulaca oleracea",
}

USES.update({
    "Carob": ["Roast & grind the pods into carob powder", "Snack on the sweet dried pods", "Simmer into a syrup"],
    "Date palm": ["Eat ripe dates fresh or dried", "Chop into baking", "Blend into date paste"],
    "Pindo palm": ["Eat the fruit fresh off the palm", "Strain into juice", "Cook down for a sauce"],
    "Hawthorn": ["Nibble the ripe haws (spit the seeds)", "Cook into a fruit leather or 'ketchup'", "Steep into tea"],
    "Hazelnut": ["Crack & eat raw or toasted", "Grind into meal or butter", "Bake into cakes"],
    "Chestnut": ["Roast and peel", "Boil and puree", "Grind into flour"],
    "Oak": ["Leach the acorns, then grind into flour", "Make acorn mush or pancakes", "Roast leached acorns as a snack"],
    "Juniper": ["Crush a few berries into braises & brines", "Flavor a spice rub", "Steep sparingly into tea"],
    "Rose": ["Deseed the hips, eat raw or in tea", "Toss fresh petals into salad", "Rosehip puree for sauces"],
    "Dandelion": ["Young leaves raw or sautéed", "Batter & fry the flowers", "Roast the root as a coffee substitute"],
    "Wild mustard": ["Sauté the greens like kale", "Toss the flowers into salad", "Grind the seeds into mustard"],
    "Mallow": ["Add leaves to salads & soups (they thicken)", "Snack on the green 'cheeses'", "Whip the boiled water like meringue"],
    "Wood sorrel": ["Scatter leaves as a sour garnish", "Blend into a tangy sauce", "Steep into a lemonade-like tea"],
    "Chickweed": ["Pile raw into salads & sandwiches", "Blend into a pesto", "Wilt briefly into eggs"],
    "Plantain": ["Cook young leaves like spinach", "Fry older leaves into chips", "Toast the seeds onto dishes"],
    "Purslane": ["Eat raw in salads", "Stir-fry or add to soups", "Blend into a tangy dip"],
})

PRESERVE.update({
    "Carob": ["Dry & store the pods", "Carob powder keeps for months", "Carob syrup"],
    "Date palm": ["Dry the dates", "Date syrup", "Date paste (freezes well)", "Date wine (ferment)"],
    "Pindo palm": ["Pindo jelly", "Fruit wine (ferment)", "Freeze the pulp"],
    "Hawthorn": ["Hawthorn jelly", "Haw 'ketchup'", "Haw vinegar", "Dry the haws"],
    "Hazelnut": ["Dry & store in the shell", "Hazelnut butter", "Freeze shelled nuts"],
    "Chestnut": ["Dry for flour", "Candy (marrons)", "Freeze cooked"],
    "Oak": ["Dry the leached acorns", "Acorn flour (store cool & dry)", "Freeze the meal"],
    "Juniper": ["Dry the berries as a spice", "Juniper salt or infused spirit (infuse)", "Juniper vinegar"],
    "Rose": ["Rosehip jam or syrup", "Rose petal vinegar or honey", "Dry the hips for tea", "Dry the petals"],
    "Dandelion": ["Dandelion-flower 'wine' (ferment)", "Dandelion-flower syrup", "Lacto-ferment the greens", "Dry the roots"],
    "Wild mustard": ["Whole-grain mustard from the seeds (ferment)", "Lacto-ferment the greens", "Pickle the flower buds (vinegar)"],
    "Mallow": ["Best fresh", "Dry the leaves for tea", "Freeze blanched"],
    "Wood sorrel": ["Best fresh", "Sour-leaf vinegar", "Freeze into herb cubes"],
    "Chickweed": ["Best fresh", "Freeze in pesto", "Chickweed vinegar"],
    "Plantain": ["Dry the leaves for tea", "Freeze blanched", "Dry the psyllium seeds"],
    "Purslane": ["Lacto-ferment the stems (ferment)", "Pickle (vinegar)", "Freeze blanched"],
})


def clean_types(raw):
    # types field looks like {Blackberry}, "{""Common fig""}", or {Orange,Lemon}
    s = raw.strip().strip("{}").replace('"', "")
    return [p.strip() for p in s.split(",") if p.strip()]

def main():
    os.makedirs(OUT, exist_ok=True)
    trees, skipped_types = [], {}
    with open(RAW) as f:
        r = csv.DictReader(f)
        for row in r:
            types = clean_types(row.get("types", ""))
            if not types:
                continue
            try:
                lat = float(row["lat"]); lng = float(row["lng"])
            except (TypeError, ValueError):
                continue
            for t in types:
                spec = SPECIES.get(t)
                if spec is None:
                    skipped_types[t] = skipped_types.get(t, 0) + 1
                    continue
                trees.append({
                    "id": f"{row['id']}-{t}" if len(types) > 1 else row["id"],
                    "type": t,
                    "lat": lat,
                    "lng": lng,
                    "desc": (row.get("description") or "").strip(),
                    "edible": spec["edible"],
                })

    # Write the FULL curated species table (runtime needs all of it, since the
    # live API can return any of these names anywhere, not just the seed subset).
    # Shape each entry: drop the seed `ferment` field, add `uses` + `preserve`.
    species_out = {}
    for name, s in SPECIES.items():
        entry = {k: v for k, v in s.items() if k != "ferment"}
        entry["uses"] = USES.get(name, [])
        seed = [s["ferment"]] if s.get("ferment") else []
        entry["preserve"] = PRESERVE.get(name, seed)
        species_out[name] = entry

    with open(os.path.join(OUT, "trees.json"), "w") as f:
        json.dump(trees, f, separators=(",", ":"))  # offline fallback seed
    with open(os.path.join(OUT, "species.json"), "w") as f:
        json.dump(species_out, f, indent=0)

    build_types_map()
    build_images(species_out)

    edible_pts = sum(1 for t in trees if t["edible"])
    print(f"wrote {len(trees)} fallback points ({edible_pts} edible); "
          f"{len(SPECIES)} curated species -> {OUT}")
    if skipped_types:
        print("unmapped types (skipped from fallback):", skipped_types)


def build_types_map():
    """Fetch the Falling Fruit type taxonomy and write a slim id -> [name, edible]
    map so the app can label live API results. Caches the raw dump locally."""
    import urllib.request, urllib.parse

    KEY = "AKDJGHSD"  # public key shipped in Falling Fruit's own open-source web client
    cache = os.path.join(os.path.dirname(__file__), "ff_types_raw.json")
    if os.path.exists(cache):
        raw = json.load(open(cache))
    else:
        url = f"https://fallingfruit.org/api/0.3/types?api_key={KEY}"
        with urllib.request.urlopen(url, timeout=60) as r:
            raw = json.load(r)
        json.dump(raw, open(cache, "w"))

    out = {}
    for t in raw:
        names = (t.get("common_names") or {}).get("en") or t.get("scientific_names") or []
        if not names:
            continue
        edible = 1 if "forager" in (t.get("categories") or []) else 0
        # Wikipedia page title (for runtime photo + description), from FF's own link.
        wiki = (t.get("urls") or {}).get("wikipedia") or ""
        slug = ""
        if "/wiki/" in wiki:
            slug = urllib.parse.unquote(wiki.rstrip("/").split("/wiki/")[-1]).replace("_", " ")
        out[t["id"]] = [names[0], edible, slug]
    with open(os.path.join(OUT, "types.json"), "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {len(out)} type labels -> types.json "
          f"({sum(1 for v in out.values() if v[1])} forageable, "
          f"{sum(1 for v in out.values() if v[2])} with wiki)")


def build_images(species_out):
    """Fetch a representative photo per species from Wikipedia (lead image + one
    more from the page). Writes images.json {name: [url, ...]}. Cached locally."""
    import urllib.request, urllib.parse, time

    cache = os.path.join(os.path.dirname(__file__), "images_cache.json")
    imgs = json.load(open(cache)) if os.path.exists(cache) else {}

    def get(url):
        for attempt in range(5):
            try:
                req = urllib.request.Request(
                    url, headers={"User-Agent": "ScrumpApp/1.0 (forage map; contact emre)"})
                with urllib.request.urlopen(req, timeout=30) as r:
                    return json.load(r)
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    time.sleep(2 + attempt * 3)
                    continue
                raise
        raise RuntimeError("rate limited")

    for name, s in species_out.items():
        if not s.get("edible"):
            continue
        if imgs.get(name):  # already have at least one image
            continue
        title = WIKI.get(name, name)
        urls = []
        try:
            summ = get("https://en.wikipedia.org/api/rest_v1/page/summary/" +
                       urllib.parse.quote(title))
            for k in ("originalimage", "thumbnail"):
                src = (summ.get(k) or {}).get("source")
                if src:
                    urls.append(src)
                    break
        except Exception as e:
            print("  ! summary", name, title, e)
        try:
            ml = get("https://en.wikipedia.org/api/rest_v1/page/media-list/" +
                     urllib.parse.quote(title))
            for item in ml.get("items", []):
                if item.get("type") != "image":
                    continue
                srcset = item.get("srcset") or []
                if not srcset:
                    continue
                u = srcset[0].get("src", "")
                if u.startswith("//"):
                    u = "https:" + u
                if u and u not in urls and u.lower().rsplit(".", 1)[-1] in ("jpg", "jpeg", "png"):
                    urls.append(u)
                if len(urls) >= 3:
                    break
        except Exception as e:
            print("  ! media", name, title, e)
        imgs[name] = urls[:3]
        print(f"  img {name}: {len(imgs[name])}")
        json.dump(imgs, open(cache, "w"))  # save as we go (resumable)
        time.sleep(1.0)  # be polite to Wikipedia

    json.dump(imgs, open(cache, "w"))
    with open(os.path.join(OUT, "images.json"), "w") as f:
        json.dump(imgs, f, separators=(",", ":"))
    have = sum(1 for v in imgs.values() if v)
    print(f"wrote images for {have}/{len(imgs)} species -> images.json")

if __name__ == "__main__":
    main()
