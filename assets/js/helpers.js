/**
 * Helper Functions
 */
console.log("MCS Master: Helpers module loaded");

export function maskInfo(data, leadOwner, currentRole, type = 'phone') {
    const isAuthorized = currentRole === 'Developer' || 
                         currentRole === 'Super Admin' || 
                         leadOwner === 'Self';

    if (isAuthorized) return data;
    if (!data) return "Terproteksi";

    if (type === 'nik') {
        return `${data.slice(0, 6)}**********`;
    }
    return `${data.slice(0, 4)}****${data.slice(-4)}`;
}