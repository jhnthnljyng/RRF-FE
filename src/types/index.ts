export type ListingType = 'room' | 'whole_unit' | 'looking_for_roommate';

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  room: 'Room for Rent',
  whole_unit: 'Whole Unit for Rent',
  looking_for_roommate: 'Looking for Roommate',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'tenant';
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  owner_id: number;
  author?: User;
  createdAt: string;
  availableFrom: string;
  furnishing?: 'fully' | 'partial' | 'unfurnished';
  bedrooms?: number;
  bathrooms?: number;
  genderPreference?: 'any' | 'male' | 'female';
}

export interface SearchFilters {
  type?: ListingType | '';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  furnishing?: 'fully' | 'partial' | 'unfurnished';
  genderPreference?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  username: string;
  fullname: string;
  phone: string;
  role: 'owner' | 'tenant';
}

export interface AuthResponse {
  user: User;
  token: string;
}
