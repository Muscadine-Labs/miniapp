/**
 * Application-wide constants
 */

// Chain configuration
export const BASE_CHAIN_ID = 8453 as const;
export const BASE_WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;
export const GENERAL_ADAPTER_ADDRESS = '0xb98c948CFA24072e58935BC004a8A7b376AE746A' as const;

// Transaction configuration
export const GAS_RESERVE_ETH = '0.0001'; // ETH to reserve for gas fees
export const MAX_WITHDRAW_QUEUE_ITEMS = 30; // Maximum items to fetch from withdraw queue

