import { moderateText } from './textModerator.js';
import { moderateImage } from './imageModerator.js';
import { getSetting } from '../models/SystemSetting.js';

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
        const textResult = await moderateText(post.text);
        if (textResult.isFlagged) {
            autoTaggedNSFW = true;
            reasons.push('Text contains restricted profanity');
        }
    }

    // 2. Moderate Image
    if (post.imageUrl) {
        const imageModerationEnabled = await getSetting("imageModerationEnabled", true);
        if (imageModerationEnabled) {
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
    }

    // 3. Handle Penalties
    if (autoTaggedNSFW) {
        const strikeLimitReview = await getSetting("strikeLimitReview", 3);
        const strikeLimitSuspend = await getSetting("strikeLimitSuspend", 5);

        user.strikes = (user.strikes || 0) + 1;
        user.autoFlaggedPosts = (user.autoFlaggedPosts || 0) + 1;
        user.lastFlaggedAt = new Date();

        if (user.strikes >= strikeLimitSuspend) {
            user.status = 'suspended';
        } else if (user.strikes >= strikeLimitReview) {
            user.status = 'under_review';
        }

        await user.save();
    }

    return {
        approved: !autoTaggedNSFW,
        autoTaggedNSFW,
        reasons
    };
};
