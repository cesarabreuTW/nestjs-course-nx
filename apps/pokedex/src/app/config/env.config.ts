export const LoadConfiguration = () => ({
  mongoDb: process.env.MONGODB || 'mongodb://localhost:27017/nest-pokedex',
  defaultLimit: process.env.DEFAULT_LIMIT || 5,
  port: process.env.PORT || 3000,
});
