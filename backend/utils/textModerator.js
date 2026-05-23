import { Filter } from 'bad-words';
import { getSetting } from '../models/SystemSetting.js';

/**
 * Text Moderation Utility
 * Uses the 'bad-words' package to filter profanity.
 */

/**
 * Moderates text by checking for profanity.
 * @param {string} text - The text to moderate.
 * @returns {Promise<{isFlagged: boolean, cleanText: string}>} Object containing moderation results.
 */
export const moderateText = async (text) => {
    if (!text) {
        return { isFlagged: false, cleanText: text };
    }

    try {
        const textModerationEnabled = await getSetting("textModerationEnabled", true);
        if (!textModerationEnabled) {
            return { isFlagged: false, cleanText: text };
        }

        const bannedWords = await getSetting("bannedWords", ["sex", "porn", "hentai", "slur", "fuck", "bitch", "shit", "asshole"]);
        
        const filter = new Filter();
        filter.removeWords('hell', 'damn', 'crap');
        
        if (bannedWords && bannedWords.length > 0) {
            // Filter out any empty words to prevent errors
            const validBannedWords = bannedWords.filter(w => w && w.trim());
            if (validBannedWords.length > 0) {
                filter.addWords(...validBannedWords);
            }
        }

        const isFlagged = filter.isProfane(text);
        const cleanText = isFlagged ? filter.clean(text) : text;
        
        return {
            isFlagged,
            cleanText
        };
    } catch (error) {
        console.error("Error in moderateText:", error);
        // Fail-safe: if filtering fails, return original text unflagged
        return { isFlagged: false, cleanText: text };
    }
};
