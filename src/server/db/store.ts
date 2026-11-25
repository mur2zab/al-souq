import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  SEED_BUSINESSES,
  SEED_CLASSIFIEDS,
  SEED_POSTS,
  SEED_STORIES,
  SEED_USERS,
  SEED_VERIFICATION_REQUESTS,
} from '@/data/seedData';
import {
  BusinessProfile,
  ClassifiedListing,
  FeedPost,
  ITSVerificationRequest,
  LeadEvent,
  StoryItem,
  User,
} from '@/types';
import { hashPassword } from '@/server/auth/auth';

export interface UserWithAuth extends User {
  passwordHash?: string;
}

interface DatabaseSchema {
  users: UserWithAuth[];
  businesses: BusinessProfile[];
  posts: FeedPost[];
  stories: StoryItem[];
  classifieds: ClassifiedListing[];
  leads: LeadEvent[];
  verifications: ITSVerificationRequest[];
}

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DB_FILE = path.join(process.cwd(), '.data', 'alsouq_database.json');
const WRITABLE_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
const DB_FILE = IS_VERCEL ? path.join('/tmp', 'alsouq_database.json') : BUNDLED_DB_FILE;

// Generate secure non-guessable initial hash for seed accounts
const DEFAULT_PASSWORD_HASH = hashPassword(
  process.env.DEFAULT_SEED_PASSWORD || crypto.randomBytes(16).toString('hex')
);

class ServerDatabaseStore {
  public users: UserWithAuth[] = [];
  public businesses: BusinessProfile[] = [];
  public posts: FeedPost[] = [];
  public stories: StoryItem[] = [];
  public classifieds: ClassifiedListing[] = [];
  public leads: LeadEvent[] = [];
  public verifications: ITSVerificationRequest[] = [];

  constructor() {
    this.initialize();
  }

  public reloadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data: DatabaseSchema = JSON.parse(raw);
        if (data.users) this.users = data.users;
        if (data.businesses) this.businesses = data.businesses;
        if (data.posts) this.posts = data.posts;
        if (data.stories) this.stories = data.stories;
        if (data.classifieds) this.classifieds = data.classifieds;
        if (data.leads) this.leads = data.leads;
        if (data.verifications) this.verifications = data.verifications;
      }
    } catch (err) {
      console.warn('Failed to reload database from disk:', err);
    }
  }

  private initialize() {
    try {
      // 1. Try loading from writable DB file (e.g. /tmp on Vercel or .data locally)
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data: DatabaseSchema = JSON.parse(raw);
        this.users = data.users || [];
        this.businesses = data.businesses || [];
        this.posts = data.posts || [];
        this.stories = data.stories || [];
        this.classifieds = data.classifieds || [];
        this.leads = data.leads || [];
        this.verifications = data.verifications || [];
        return;
      }

      // 2. On Vercel, copy from bundled database file to writable /tmp
      if (IS_VERCEL && fs.existsSync(BUNDLED_DB_FILE)) {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const data: DatabaseSchema = JSON.parse(raw);
        this.users = data.users || [];
        this.businesses = data.businesses || [];
        this.posts = data.posts || [];
        this.stories = data.stories || [];
        this.classifieds = data.classifieds || [];
        this.leads = data.leads || [];
        this.verifications = data.verifications || [];
        this.persistToDisk();
        return;
      }
    } catch (err) {
      console.warn('Failed to load database from disk:', err);
    }

    // If EMPTY_DATABASE is specified or starting in clean empty mode
    if (process.env.EMPTY_DATABASE === 'true') {
      this.resetToEmpty();
      return;
    }

    // Initialize with empty clean state (0 dummy listings, 0 dummy posts)
    this.resetToEmpty();
  }

  public resetToEmpty(
    adminPassword = process.env.ADMIN_PASSWORD || 'Admin@AlSouq2026',
    adminEmail = process.env.ADMIN_EMAIL || 'admin@alsouq.community'
  ) {
    this.users = [
      {
        id: 'admin-1',
        email: adminEmail,
        phone: '+919820000001',
        fullName: 'Community Admin',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        itsNumber: '10000001',
        verificationStatus: 'VERIFIED',
        cityId: 'mumbai',
        cityName: 'Mumbai',
        mohallaName: 'Mazgaon (Al-Souq Admin Desk)',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        passwordHash: hashPassword(adminPassword),
      },
    ];
    this.businesses = [];
    this.posts = [];
    this.stories = [];
    this.classifieds = [];
    this.leads = [];
    this.verifications = [];
    this.persistToDisk();
  }

  public resetToSeed() {
    this.users = SEED_USERS.map((u) => ({
      ...u,
      passwordHash: DEFAULT_PASSWORD_HASH,
    }));
    this.businesses = [...SEED_BUSINESSES];
    this.posts = [...SEED_POSTS];
    this.stories = [...SEED_STORIES];
    this.classifieds = [...SEED_CLASSIFIEDS];
    this.leads = [
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
    ];
    this.verifications = [...SEED_VERIFICATION_REQUESTS];
    this.persistToDisk();
  }

  public persistToDisk() {
    try {
      if (!fs.existsSync(WRITABLE_DIR)) {
        fs.mkdirSync(WRITABLE_DIR, { recursive: true });
      }
      const data: DatabaseSchema = {
        users: this.users,
        businesses: this.businesses,
        posts: this.posts,
        stories: this.stories,
        classifieds: this.classifieds,
        leads: this.leads,
        verifications: this.verifications,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }
}

// Global singleton instance for server environment (persists across all route handlers in this worker process)
const globalForStore = global as unknown as { dbStore: ServerDatabaseStore };
export const dbStore = globalForStore.dbStore || new ServerDatabaseStore();
globalForStore.dbStore = dbStore;
