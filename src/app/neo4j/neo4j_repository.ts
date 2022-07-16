import { Driver, Session } from 'neo4j-driver';

export default class Neo4jRepository {
  private neo4jDriver: Driver;

  constructor(neo4j: Driver) {
    this.neo4jDriver = neo4j;
  }

  public async runCommand(command: string, args: any = {}) {
    const session: Session = this.neo4jDriver.session();
    const result = await session.run(command, args);
    await session.close();
    return result;
  }
}
