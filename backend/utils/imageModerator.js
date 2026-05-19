import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Image Moderation Utility
 * Uses Google Cloud Vision API to detect unsafe content in images.
 */

/**
 * Moderates an image URL by checking for unsafe content.
 * @param {string} imageUrl - The public HTTPS URL of the image (Cloudinary).
 * @returns {Promise<{isFlagged: boolean, details: object, error: boolean}>} Object containing moderation results.
 */
export const moderateImage = async (imageUrl) => {
    if (!imageUrl) {
        return { isFlagged: false, details: {}, error: false };
    }

    try {
        const apiKey = process.env.GOOGLE_VISION_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_VISION_API_KEY is not defined in .env");
            return { isFlagged: false, details: {}, error: true };
        }

        const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
        
        const requestBody = {
            requests: [
                {
                    image: {
                        source: {
                            imageUri: imageUrl
                        }
                    },
                    features: [
                        {
                            type: 'SAFE_SEARCH_DETECTION'
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(endpoint, requestBody);
        
        const safeSearchAnnotation = response.data.responses[0]?.safeSearchAnnotation;
        
        if (!safeSearchAnnotation) {
            // No safe search data returned, assume safe
            return { isFlagged: false, details: {}, error: false };
        }

        const details = {
            adult: safeSearchAnnotation.adult,
            violence: safeSearchAnnotation.violence,
            racy: safeSearchAnnotation.racy,
            medical: safeSearchAnnotation.medical,
            spoof: safeSearchAnnotation.spoof
        };

        const unsafeLikelihoods = ['LIKELY', 'VERY_LIKELY'];
        const isFlagged = unsafeLikelihoods.includes(details.adult) || 
                          unsafeLikelihoods.includes(details.violence) || 
                          unsafeLikelihoods.includes(details.racy);

        return {
            isFlagged,
            details,
            error: false
        };

    } catch (error) {
        console.error("Error in moderateImage:", error.response?.data || error.message);
        // Fail-safe behavior: if API fails, don't block the post
        return {
            isFlagged: false,
            details: {},
            error: true
        };
    }
};
