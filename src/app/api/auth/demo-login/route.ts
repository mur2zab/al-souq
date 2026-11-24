import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/server/db/store';
import { createSessionToken } from '@/server/auth/auth';
import { User } from '@/types';

const FALLBACK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@alsouq.community',
  phone: '+919820000001',
  fullName: 'Community Admin',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  itsNumber: '10000001',
  verificationStatus: 'VERIFIED',
  cityId: 'mumbai',
  cityName: 'Mumbai',
  mohallaName: 'Mazgaon',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

export async function POST(request: NextRequest) {
  try {
    // In production, block demo persona switching
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Demo persona switching is disabled in production.' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    const adminUser = dbStore.users.find((u) => u.role === 'ADMIN') || dbStore.users[0] || FALLBACK_ADMIN;
    let targetUser: User = adminUser;

    if (role === 'CREATOR') {
      targetUser =
        dbStore.users.find((u) => u.role === 'CREATOR_BUSINESS') || {
          id: `creator-${Date.now()}`,
          email: 'creator@mumineen.org',
          phone: '+919819922334',
          fullName: 'Fatema Chitalwala (Creator)',
          avatarUrl:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
          itsNumber: '50294102',
          verificationStatus: 'VERIFIED',
          cityId: 'mumbai',
          cityName: 'Mumbai',
          mohallaName: 'Mazgaon',
          role: 'CREATOR_BUSINESS',
          createdAt: new Date().toISOString(),
        };
    } else if (role === 'VERIFIED') {
      targetUser =
        dbStore.users.find((u) => u.verificationStatus === 'VERIFIED' && u.role === 'MEMBER') || {
          id: `verified-${Date.now()}`,
          email: 'mumin.verified@mumineen.org',
          phone: '+919820011223',
          fullName: 'Murtuza (Verified Mumin)',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          itsNumber: '30491823',
          verificationStatus: 'VERIFIED',
          cityId: 'mumbai',
          cityName: 'Mumbai',
          mohallaName: 'Mazgaon',
          role: 'MEMBER',
          createdAt: new Date().toISOString(),
        };
    } else if (role === 'PENDING') {
      targetUser =
        dbStore.users.find((u) => u.verificationStatus === 'PENDING') || {
          id: `pending-${Date.now()}`,
          email: 'shabbir.pending@mumineen.org',
          phone: '+919876543210',
          fullName: 'Shabbir Rampurawala (Pending)',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
          itsNumber: '70291845',
          verificationStatus: 'PENDING',
          cityId: 'mumbai',
          cityName: 'Mumbai',
          mohallaName: 'Bhendi Bazaar',
          role: 'MEMBER',
          createdAt: new Date().toISOString(),
        };
    } else if (role === 'UNVERIFIED') {
      targetUser = {
        id: `guest-${Date.now()}`,
        email: 'guest@mumineen.org',
        phone: '+919800000000',
        fullName: 'Guest Visitor',
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        verificationStatus: 'UNVERIFIED',
        cityId: 'mumbai',
        cityName: 'Mumbai',
        mohallaName: 'Mazgaon',
        role: 'MEMBER',
        createdAt: new Date().toISOString(),
      };
    } else if (role === 'ADMIN') {
      targetUser = adminUser;
    }

    const { passwordHash, ...safeUser } = (targetUser as any);
    const token = createSessionToken(safeUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });

    response.cookies.set('alsouq_session', token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Demo login failed' },
      { status: 500 }
    );
  }
}
