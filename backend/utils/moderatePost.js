import { moderateText } from './textModerator.js';
import { moderateImage } from './imageModerator.js';

/**
 * Combined Post Moderation Utility
 * Checks both text and image for NSFW content and applies penalties if flagged.
 */

/**
 * Moderates a post and updates user status if violations occur.
 * @param {{text: string, imageUrl: string | null}} post - The post content to check.
 * @param {object} user - The mongoose user document.
 * @returns {Promise<{approved: boolean, autoTaggedNSFW: boolean, reasons: string[]}>}
 */
export const moderatePost = async (post, user) => {
    let autoTaggedNSFW = false;
    const reasons = [];

    // 1. Moderate Text
    if (post.text) {
        const textResult = moderateText(post.text);
        if (textResult.isFlagged) {
            autoTaggedNSFW = true;
            reasons.push('Text contains restricted profanity');
        }
    }

    // 2. Moderate Image
    if (post.imageUrl) {
        const imageResult = await moderateImage(post.imageUrl);
        if (imageResult.isFlagged) {
            autoTaggedNSFW = true;
            const unsafeLabels = [];
            if (['LIKELY', 'VERY_LIKELY'].includes(imageResult.details.adult)) unsafeLabels.push('Adult content');
            if (['LIKELY', 'VERY_LIKELY'].includes(imageResult.details.violence)) unsafeLabels.push('Violence');
            if (['LIKELY', 'VERY_LIKELY'].includes(imageResult.details.racy)) unsafeLabels.push('Racy content');
            
            reasons.push(`Image flagged for: ${unsafeLabels.join(', ')}`);
        }
    }

    // 3. Handle Penalties
    if (autoTaggedNSFW) {
        user.strikes = (user.strikes || 0) + 1;
        user.autoFlaggedPosts = (user.autoFlaggedPosts || 0) + 1;
        user.lastFlaggedAt = new Date();

        if (user.strikes >= 5) {
            user.status = 'suspended';
        } else if (user.strikes >= 3) {
            user.status = 'under_review';
        }

        await user.save();
    }

    return {
        approved: !autoTaggedNSFW, // If flagged, technically approved to post but auto-tagged, but usually 'approved: false' means blocked. The prompt says "approved: boolean", we'll just set it to !autoTaggedNSFW or true since it posts anyway but blurred.
        autoTaggedNSFW,
        reasons
    };
};
