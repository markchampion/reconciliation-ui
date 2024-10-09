
export interface Transaction {
  id: string;
  profileName: string;
  transactionDate: string;
  amount: number;
  narrative: string;
  description: string;
  type: number;
  walletReference: string;
  isDuplicated: boolean;
}

export enum MatchingStatus {
  NON_PERFECT_MATCH,
  DUPLICATED,
  UNMATCHED
}

export interface MatchingResult {
  first: Transaction;
  second: Transaction;
  status: MatchingStatus;
  exceptionCodes: string[] ;
}


export interface MatchingSummary {
  totalAmounts: number[];
  totalMatchedAmount: number;
  totalRecords: number[];
  totalUnmatchedRecords: number[];
  totalMatchedRecords: number;
  nonPerfectMatchedRecords: MatchingResult[];
  unmatchedRecords: MatchingResult[];
  duplicatedRecords: MatchingResult[];
}