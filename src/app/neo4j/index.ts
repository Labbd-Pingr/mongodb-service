import neo4j from 'neo4j-driver';
import Neo4jRepository from './neo4j_repository';

export default async () => {
  const driver = await neo4j.driver(
    'neo4j://neo4j',
    neo4j.auth.basic('neo4j', '123' || '')
  );
  return new Neo4jRepository(driver);
};
