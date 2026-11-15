'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessProfile,
  ClassifiedCategory,
  ClassifiedListing,
  FeedPost,
  ITSVerificationRequest,
  LeadEvent,
  StoryItem,
  TrustLevel,
  User,
  UserRole,
} from '@/types';
import {
  SEED_BUSINESSES,
  SEED_CLASSIFIEDS,
  SEED_POSTS,
  SEED_STORIES,
  SEED_USERS,
  SEED_VERIFICATION_REQUESTS,
} from '@/data/seedData';
import { generateWhatsAppLink, WhatsAppInquiryPayload } from '@/utils/whatsapp';

interface AppContextType {
  // User & Authentication state
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  authChecked: boolean;
  switchPersona: (role: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'CREATOR' | 'ADMIN') => void;
  isVerified: boolean;
  logout: () => Promise<void>;

  // City & Mohalla filters
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  selectedLocality: string;
  setSelectedLocality: (locality: string) => void;

  // Feed & Souq
  feedPosts: FeedPost[];
  activeFeedCategory: string;
  setActiveFeedCategory: (cat: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addNewPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'whatsappClicksCount'>) => void;

  // Stories / Drops
  stories: StoryItem[];
  activeStoryIndex: number | null;
  openStory: (index: number) => void;
  closeStory: () => void;

  // Classifieds
  classifieds: ClassifiedListing[];
  activeClassifiedCategory: ClassifiedCategory | 'ALL';
  setActiveClassifiedCategory: (cat: ClassifiedCategory | 'ALL') => void;
  toggleSaveClassified: (listingId: string) => void;
  addNewClassified: (
    listing: Omit<ClassifiedListing, 'id' | 'createdAt' | 'whatsappClicksCount' | 'sellerItsVerified' | 'sellerVerifiedYear'>
  ) => void;

  // Active Modals & Viewers
  selectedClassifiedDetail: ClassifiedListing | null;
  setSelectedClassifiedDetail: (listing: ClassifiedListing | null) => void;
  isPostModalOpen: boolean;
  setIsPostModalOpen: (open: boolean) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Leads & WhatsApp tracking
  leadEvents: LeadEvent[];
  handleWhatsAppInquiry: (payload: WhatsAppInquiryPayload) => void;

  // Admin Verification Queue
  verificationRequests: ITSVerificationRequest[];
  refreshVerifications: () => Promise<void>;
  submitVerificationRequest: (req: Omit<ITSVerificationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  adminApproveVerification: (requestId: string) => void;
  adminRejectVerification: (requestId: string, notes?: string) => void;

  // Businesses
  businesses: BusinessProfile[];
  toggleBusinessFeatured: (businessId: string) => void;
}

const GUEST_DEFAULT_USER: User = {
  id: 'guest-visitor',
  email: 'guest@mumineen.org',
  phone: '',
  fullName: 'Guest Visitor',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  verificationStatus: 'UNVERIFIED',
  cityId: 'mumbai',
  cityName: 'Mumbai',
  mohallaName: 'Mazgaon',
  role: 'MEMBER',
  createdAt: new Date().toISOString(),
};

const INITIAL_DEMO_LEADS: LeadEvent[] = [
  {
    id: 'lead-1',
    itemId: 'listing-1',
    itemType: 'CLASSIFIED',
    itemTitle: 'Spacious 2BHK Flat – 3 Mins to Uzri Masjid',
    sellerId: 'user-1',
    buyerName: 'Abbas Bhanpurawala',
    buyerIts: '50192844',
    buyerMohalla: 'Mazgaon',
    timestamp: 'Today, 2:15 PM',
  },
  {
    id: 'lead-2',
    itemId: 'post-1',
    itemType: 'POST',
    itemTitle: 'Special Friday Bohra Thaali Box',
    sellerId: 'user-3',
    buyerName: 'Zainab Merchant',
    buyerIts: '60291834',
    buyerMohalla: 'Bhendi Bazaar',
    timestamp: 'Today, 11:30 AM',
  },
  {
    id: 'lead-3',
    itemId: 'listing-4',
    itemType: 'CLASSIFIED',
    itemTitle: 'Solid Teakwood 6-Seater Bohra Safra Table',
    sellerId: 'user-5',
    buyerName: 'Mustafa Godhrawala',
    buyerIts: '40192831',
    buyerMohalla: 'Marol',
    timestamp: 'Yesterday, 6:40 PM',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(GUEST_DEFAULT_USER);
  const isAuthenticated = Boolean(currentUser && currentUser.id && !currentUser.id.startsWith('guest'));

  // Global Location filter (Default 'mumbai' or 'all')
  const [selectedCityId, setSelectedCityId] = useState<string>('mumbai');
  const [selectedLocality, setSelectedLocality] = useState<string>('All Localities');

  // Feed State
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [activeFeedCategory, setActiveFeedCategory] = useState<string>('ALL');

  // Stories
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Classifieds
  const [classifieds, setClassifieds] = useState<ClassifiedListing[]>([]);
  const [activeClassifiedCategory, setActiveClassifiedCategory] = useState<ClassifiedCategory | 'ALL'>('ALL');
  const [selectedClassifiedDetail, setSelectedClassifiedDetail] = useState<ClassifiedListing | null>(null);

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Leads & Businesses
  const [leadEvents, setLeadEvents] = useState<LeadEvent[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<ITSVerificationRequest[]>([]);

  const isVerified = currentUser.verificationStatus === 'VERIFIED';

  // Check /api/auth/me and load real server-persisted database items on mount
  useEffect(() => {
    // 1. Session check
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(GUEST_DEFAULT_USER);
        }
      })
      .catch((err) => console.log('Session check completed:', err))
      .finally(() => setAuthChecked(true));

    // 2. Load Feed Posts from Backend Database
    fetch('/api/feed')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts)) {
          setFeedPosts(data.posts);
        }
      })
      .catch((err) => console.log('Feed sync:', err));

    // 3. Load Classifieds from Backend Database
    fetch('/api/classifieds')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.classifieds)) {
          setClassifieds(data.classifieds);
        }
      })
      .catch((err) => console.log('Classifieds sync:', err));

    // 4. Load 24h Stories from Backend Database
    fetch('/api/stories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stories)) {
          setStories(data.stories);
        }
      })
      .catch((err) => console.log('Stories sync:', err));

    // 5. Load Verification Requests from Backend Database
    refreshVerifications();
  }, []);

  const refreshVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verifications', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.verifications)) {
        setVerificationRequests(data.verifications);
      }
    } catch (err) {
      console.log('Verifications sync:', err);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setCurrentUser(GUEST_DEFAULT_USER);
    }
  };

  // Persona switching helper for interactive testing
  const switchPersona = (roleType: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'CREATOR' | 'ADMIN') => {
    fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        // Fallback local switch
        switch (roleType) {
          case 'UNVERIFIED':
            setCurrentUser({
              id: 'guest-unverified',
              email: 'guest@mumineen.org',
              phone: '',
              fullName: 'Guest Visitor',
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
              verificationStatus: 'UNVERIFIED',
              cityId: 'mumbai',
              cityName: 'Mumbai',
              mohallaName: 'Mazgaon',
              role: 'MEMBER',
              createdAt: new Date().toISOString(),
            });
            break;
          case 'PENDING':
            setCurrentUser(SEED_USERS[4]);
            break;
          case 'VERIFIED':
            setCurrentUser({ ...SEED_USERS[0], role: 'MEMBER' });
            break;
          case 'CREATOR':
            setCurrentUser(SEED_USERS[1]);
            break;
          case 'ADMIN':
            setCurrentUser(SEED_USERS[0]);
            break;
        }
      });
  };

  // Like Toggle
  const toggleLikePost = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      })
    );
  };

  // Save Toggle for Feed Post
  const toggleSavePost = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  // Save Toggle for Classified
  const toggleSaveClassified = (listingId: string) => {
    setClassifieds((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  };

  // Add new Feed Post
  const addNewPost = (newPostData: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'whatsappClicksCount'>) => {
    const post: FeedPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      isSaved: false,
      whatsappClicksCount: 0,
    };
    setFeedPosts((prev) => [post, ...prev]);

    // Async sync to backend
    fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPostData),
    }).catch(console.error);
  };

  // Add new Classified
  const addNewClassified = (
    newListingData: Omit<ClassifiedListing, 'id' | 'createdAt' | 'whatsappClicksCount' | 'sellerItsVerified' | 'sellerVerifiedYear'>
  ) => {
    const listing: ClassifiedListing = {
      ...newListingData,
      id: `listing-${Date.now()}`,
      createdAt: new Date().toISOString(),
      whatsappClicksCount: 0,
      sellerItsVerified: currentUser.verificationStatus === 'VERIFIED',
      sellerVerifiedYear: new Date().getFullYear(),
      isSaved: false,
    };
    setClassifieds((prev) => [listing, ...prev]);

    // Async sync to backend
    fetch('/api/classifieds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListingData),
    }).catch(console.error);
  };

  // Stories
  const openStory = (index: number) => setActiveStoryIndex(index);
  const closeStory = () => setActiveStoryIndex(null);

  // WhatsApp Inquiry Handler & Lead Tracking
  const handleWhatsAppInquiry = (payload: WhatsAppInquiryPayload) => {
    // 1. Log Lead Event locally
    const newLead: LeadEvent = {
      id: `lead-${Date.now()}`,
      itemId: payload.itemId,
      itemType: payload.itemType,
      itemTitle: payload.title,
      sellerId: payload.sellerName || 'Seller',
      buyerName: currentUser.fullName,
      buyerIts: currentUser.itsNumber,
      buyerMohalla: currentUser.mohallaName,
      timestamp: 'Just now',
    };
    setLeadEvents((prev) => [newLead, ...prev]);

    // 2. Increment clicks count in state
    if (payload.itemType === 'POST') {
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === payload.itemId ? { ...p, whatsappClicksCount: p.whatsappClicksCount + 1 } : p
        )
      );
    } else if (payload.itemType === 'CLASSIFIED') {
      setClassifieds((prev) =>
        prev.map((c) =>
          c.id === payload.itemId ? { ...c, whatsappClicksCount: c.whatsappClicksCount + 1 } : c
        )
      );
    }

    // 3. Post to backend lead API
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: payload.itemId,
        itemType: payload.itemType,
        itemTitle: payload.title,
        sellerId: payload.sellerName || 'Seller',
        buyerName: currentUser.fullName,
        buyerIts: currentUser.itsNumber,
        buyerMohalla: currentUser.mohallaName,
      }),
    }).catch(console.error);

    // 4. Generate Link with contextual greeting and redirect
    const url = generateWhatsAppLink({
      ...payload,
      currentUserFullName: currentUser.fullName,
      currentUserIts: currentUser.itsNumber,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Submit ITS Verification Request (Strictly Queued for Admin Review)
  const submitVerificationRequest = (
    req: Omit<ITSVerificationRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newRequest: ITSVerificationRequest = {
      ...req,
      id: `verif-req-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING', // STRICTLY PENDING - requires admin manual review
    };

    setVerificationRequests((prev) => [newRequest, ...prev]);

    // Sync to backend
    fetch('/api/trust/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).catch(console.error);

    // User is now strictly PENDING (no auto-approval)
    setCurrentUser((prev) => ({
      ...prev,
      itsNumber: req.itsNumber,
      fullName: req.fullName,
      mohallaName: req.mohalla,
      cityName: req.jamaatCity,
      verificationStatus: 'PENDING',
    }));
  };

  // Admin Action: Approve
  const adminApproveVerification = (requestId: string) => {
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'VERIFIED' } : r))
    );

    fetch(`/api/admin/verifications/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'VERIFIED' }),
    }).catch(console.error);

    const req = verificationRequests.find((r) => r.id === requestId);
    if (req && req.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        verificationStatus: 'VERIFIED',
        itsNumber: req.itsNumber,
      }));
    }
  };

  // Admin Action: Reject
  const adminRejectVerification = (requestId: string, notes?: string) => {
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED', adminNotes: notes } : r))
    );

    fetch(`/api/admin/verifications/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', notes }),
    }).catch(console.error);

    const req = verificationRequests.find((r) => r.id === requestId);
    if (req && req.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        verificationStatus: 'REJECTED',
      }));
    }
  };

  // Admin Action: Toggle Featured Business
  const toggleBusinessFeatured = (bizId: string) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === bizId
          ? {
              ...b,
              subscriptionTier: b.subscriptionTier === 'PRO_FEATURED' ? 'FREE' : 'PRO_FEATURED',
            }
          : b
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        authChecked,
        switchPersona,
        isVerified,
        logout,
        selectedCityId,
        setSelectedCityId,
        selectedLocality,
        setSelectedLocality,
        feedPosts,
        activeFeedCategory,
        setActiveFeedCategory,
        toggleLikePost,
        toggleSavePost,
        addNewPost,
        stories,
        activeStoryIndex,
        openStory,
        closeStory,
        classifieds,
        activeClassifiedCategory,
        setActiveClassifiedCategory,
        toggleSaveClassified,
        addNewClassified,
        selectedClassifiedDetail,
        setSelectedClassifiedDetail,
        isPostModalOpen,
        setIsPostModalOpen,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isCityModalOpen,
        setIsCityModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        leadEvents,
        handleWhatsAppInquiry,
        verificationRequests,
        refreshVerifications,
        submitVerificationRequest,
        adminApproveVerification,
        adminRejectVerification,
        businesses,
        toggleBusinessFeatured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
