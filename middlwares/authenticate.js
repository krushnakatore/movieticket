export const authController = (req, res, next) => {
  try {
    const token = req.headers.token;
    // if token not provided
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Please provide token" });
    }

    const savedToken = process.env.TOKEN;
    //if provided token is not matching
    if (token !== savedToken) {
      return res
        .status(401)
        .send({ success: false, message: "Please provide valid token" });
    }

    next();
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
};
