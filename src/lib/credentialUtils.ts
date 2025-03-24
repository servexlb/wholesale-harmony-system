// Add uuid module
import { v4 as uuidv4 } from 'uuid';

export const generateRandomPassword = (): string => {
  const uuid = uuidv4();
  const password = uuid.substring(0, 12);
  return password;
};
