/**
 * Helper Functions
 */
console.log("CRM Pro Syariah: Helpers module loaded");

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

export function formatWhatsAppNumber(phone) {
    if (!phone) return "";
    
    // Hapus karakter non-digit kecuali tanda plus
    let clean = phone.replace(/[^\d+]/g, '');
    
    let hasCountryCode = false;
    // Bersihkan awalan plus (+) atau double zero (00)
    if (clean.startsWith('+')) {
        clean = clean.substring(1);
        hasCountryCode = true;
    } else if (clean.startsWith('00')) {
        clean = clean.substring(2);
        hasCountryCode = true;
    }
    
    if (hasCountryCode) {
        return clean;
    }
    
    // Jika diawali 08 (HP Indonesia), ubah ke 628
    if (clean.startsWith('08')) {
        clean = '62' + clean.substring(1);
    }
    // Jika diawali 62, biarkan
    else if (clean.startsWith('62')) {
        // Biarkan
    }
    // Jika diawali 852 (Hong Kong) dengan panjang tepat 11 digit, biarkan
    else if (clean.startsWith('852') && clean.length === 11) {
        // Biarkan
    }
    // Jika diawali 8 (misal 812... yang hilang angka 0 didepannya), ubah ke 628
    else if (/^8[1-9]/.test(clean)) {
        clean = '62' + clean;
    }
    // Jika diawali 0 selain 08, hilangkan 0 nya
    else if (clean.startsWith('0')) {
        clean = clean.substring(1);
    }
    
    return clean;
}