// Deliberately loose - the only real test of an address is whether mail arrives.
// Its own module so the client bundle doesn't pull in submissionEmails.ts.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
