import { JoinCondition } from "./JoinCondition";

export class Query {
  public depth?: number;
  public keyName?: string;
  public db?: string;
  public sqlLines?: string[];
  public value?: any[];
  public joinConditions?: JoinCondition[];
}
