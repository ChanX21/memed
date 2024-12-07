enum TokenStages {
    NOT_CREATED,
    BOUNDING_CURVE,
    GRADUATED,
  }
export interface TokenData {
    token: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
    owner: string;
    stage: TokenStages;
    collateral: bigint;
    supply: bigint;
    createdAt: number;
  }
  