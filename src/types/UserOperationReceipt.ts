type UserOperationReceipt = {
  userOpHash: string;
  sender: string;
  nonce: string;
  actualGasUsed: string;
  actualGasCost: string;
  success: string;
  paymaster: string;
  receipt: TransactionReceipt;
  transactionIndex: string;
  logs: Log[];
};

type TransactionReceipt = {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string;
  root: string;
  status: string;
  from: string;
  to: string;
  logs: Log[];
};

type Log = {
  logIndex: string;
  transactionIndex: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  type: string;
  topics: string[];
};

export default UserOperationReceipt;
