const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor(database) {
    this.db = database;
    this.jwtSecret = 'tu_clave_secreta_muy_segura_aqui'; // En producción, usar variable de entorno
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      this.db.getUserByEmail(email, async (err, user) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        if (!user) {
          reject(new Error('Usuario no encontrado'));
          return;
        }

        try {
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            reject(new Error('Contraseña incorrecta'));
            return;
          }

          const token = jwt.sign(
            { 
              userId: user.id, 
              email: user.email, 
              role: user.role 
            },
            this.jwtSecret,
            { expiresIn: '24h' }
          );

          resolve({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            },
            token: token
          });

        } catch (bcryptError) {
          reject(new Error('Error al verificar contraseña'));
        }
      });
    });
  }

  async register(userData) {
    const { name, email, password, role = 'user', gender, avatar } = userData;

    return new Promise(async (resolve, reject) => {
      // Verificar si el email ya existe
      this.db.getUserByEmail(email, async (err, existingUser) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        if (existingUser) {
          reject(new Error('El email ya está registrado'));
          return;
        }

        try {
          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(password, 10);

          // Crear el usuario con todos los campos
          this.db.createUser({
            name,
            email,
            password: hashedPassword,
            role,
            gender,
            avatar
          }, (err, user) => {
            if (err) {
              reject(new Error('Error al crear usuario'));
              return;
            }

            // Generar token
            const token = jwt.sign(
              { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
              },
              this.jwtSecret,
              { expiresIn: '24h' }
            );

            resolve({
              user: user,
              token: token
            });
          });

        } catch (hashError) {
          reject(new Error('Error al procesar contraseña'));
        }
      });
    });
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }
}

module.exports = AuthService;
