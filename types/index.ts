export type DietStyle =
  | "omnivor"
  | "vegetarisch"
  | "vegan"
  | "flexitarisch"
  | "pescetarisch";

export type Goal =
  | "eat_more_veggies"
  | "healthier_snacks"
  | "reduce_meat"
  | "cut_processed_foods"
  | "discover_new_foods"
  | "reduce_plastic_waste"
  | "stock_the_pantry"
  | "quick_dinners"
  | "lower_carbon_footprint";

export type Restriction =
  | "lactose"
  | "gluten"
  | "nuts"
  | "vegan"
  | "vegetarian"
  | "halal"
  | "kosher"
  | "soja"
  | "egg"
  | "fish";

export type CO2Score = "A" | "B" | "C" | "D" | "E";
export type StockStatus = "verfügbar" | "knapp" | "ausverkauft";
export type LocalityTag = "lokal" | "regional" | "import";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  unit: string;
  emoji: string;
  co2Score: CO2Score;
  co2Kg: number; // kg CO2 per unit
  stockStatus: StockStatus;
  locality: LocalityTag;
  tags: string[];
  localNote?: string; // e.g. "Heute frisch im Hub Viernheim"
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedReason?: string; // personalization reason
}

export interface PantryItem {
  product: Product;
  quantity: number;
  unit: string;
  daysRemaining: number;
  consumptionRate: number; // units per day
  lastRestocked: string; // date string
}

export interface OrderHistoryEntry {
  id: string;
  date: string;
  items: { productId: string; quantity: number }[];
  total: number;
  co2Saved: number;
}

export interface Household {
  size: number;
  weeklyBudget: number;
  dietStyle: DietStyle;
  restrictions: Restriction[];
  hasKids: boolean;
  kidsCount?: number;
}

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  household: Household;
  defaultRestrictions: Restriction[];
  defaultGoals: Goal[];
  pantry: PantryItem[];
  orderHistory: OrderHistoryEntry[];
  defaultCart: CartItem[];
  co2SavedTotal: number;
  co2SavedThisWeek: number;
  co2MonthlyGoal: number;
  co2SavedThisMonth: number;
  deliverySlot: string;
  preferredCategories: string[];
  color: string;
  // Extended fields populated from the API
  mealSuggestions?: MealSuggestion[];
  bundles?: Bundle[];
  popularProducts?: { product: Product; percentage: number }[];
}

export interface MealSuggestion {
  id: string;
  name: string;
  emoji: string;
  reason: string;
  ingredients: Product[];
  totalPrice: number;
  co2Score: CO2Score;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  items: { product: Product; quantity: number }[];
  totalPrice: number;
  savings?: number;
  category: "reorder" | "topup";
}

export interface SavedPackage {
  id: string;           // uuid, client-generated
  name: string;
  emoji: string;
  description?: string;
  items: { product: Product; quantity: number }[];
  totalPrice: number;
  isPreset: boolean;    // true = shipped with the app, false = user-created
  createdAt: string;    // ISO date string
}
