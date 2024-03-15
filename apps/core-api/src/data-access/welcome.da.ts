import { WelcomeModel } from '../models/welcome.model';

export function getWelcome() {
  return new WelcomeModel('Welcome to core-api!');
}
