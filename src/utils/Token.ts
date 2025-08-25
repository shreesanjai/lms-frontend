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