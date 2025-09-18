import type { DurationType } from "./duration-type";
import type { LimitType } from "./limit-type";
import type { OperationType } from "./operation-type";
import type { OperationTypeGroup } from "./operation-type-group";
import type { Role } from "./role";

export type Limit = Readonly<{
  Description: string;
  DurationType: DurationType;
  Max: number;
  Min: number;
  OperationType: OperationType;
  OperationTypeGroup: null | OperationTypeGroup;
  Role: Role;
  Type: LimitType;
}>;
