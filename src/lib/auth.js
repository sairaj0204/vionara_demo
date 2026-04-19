import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function getUserFromToken() {
  await connectDB();
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Fetch fresh user from DB
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch {
    return null;
  }
}

export async function verifyAdmin() {
  const user = await getUserFromToken();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
