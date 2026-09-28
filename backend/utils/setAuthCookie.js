const setAuthCookie = (res, token) => {
    res.cookie("accessToken", token, {
        httpOnly: true,

        // HTTPS-only in production
        secure: process.env.NODE_ENV === "production",

        // Good default when frontend/backend are same-site
        sameSite: "lax",

        maxAge: 60 * 60 * 1000,

        path: "/"
    });
};

module.exports = setAuthCookie;