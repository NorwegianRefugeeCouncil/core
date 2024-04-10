import * as WelcomeStore from '../data-access/welcome.store';

export const getWelcomeMessage = () => WelcomeStore.getWelcome();
