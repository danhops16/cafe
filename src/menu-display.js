/**
 * Presentation-only name cleanup for Clover POS strings.
 * Does not change prices or which products exist.
 */
export const DISPLAY_NAMES = {
  "Cafe Mocha": "Café Mocha",
  Cappucinno: "Cappuccino",
  "Coffee (original/dark roast)": "Coffee — Original or Dark Roast",
  "Expresso Style": "Espresso Style",
  "Crispy Chicken Tender With Cheesy Wedges": "Chicken Tenders & Cheesy Wedges",
  "Fried Rice, Fried Plantain, Salad & Chicken": "Fried Rice with Chicken & Plantain",
  "Fried Rice, Fried Plantain, Salad & Turkey": "Fried Rice with Turkey & Plantain",
  "Jollof Rice Fried Plantain, Salad & Chicken":
    "Jollof Rice with Chicken & Plantain",
  "Jollof Rice, Fried Plantain, Salad & Turkey":
    "Jollof Rice with Turkey & Plantain",
  "7up Bottle": "7UP",
  "Canadab Dry": "Canada Dry",
  "Canada Dry Can": "Canada Dry",
  "Coca-Cola Can": "Coca-Cola",
  "Coca-Cola Bottle": "Coca-Cola",
  "Diet Coke Bottle": "Diet Coke",
  "Fanta Orange Can": "Fanta Orange",
  "Fanta Orange Bottle": "Fanta Orange",
  "Mountain Dew Can": "Mountain Dew",
  "Mountain Dew Bottle": "Mountain Dew",
  "Pepsi Can": "Pepsi",
  "Pepsi Bottle": "Pepsi",
  "Sprite Can": "Sprite",
  "Sprite Bottle": "Sprite",
  "5 Hour Energy": "5-hour Energy",
  "Bottle water": "Bottled Water",
  "Nestle Pure Life": "Nestlé Pure Life",
  "Smart Water": "Smartwater",
  "Aquafina Small": "Small Aquafina",
};

export const CATEGORY_TITLES = {
  "african-cuisine": "African Cuisine",
  "american-cuisine": "American Favourites",
  bakery: "Fresh Bakery",
  "hot-beverages": "Hot Beverages",
  "flavored-ice-latte": "Flavoured Iced Lattes",
  "pops-can": "Pop Cans",
  "pops-bottle": "Pop Bottles",
  "energy-drinks": "Energy Drinks",
  "bottled-water": "Bottled Water",
};

export function displayName(name) {
  if (!name) return name;
  if (DISPLAY_NAMES[name]) return DISPLAY_NAMES[name];

  // Size-prefixed hot/iced drinks: "Small Cafe Mocha" → "Small Café Mocha"
  const sizePrefix = name.match(/^(Extra\s+Large|Large|Medium|Small)\s+(.+)$/i);
  if (sizePrefix && DISPLAY_NAMES[sizePrefix[2]]) {
    return `${sizePrefix[1]} ${DISPLAY_NAMES[sizePrefix[2]]}`;
  }

  const sizeSuffix = name.match(/^(.+?)\s+(Extra\s+Large|Large|Medium|Small)$/i);
  if (sizeSuffix && DISPLAY_NAMES[sizeSuffix[1]]) {
    return `${DISPLAY_NAMES[sizeSuffix[1]]} ${sizeSuffix[2]}`;
  }

  return name;
}

export function categoryTitle(category) {
  return CATEGORY_TITLES[category?.id] || category?.name || "";
}
