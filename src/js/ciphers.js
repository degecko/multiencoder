import he from 'he';
import CryptoJS from 'crypto-js';

function utf8_encode (string) {
    let text = '';

    string = string || '';
    string = string.replace(/\r\n/g, '\n');

    for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);

        if (c < 128) {
            text += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            text += String.fromCharCode((c >> 6) | 192);
            text += String.fromCharCode((c & 63) | 128);
        } else {
            text += String.fromCharCode((c >> 12) | 224);
            text += String.fromCharCode(((c >> 6) & 63) | 128);
            text += String.fromCharCode((c & 63) | 128);
        }
    }

    return text;
}

function utf8_decode (text) {
    let string = '', i = 0, c, c2, c3;

    text = text || '';

    while (i < text.length) {
        c = text.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c2 = text.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = text.charCodeAt(i + 1);
            c3 = text.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }

    return string;
}

function caesar (string, key) {
    let result = '';

    string = string || '';

    for (let i = 0, chr; i < string.length; i++) {
        chr = string.charCodeAt(i);

        if (chr >= 65 && chr <= 90) {
            result += String.fromCharCode((chr - 65 + key) % 26 + 65);
        } else if (chr >= 97 && chr <= 122) {
            result += String.fromCharCode((chr - 97 + key) % 26 + 97);
        } else {
            result += string.charAt(i);
        }
    }

    return result;
}

export default {
    data () {
        return {
            encode: {
                binary () {
                    let i, j, d, arr = [], len = this.plain.length;

                    for (i = 1; i <= len; i++) {
                        d = this.plain.charCodeAt(len - i);
                        arr.push(' ');

                        for (j = 0; j < 8; j++) {
                            arr.push(d % 2);
                            d = Math.floor(d / 2);
                        }
                    }

                    return arr.reverse().join('').trim();
                },

                hex () {
                    let str = '', i = 0, c;

                    for (; i < this.plain.length; i++) {
                        c = ('0' + this.plain.charCodeAt(i).toString(16)).substr(-2);
                        str += c + ' ';
                    }

                    return str.trim();
                },

                ascii () {
                    let s = '';

                    for (let i = 0; i < this.plain.length; i++)
                        s += this.plain[i].charCodeAt(0) + ' ';

                    return s.trim();
                },

                base64 () {
                    let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                        output = '', chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

                    let string = utf8_encode(this.plain);

                    while (i < string.length) {
                        chr1 = string.charCodeAt(i++);
                        chr2 = string.charCodeAt(i++);
                        chr3 = string.charCodeAt(i++);

                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;

                        if (isNaN(chr2)) enc3 = enc4 = 64;
                        else if (isNaN(chr3)) enc4 = 64;

                        output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
                    }

                    return output;
                },

                morse () {
                    let res = '', chr, mapping = {
                        a: '._',
                        b: '_...',
                        c: '_._.',
                        d: '_..',
                        e: '.',
                        f: '.._.',
                        g: '__.',
                        h: '....',
                        i: '..',
                        j: '.___',
                        k: '_._',
                        l: '._..',
                        m: '__',
                        n: '_.',
                        o: '___',
                        p: '.__.',
                        q: '__._',
                        r: '._.',
                        s: '...',
                        t: '_',
                        u: '.._',
                        v: '..._',
                        w: '.__',
                        x: '_.._',
                        y: '_.__',
                        z: '__..',
                        1: '.____',
                        2: '..___',
                        3: '...__',
                        4: '...._',
                        5: '.....',
                        6: '_....',
                        7: '__...',
                        8: '___..',
                        9: '____.',
                        0: '_____'
                    };

                    for (let i = 0; i < this.plain.length; i++) {
                        chr = this.plain[i].toLowerCase();
                        if (mapping[chr]) res += mapping[chr] + ' ';
                    }

                    return res.trim();
                },

                url () {
                    return encodeURIComponent(this.plain).replace(/'/g, '%27');
                },

                caesar (cipher) {
                    return caesar(this.plain, +cipher.key.value);
                },

                rot13 () {
                    return caesar(this.plain, 13);
                },

                html () {
                    return he.encode(this.plain, { useNamedReferences: true });
                },

                aes (cipher) {
                    return CryptoJS.AES.encrypt(this.plain, cipher.key.value).toString();
                },

                des (cipher) {
                    return CryptoJS.DES.encrypt(this.plain, cipher.key.value).toString();
                },

                '3des' (cipher) {
                    return CryptoJS.TripleDES.encrypt(this.plain, cipher.key.value).toString();
                },

                rabbit (cipher) {
                    return CryptoJS.Rabbit.encrypt(this.plain, cipher.key.value).toString();
                },

                rc4 (cipher) {
                    return CryptoJS.RC4.encrypt(this.plain, cipher.key.value).toString();
                },
            },

            decode: {
                binary (value) {
                    let res = '';
                    let string = value.replace(/[^01]/g, '');

                    if (! string) return;

                    string = string.match(/.{1,8}/g);

                    for (let i = 0; i < string.length; i++)
                        res += String.fromCharCode(parseInt(string[i], 2));

                    return res;
                },

                hex (string) {
                    string = string.toLowerCase().replace(/[^0-9abcdef]/g, '');
                    let str = '', i = 0, arr = string.match(/.{1,2}/g);

                    for (; i < (arr !== null ? arr.length : 0); i++) {
                        str += String.fromCharCode(parseInt(arr[i], 16));
                    }

                    return str;
                },

                ascii (string) {
                    let res = '';

                    string = string.replace(/[^\d\s]/g, ' ');
                    string = string.replace(/\s+/g, ' ');

                    let ascii = string.split(' ');

                    for (let i = 0; i < ascii.length; i++) {
                        res += String.fromCharCode(parseInt(ascii[i]));
                    }

                    return res;
                },

                base64 (string) {
                    let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                        output = '', chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

                    string = string.replace(/[^A-Za-z0-9\+\/\=]/g, '');

                    while (i < string.length) {
                        enc1 = keyStr.indexOf(string.charAt(i++));
                        enc2 = keyStr.indexOf(string.charAt(i++));
                        enc3 = keyStr.indexOf(string.charAt(i++));
                        enc4 = keyStr.indexOf(string.charAt(i++));

                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;

                        output = output + String.fromCharCode(chr1);

                        if (enc3 !== 64) output = output + String.fromCharCode(chr2);
                        if (enc4 !== 64) output = output + String.fromCharCode(chr3);
                    }

                    return utf8_decode(output);
                },

                morse (value) {
                    let res = '', chr, string = value.trim().split(' '), mapping = {
                        '._': 'a',
                        '_...': 'b',
                        '_._.': 'c',
                        '_..': 'd',
                        '.': 'e',
                        '.._.': 'f',
                        '__.': 'g',
                        '....': 'h',
                        '..': 'i',
                        '.___': 'j',
                        '_._': 'k',
                        '._..': 'l',
                        '__': 'm',
                        '_.': 'n',
                        '___': 'o',
                        '.__.': 'p',
                        '__._': 'q',
                        '._.': 'r',
                        '...': 's',
                        '_': 't',
                        '.._': 'u',
                        '..._': 'v',
                        '.__': 'w',
                        '_.._': 'x',
                        '_.__': 'y',
                        '__..': 'z',
                        '.____': '1',
                        '..___': '2',
                        '...__': '3',
                        '...._': '4',
                        '.....': '5',
                        '_....': '6',
                        '__...': '7',
                        '___..': '8',
                        '____.': '9',
                        '_____': '0'
                    };

                    for (let i = 0; i < string.length; i++) {
                        chr = string[i].toLowerCase();
                        if (mapping[chr]) res += mapping[chr];
                    }

                    return res;
                },

                url (string) {
                    try {
                        return decodeURIComponent(string);
                    } catch (e) {
                        return '';
                    }
                },

                caesar (value, cipher) {
                    return caesar(value, 26 - +cipher.key.value);
                },

                rot13 (value) {
                    return caesar(value, 13);
                },

                html (value) {
                    return he.decode(value);
                },

                aes (value, cipher) {
                    return this.decode.hex(CryptoJS.AES.decrypt(value, cipher.key.value).toString());
                },

                des (value, cipher) {
                    return this.decode.hex(CryptoJS.DES.decrypt(value, cipher.key.value).toString());
                },

                '3des' (value, cipher) {
                    return this.decode.hex(CryptoJS.TripleDES.decrypt(value, cipher.key.value).toString());
                },

                rabbit (value, cipher) {
                    return this.decode.hex(CryptoJS.Rabbit.decrypt(value, cipher.key.value).toString());
                },

                rc4 (value, cipher) {
                    return this.decode.hex(CryptoJS.RC4.decrypt(value, cipher.key.value).toString());
                },
            },

            hashers: {
                'MD5'           : CryptoJS.MD5,
                'SHA1'          : CryptoJS.SHA1,
                'SHA256'        : CryptoJS.SHA256,
                'SHA512'        : CryptoJS.SHA512,
                'SHA3'          : CryptoJS.SHA3,
                'RIPEMD160'     : CryptoJS.RIPEMD160,
                'MD5 (HMAC)'    : CryptoJS.HmacMD5,
                'SHA1 (HMAC)'   : CryptoJS.HmacSHA1,
                'SHA256 (HMAC)' : CryptoJS.HmacSHA256,
                'SHA512 (HMAC)' : CryptoJS.HmacSHA512,
            },
        };
    },
};
