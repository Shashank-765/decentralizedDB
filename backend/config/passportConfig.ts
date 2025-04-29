import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User";
import { mnemonic } from "../config/config.json"
import { generateAccessToken } from "../Authorization/Auth";
import { ethers } from "ethers"
passport.authenticate('google')
passport.authenticate('facebook')

passport.use(new GoogleStrategy({
  clientID: "593949437835-0ab1dmu486v2iikanahk0rb6mtdnp8v9.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:4000/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;

  const userCount = await User.countDocuments();
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${userCount}`);

  let user = await User.findOne({ email });
  if (user) {
    const token = await generateAccessToken(user?.email);
    user.token = token;
    await user.save();
    return done(null, user);
  }
  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email,
      walletAddress: wallet.address,
      privateKey: wallet.privateKey,
      googleId: profile.id,
      password: "google-oauth"
    });

    const token = await generateAccessToken(user?.email);
    user.token = token;
    await user.save();
  }

  return done(null, user);
}));

passport.use(new FacebookStrategy(
    {
      clientID: "9284920664862055",
      clientSecret: "34e59b8acfe1609d604bc2dfdc12fbb7",
      callbackURL: "http://localhost:4000/api/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      const userCount = await User.countDocuments();
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${userCount}`);

      let user = await User.findOne({ email });
      if (user) {
        const token = await generateAccessToken(user?.email);
        user.token = token;
        await user.save();
        return done(null, user);
      }
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          walletAddress: wallet.address,
          privateKey: wallet.privateKey,
          googleId: profile.id,
          password: "google-oauth"
        });

        const token = await generateAccessToken(user?.email);
        user.token = token;
        await user.save();
      }

      return done(null, user);


    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
