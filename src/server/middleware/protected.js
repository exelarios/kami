async function protected(req, res, next) {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        if (token == process.env.REST_KEY) {
            next();
        } else {
            res.status(401).json({
                message: "Failed to verify token.",
                success: false
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Requires authorization token to access this route.",
            success: false
        });
    }
}

module.exports = protected;