import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;

/**
 * Utility helper to fetch a system setting by key with a fallback default.
 * @param {string} key 
 * @param {*} defaultValue 
 * @returns {Promise<*>}
 */
export const getSetting = async (key, defaultValue) => {
    try {
        const doc = await SystemSetting.findOne({ key });
        return doc ? doc.value : defaultValue;
    } catch (error) {
        console.error(`Error fetching system setting ${key}:`, error);
        return defaultValue;
    }
};
