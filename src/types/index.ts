export type ListingType = 'room' | 'whole_unit' | 'looking_for_roommate';

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  room: 'Room for Rent',
  whole_unit: 'Whole Unit for Rent',
  looking_for_roommate: 'Looking for Roommate',
};

export interface Social {
  name: string;
  url: string;
}

export type CookingFrequency = 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'owner' | 'tenant';
  avatar_url?: string;
  bio?: string;
  gender?: string;
  occupation?: string;
  nationality?: string;
  cooking_frequency?: CookingFrequency;
  smoking?: boolean;
  pet_owner?: boolean;
  pet_friendly?: boolean;
  socials?: Social[];
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
  owner_name?: string;
  owner_phone?: string;
  author?: User;
  createdAt: string;
  availableFrom: string;
  furnishing?: 'fully' | 'partial' | 'unfurnished';
  bedrooms?: number;
  bathrooms?: number;
  maxOccupants?: number;
  genderPreference?: 'any' | 'male' | 'female';
  status?: 'available' | 'filled' | 'unavailable';
  tenant_id?: number | null;
  is_active?: boolean | number;
  is_favourited?: boolean;
}

export interface SearchFilters {
  type?: ListingType | '';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  furnishing?: 'fully' | 'partial' | 'unfurnished';
  genderPreference?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  availableOnly?: boolean;
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
