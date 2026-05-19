import { Filter } from "bad-words";
import { moderateImage } from "./imageModerator.js";

const filter = new Filter();
// Add custom words if needed
filter.addWords("sex", "porn", "hentai", "slur", "fuck", "bitch", "shit", "asshole");

// Common NSFW and slur patterns regex
const inappropriatePattern = /(nsfw|porn|hentai|sex|fuck|bitch|shit|asshole|bastard|slur|admin|moderator|staff|fuck|cunt|nigger|faggot|whore|slut)/i;

/**
 * Checks a username for policy violations
 * @param {string} username 
 * @returns {object} { allowed: boolean, reason?: string }
 */
export const checkUsername = (username) => {
    if (!username) return { allowed: true };

    const cleanUsername = username.trim();
    
    // Check bad-words filter
    if (filter.isProfane(cleanUsername)) {
        return { allowed: false, reason: "Username contains inappropriate content" };
    }

    // Check custom patterns
    if (inappropriatePattern.test(cleanUsername)) {
        return { allowed: false, reason: "Username contains inappropriate content" };
    }

    return { allowed: true };
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
            Promise.resolve(checkUsername(username)).then((res) => {
                if (!res.allowed) {
                    violations.push({ field: "username", reason: res.reason });
                }
            })
        );
    }

    // 2. Profile Image Check
    if (profileImageUrl) {
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
    if (coverImageUrl) {
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
