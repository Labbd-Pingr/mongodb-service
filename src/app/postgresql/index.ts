import { Pool, PoolClient } from 'pg'

export interface ConnectFunction {
  (): Promise<PoolClient | undefined>;
}

export default (dbName = 'ep4'): ConnectFunction => {
  const pool: Pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD,
    host: "postgres",
    database: dbName
  });
  
  return async () => {
      try {
        return await pool.connect();
      } catch (error) {
        console.log((error as Error).message);
      }
  }
}