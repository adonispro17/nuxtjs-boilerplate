import { requireUser } from '../../utils/auth';

export default defineEventHandler((event) => {
  const user = requireUser(event);
  return { user };
});
