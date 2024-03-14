import { getWelcome } from '../data-access/welcome.da';

export function getWelcomeMessage() {
    return getWelcome();
}
