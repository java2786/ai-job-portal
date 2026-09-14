const revokedTokens = new Map();

const revokeToken = (token, expiresAt) => {
    revokedTokens.set(token, expiresAt);
};

const isTokenRevoked = (token) => {
    const expiresAt = revokedTokens.get(token);

    if (!expiresAt) {
        return false;
    }

    if (expiresAt <= Math.floor(Date.now() / 1000)) {
        revokedTokens.delete(token);
        return false;
    }

    return true;
};

module.exports = { revokeToken, isTokenRevoked };