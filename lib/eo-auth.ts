import { cookies } from 'next/headers';

export const EO_SESSION_COOKIE = 'eo_session';
export const RACEPACK_STAFF_COOKIE = 'racepack_staff_session';

export function getEoToken() {
  return cookies().get(EO_SESSION_COOKIE)?.value;
}

export function getRacepackStaffToken() {
  return cookies().get(RACEPACK_STAFF_COOKIE)?.value;
}

export const eoSessionCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 12,
};
