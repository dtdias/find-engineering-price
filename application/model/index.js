const config =  require('./config/config.json');
const { db } =  require('./models/index.js');

const env = process.env.NODE_ENV || 'development';
export const sequelize = new Sequelize(config[env]);