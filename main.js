import { initAnalytics } from './src/modules/AnalyticsController.js';
import { initUI } from './src/modules/UIController.js';
import { initScroll } from './src/modules/ScrollController.js';
import { initChat } from './src/modules/ChatController.js';
import { initAudio } from './src/modules/AudioController.js';

document.addEventListener('DOMContentLoaded', () => {
    const analytics = initAnalytics();

    initUI(analytics);
    initScroll();
    initChat(analytics);
    initAudio(analytics);
});
