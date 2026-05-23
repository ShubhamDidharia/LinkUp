import { Filter } from "bad-words";
import { moderateImage } from "./imageModerator.js";
import { getSetting } from "../models/SystemSetting.js";

/**
 * Checks a username for policy violations
 * @param {string} username 
 * @returns {Promise<object>} { allowed: boolean, reason?: string }
 */
export const checkUsername = async (username) => {
    if (!username) return { allowed: true };

    const cleanUsername = username.trim();
    
    try {
        const textModerationEnabled = await getSetting("textModerationEnabled", true);
        if (!textModerationEnabled) {
            return { allowed: true };
        }

        const bannedWords = await getSetting("bannedWords", ["sex", "porn", "hentai", "slur", "fuck", "bitch", "shit", "asshole"]);
        
        const filter = new Filter();
        if (bannedWords && bannedWords.length > 0) {
            const validWords = bannedWords.filter(w => w && w.trim());
            if (validWords.length > 0) {
                filter.addWords(...validWords);
            }
        }

        // Check bad-words filter
        if (filter.isProfane(cleanUsername)) {
            return { allowed: false, reason: "Username contains inappropriate content" };
        }

        // Create regex from banned words
        const defaultPattern = "nsfw|porn|hentai|sex|fuck|bitch|shit|asshole|bastard|slur|admin|moderator|staff|cunt|nigger|faggot|whore|slut";
        const patternStr = bannedWords && bannedWords.length > 0 
            ? bannedWords.filter(w => w && w.trim()).map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') || defaultPattern
            : defaultPattern;
        
        const inappropriatePattern = new RegExp(`(${patternStr})`, 'i');

        // Check custom patterns
        if (inappropriatePattern.test(cleanUsername)) {
            return { allowed: false, reason: "Username contains inappropriate content" };
        }

        return { allowed: true };
    } catch (error) {
        console.error("Error in checkUsername:", error);
        return { allowed: true };
    }
};

/**
 * Moderates profile details in parallel
 * @param {object} profile - { username, profileImageUrl, coverImageUrl }
 * @returns {Promise<{allowed: boolean, violations: Array}>}
 */
export const moderateProfile = async (profile, isAdmin = false) => {
    const { username, profileImageUrl, coverImageUrl } = profile;
    const violations = [];

    const checks = [];

    // 1. Username Check
    if (username && !isAdmin) {
        checks.push(
            checkUsername(username).then((res) => {
                if (!res.allowed) {
                    violations.push({ field: "username", reason: res.reason });
                }
            })
        );
    }

    const imageModerationEnabled = await getSetting("imageModerationEnabled", true);

    // 2. Profile Image Check
    if (profileImageUrl && imageModerationEnabled) {
        checks.push(
            moderateImage(profileImageUrl).then((res) => {
                if (res.isFlagged) {
                    violations.push({
                        field: "profileImage",
                        reason: "Profile image flagged as inappropriate"
                    });
                }
            })
        );
    }

    // 3. Cover Image Check
    if (coverImageUrl && imageModerationEnabled) {
        checks.push(
            moderateImage(coverImageUrl).then((res) => {
                if (res.isFlagged) {
                    violations.push({
                        field: "coverImage",
                        reason: "Cover image flagged as inappropriate"
                    });
                }
            })
        );
    }

    await Promise.all(checks);

    return {
        allowed: violations.length === 0,
        violations
    };
};
