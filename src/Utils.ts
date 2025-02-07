const isValidHex = (hex: string) => {
  return /^0x[a-fA-F0-9]*$/.test(hex);
};

const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const requireHexAddress = (name: string, address: string) => {
  if (!isValidEthereumAddress(address)) {
    throw new Error(`Invalid ${name} address: ${address}`);
  }
};

export { isValidHex, isValidEthereumAddress, requireHexAddress };
