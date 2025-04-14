import dotenv from 'dotenv';
import passport from 'passport';
import Strategy from 'passport-discord';
import {prisma} from "../src/server.mjs";
dotenv.config();


const clientID = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_CALLBACK_URL='http://localhost:8000/api/auth/discord/redirect'


if (!clientID || !clientSecret) {
  throw new Error("Missing Discord client ID or secret in environment variables");
}


export default passport.use(
    new Strategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
       callbackURL: DISCORD_CALLBACK_URL,
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Discord profile:", profile);
        console.log("Access token:", accessToken);
        try {
          let user = await prisma.user.findUnique({
            where: { discordId: profile.id },
          });
  
          if (!user) {
            user = await prisma.user.create({
              data: {
                discordId: profile.id,
                username: profile.username,
                email: profile.email,
                avatar: profile.avatar,
              },
            });
          }
  // SERIALIZE OBJECT TO SESSION DATA
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  });