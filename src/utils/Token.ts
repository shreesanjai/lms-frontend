import CryptoJS from 'crypto-js'

const KEY = import.meta.env.VITE_TOKEN_KEY;


export const getEncryptedToken = (token: string) => {
    return CryptoJS.AES.encrypt(token, KEY).toString()
}

export const decryptToken = (text: string) => {
    const bytes = CryptoJS.AES.decrypt(text, KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

export const storeEncyptedToken = (token: string) => {
    const encryptedToken = getEncryptedToken(token);
    localStorage.setItem('auth_token', encryptedToken);
}

export const getDecryptedToken = () => {
    const data = localStorage.getItem('auth_token')

    if (!data) return null;

    try {
        return decryptToken(data)
    } catch (error) {
        console.error(error);
        localStorage.removeItem('auth_token')
        return null;

    }
}

export const cleanupExpiredToken = (): void => {
    const storedToken = getDecryptedToken();
    if (storedToken && isTokenExpired(storedToken)) {
        removeStoredToken();
    }
};

export const removeStoredToken = (): void => {
    localStorage.removeItem('auth_token');
};

export const isTokenExpired = (token: string): boolean => {
    try {

        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error parsing token:', error);
        return true;
    }
};

export const getUserDatafromToken = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return {
            id: payload.sub || payload.id,
            name: payload.name,
            username: payload.username,
            role: payload.role,
            department: payload.department
        }
    } catch (error) {
        console.error('Error extracting user from token:', error);
        return null;
    }
} 