import SettingsIcons from './settings-icons';
import Ciphers from './ciphers';

new Vue({
    el: '#app',

    mixins: [
        Ciphers,
        SettingsIcons,
    ],

    data: {
        plain: '',
        hashKey: '',
        focused: null,
        previouslyFocused: null,
        settings: {
            color: '#f1960c',
            colors: ['#a7a9be', '#e9e44b', '#f1960c', '#86db29', '#38d4ed', '#4f59df', '#db293a'],
            showColorPicker: false,
            realTimeEncoding: false,
        },
        sections: {
            ciphers: {
                visible: true,
            }
        },
        ciphers: [
            {
                title: 'AES',
                name: 'aes',
                content: '',
                enabled: false,
                key: { value: '' },
            },
            {
                title: 'ASCII',
                name: 'ascii',
                content: '',
                enabled: true,
            },
            {
                title: 'Base64',
                name: 'base64',
                content: '',
                enabled: true,
            },
            {
                title: 'Binary',
                name: 'binary',
                content: '',
                enabled: true,
            },
            {
                title: 'Caesar Shift',
                name: 'caesar',
                content: '',
                enabled: false,
                key: {
                    value: 1,
                    type: 'number',
                },
            },
            {
                title: 'DES',
                name: 'des',
                content: '',
                enabled: false,
                key: { value: '' },
            },
            {
                title: 'Triple DES',
                name: '3des',
                content: '',
                enabled: false,
                key: { value: '' },
            },
            {
                title: 'HEX',
                name: 'hex',
                content: '',
                enabled: false,
            },
            {
                title: 'HTML Entities',
                name: 'html',
                content: '',
                enabled: false,
            },
            {
                title: 'Morse Code',
                name: 'morse',
                content: '',
                enabled: false,
            },
            {
                title: 'Rabbit',
                name: 'rabbit',
                content: '',
                enabled: false,
                key: { value: '' },
            },
            {
                title: 'RC4',
                name: 'rc4',
                content: '',
                enabled: false,
                key: { value: '' },
            },
            {
                title: 'Rot13',
                name: 'rot13',
                content: '',
                enabled: false,
            },
            {
                title: 'URL',
                name: 'url',
                content: '',
                enabled: false,
            },
        ],
    },

    computed: {
        enabledCiphersCount () {
            return this.ciphers.filter(cipher => cipher.enabled).length;
        },

        hashes () {
            let hashes = [];

            for (let title in this.hashers) {
                hashes.push({ title, value: this.hashers[title](this.plain, this.hashKey) });
            }
            
            return hashes;
        },
    },

    methods: {
        decipher (cipher, value, isKey) {
            // If the previously focused textarea was plain and now the focused is a key value.
            if (isKey && this.previouslyFocused === 'plain') {
                cipher.content = this.encode[cipher.name].bind(this)(cipher);
            } else {
                this.plain = this.decode[cipher.name].bind(this)(value || cipher.content, cipher);
            }
        },

        watchCipherToggles () {
            this.ciphers.map(cipher => {
                this.$watch(() => cipher.enabled, enabled => {
                    if (enabled && this.plain) {
                        cipher.content = this.encode[cipher.name].bind(this)(cipher);
                    }

                    this.store(`cipher.${cipher.name}.enabled`, +enabled);
                });
            });
        },

        pickColor (color) {
            this.settings.color = color;
            this.settings.showColorPicker = false;
        },

        restoreCiphersToggleStates () {
            this.ciphers.map(cipher => {
                const state = this.retrieve(`cipher.${cipher.name}.enabled`);

                if (state !== null) {
                    cipher.enabled = +state;
                }
            });
        },

        restorePlainFromLocationHash () {
            if ((location.hash || '').length > 1) {
                this.plain = decodeURIComponent(location.hash.substr(1));
            }
        },

        store (key, value) {
            if (typeof localStorage === 'undefined') {
                return; // Nothing we can do.
            }

            localStorage.setItem('ME:' + key, value);
        },

        retrieve (key, def = null) {
            if (typeof localStorage === 'undefined') {
                return def; // Nothing we can do.
            }

            return localStorage.getItem('ME:' + key) || def;
        },

        handleFocus (cipher, e) {
            this.focused = cipher.name || cipher;

            if (e.target.tagName === 'TEXTAREA') {
                this.previouslyFocused = cipher.name || cipher;
            }
        },
    },

    watch: {
        plain (string) {
            this.ciphers.filter(cipher => cipher.enabled).map(cipher => {
                if (string) cipher.content = this.encode[cipher.name].bind(this)(cipher);
            });

            if ((string || '').length < 2e3) {
                location.hash = encodeURIComponent(string);
            } else {
                location.hash = '';
            }
        },

        'sections.ciphers.visible' (visible) {
            this.store('ciphersVisible', +visible);
        },

        'settings.color' (color) {
            this.store('color', color);
        },
    },

    created () {
        this.watchCipherToggles();
        this.restoreCiphersToggleStates();
        this.restorePlainFromLocationHash();
        this.settings.color = this.retrieve('color', this.settings.colors[2]);
        this.sections.ciphers.visible = +this.retrieve('ciphersVisible', true);
    },

    mounted () {
        this.$refs.plain.focus();
    },
});
