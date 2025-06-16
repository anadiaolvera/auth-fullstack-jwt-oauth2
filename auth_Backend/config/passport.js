const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      // Buscar usuario por email
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      let user;
      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
      } else {
        // Crear usuario nuevo
        const insertUser = await pool.query(
          'INSERT INTO users (email, name, provider) VALUES ($1, $2, $3) RETURNING *',
          [email, name, 'google']
        );
        user = insertUser.rows[0];
      }

      done(null, user);
    } catch (err) {
      console.error('Error en Google Strategy:', err);
      done(err, null);
    }
  }
));

// Necesario si usas sesiones (opcional)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
