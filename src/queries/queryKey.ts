const _chain = ['chain'];
const _extAPI = ['ext-api'];

export namespace QueryKey {
  export const tokenLists = () => [..._extAPI, 'token-lists'];
  export const tokens = () => [..._extAPI, 'tokens'];
  export const strategies = (user?: string) => [..._chain, 'strategies', user];
  export const approval = (user: string, token: string, spender: string) => [
    ..._chain,
    'approval',
    user,
    token,
    spender,
  ];

  export const balance = (user: string, token: string) => [
    ..._chain,
    'balance',
    user,
    token,
  ];
}
