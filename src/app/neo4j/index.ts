import neo4j from 'neo4j-driver';
import { exit } from 'process';
import Neo4jRepository from './neo4j_repository';

export default async () => {
  const auth = process.env.NEO4J_AUTH?.split('/');

  if (auth == undefined) {
    console.log("[ERROR] You must provide a 'NEO4J_AUTH' env var!");
    exit(1);
  }

  const driver = await neo4j.driver(
    'neo4j://neo4j',
    neo4j.auth.basic(auth[0], auth[1] || '')
  );
  return new Neo4jRepository(driver);
};
