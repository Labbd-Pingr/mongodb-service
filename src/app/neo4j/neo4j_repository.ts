import { Driver, Session } from 'neo4j-driver';

export default class Neo4jRepository {
  private neo4jDriver: Driver;

  constructor(neo4j: Driver) {
    this.neo4jDriver = neo4j;
  }

  public runCommand(command: string, args: any = {}) {
    const session: Session = this.neo4jDriver.session();
    const result = session.run(command, args);
    session.close();
    return result;
  }

}