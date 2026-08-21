export type DeviceType = "mobile" | "desktop" | "tablet" | "bot" | "other";

export function detectDevice(userAgent: string): DeviceType {
    if(!userAgent || userAgent.trim() === ""){
        return "other";
    }
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) {
        return "mobile";
    } else if (/tablet|ipad|playbook|silk/.test(ua)) {
        return "tablet";
    } else if (/bot|crawler|spider|crawling/.test(ua)) {
        return "bot";
    } else if(/windows|macintosh|linux/.test(ua)) {
        return "desktop";
    }
    return "other";
}