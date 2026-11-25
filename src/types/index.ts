export type TrustLevel = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type UserRole = 'MEMBER' | 'CREATOR_BUSINESS' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string;
  itsNumber?: string;
  verificationStatus: TrustLevel;
  itsCardProofUrl?: string;
  livePhotoUrl?: string;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName: string;
  role: UserRole;
  createdAt: string;
}

export type BusinessCategory =
  | 'FOOD_CATERING'
  | 'RIDA_FASHION'
  | 'KHATT_ART'
  | 'GIFTING_DECOR'
  | 'B2B_TRADE'
  | 'TRAVEL_ZIYARAT'
  | 'SERVICES';

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  category: BusinessCategory;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName: string;
  shipsGlobally: boolean;
  hasRazaBadge: boolean;
  subscriptionTier: 'FREE' | 'PRO_FEATURED';
  whatsappNumber: string;
  instagramHandle?: string;
  catalogPdfUrl?: string;
  rating?: number;
  verifiedSince?: string;
}

export type PostType = 'PHOTO_CAROUSEL' | 'REEL_VIDEO' | 'DAILY_DROP_STORY';

export interface FeedPost {
  id: string;
  businessId: string;
  businessName: string;
  businessAvatar: string;
  hasRazaBadge: boolean;
  authorId: string;
  postType: PostType;
  mediaUrls: string[];
  caption: string;
  priceInr?: number;
  isAvailableToday: boolean;
  todayDropDeadline?: string;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName: string;
  likesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  whatsappClicksCount: number;
  whatsappNumber: string;
  expiresAt?: string;
  createdAt: string;
  category: BusinessCategory;
  tags: string[];
}

export type ClassifiedCategory =
  | 'REAL_ESTATE_RENT'
  | 'REAL_ESTATE_SALE'
  | 'PG_FLATMATE'
  | 'HOME_CLEARANCE_FURNITURE'
  | 'COMMERCIAL_EQUIPMENT'
  | 'BABY_KIDS'
  | 'JOBS';

export type ClassifiedCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'NOT_APPLICABLE';

export interface RealEstateMeta {
  bhk: string;
  carpetArea: number;
  nearMasjid: string;
  thaaliFriendly: boolean;
  brokerage: 'ZERO_BROKERAGE';
  deposit: number;
  floor?: string;
  furnishing?: 'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished';
}

export interface JobMeta {
  company: string;
  roleType: string;
  timing: string;
  salary: string;
}

export interface ClassifiedListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerItsVerified: boolean;
  sellerVerifiedYear: number;
  sellerPhone: string;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName: string;
  category: ClassifiedCategory;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  condition: ClassifiedCondition;
  realEstateMeta?: RealEstateMeta;
  jobMeta?: JobMeta;
  mediaUrls: string[];
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
  createdAt: string;
  whatsappClicksCount: number;
  isSaved?: boolean;
}

export interface City {
  id: string;
  name: string;
  country: string;
  localities: string[];
  jamaats: string[];
}

export interface StoryItem {
  id: string;
  businessId: string;
  businessName: string;
  businessAvatar: string;
  mediaUrl: string;
  caption: string;
  priceInr?: number;
  orderDeadline: string;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName: string;
  isAvailableToday: boolean;
  whatsappNumber: string;
  expiresInHours: number;
}

export interface LeadEvent {
  id: string;
  itemId: string;
  itemType: 'POST' | 'CLASSIFIED' | 'STORY';
  itemTitle: string;
  sellerId: string;
  buyerName?: string;
  buyerIts?: string;
  buyerMohalla?: string;
  timestamp: string;
}

export interface ITSVerificationRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  itsNumber: string;
  jamaatCity: string;
  mohalla: string;
  idCardImageUrl: string;
  livePhotoUrl?: string;
  submittedAt: string;
  ocrExtractedIts: string;
  ocrExtractedName: string;
  ocrConfidence: number;
  ocrMatches: boolean;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  adminNotes?: string;
}
