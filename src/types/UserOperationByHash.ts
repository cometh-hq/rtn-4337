import { UserOperation } from "./UserOperation";

type UserOperationByHash = {
  userOperation: UserOperation;
  entryPoint: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
};

export default UserOperationByHash;
