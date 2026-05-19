import { Filter } from 'bad-words';

/**
 * Text Moderation Utility
 * Uses the 'bad-words' package to filter profanity.
 */

const filter = new Filter();

// Remove common false positives
filter.removeWords('hell', 'damn', 'crap');

// Add any custom words if needed
// filter.addWords('custombadword');

/**
 * Moderates text by checking for profanity.
 * @param {string} text - The text to moderate.
 * @returns {{isFlagged: boolean, cleanText: string}} Object containing moderation results.
 */
export const moderateText = (text) => {
    if (!text) {
        return { isFlagged: false, cleanText: text };
    }

    try {
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
