export function encrypt(text: any, key: string) {
    return [...text]
        .map((x, i) =>
            (x.codePointAt() ^ key.charCodeAt(i % key.length) % 255)
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}

/**
 * Decrypts the given text using the provided key.
 *
 * @param text - The text to be decrypted.
 * @param key - The key used for decryption.
 * @returns The decrypted text.
 */
export function decrypt(text: string, key: string) {
    return String.fromCharCode(
        ...text
            .match(/.{1,2}/g)!
            .map(
                (e: string, i: number) =>
                    parseInt(e, 16) ^ key.charCodeAt(i % key.length) % 255
            )
    );
}

export function cookieExists(cname: string) {
    return getCookie(cname) !== "";
}

export function getCookie(cname: string) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getHash(str: string, seed: number = 0) {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch: number; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function genRandomString() {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 64; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export enum MessageType {
    CHAT,
    INFO,
    JOIN,
    IMAGE,
}

export interface Member {
    name: string;
    color: string;
    uuid: string;
    pfp: string;
}

export enum InfoType {
    MEMBER_LIST,
    MEMBER_JOIN,
    MEMBER_LEAVE,
    UPDATE_MEMBER,
}

export interface Message {
    member: Member;
    message: string;
    message_type: MessageType;
    infoType?: InfoType;
    msg_id: string;
}

export function lsGet(key: string) {
    return localStorage.getItem(key);
}

export function lsSet(key: string, value: string) {
    localStorage.setItem(key, value);
}

export function isImgUrl(url: string) {
    return fetch(url, { method: "HEAD" }).then((res) => {
        return res.headers.get("Content-Type")!.startsWith("image");
    });
}

export function isUrl(str: string) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}
