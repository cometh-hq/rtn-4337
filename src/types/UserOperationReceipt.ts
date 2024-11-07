type UserOperationReceipt = {
  userOpHash: string;
  sender: string;
  nonce: string;
  actualGasUsed: string;
  actualGasCost: string;
  success: string;
  paymaster: string;
  receipt: TransactionReceipt;
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
  status: string;
  from: string;
  to: string;
  logs: Log[];
  logsBloom: string;
  effectiveGasPrice: string;
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
