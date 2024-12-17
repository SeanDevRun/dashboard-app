// utils/pathHelpers.js
const path = require('path');

const resolvePath = (alias) => {
    const aliases = {
        '@views': path.join(__dirname, '..', 'src', 'views'),
        '@assets': path.join(__dirname, '..', 'assets'),
        '@configs': path.join(__dirname, '..', 'configs'),
    };

    if (!aliases[alias]) {
        throw new Error(`Alias ${alias} not found.`);
    }

    return aliases[alias];
};

module.exports = { resolvePath };
