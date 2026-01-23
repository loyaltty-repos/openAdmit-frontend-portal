import { getUser } from './auth';

export function canAccessDashboard() {
  const user = getUser();
  console.log(user)
  if (!user) return false;
  
  return user.isFeePaid && user.isVerified;
}

export function needsVerification() {
  const user = getUser();
  if (!user) return false;
  
  return user.isFeePaid && !user.isVerified;
}

export function needsPayment() {
  const user = getUser();
  if (!user) return false;
  
  return !user.isFeePaid;
}
