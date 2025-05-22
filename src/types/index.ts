export interface LabelItem {
  text: string
}

export type AccountType = 'LDAP' | 'Локальная'

export interface Account {
  id: string,
  labelsInput: string,
  labels: LabelItem[],
  accountType: AccountType,
  login: string,
  password?: string | null
}

export interface AccountsState {
  accounts: Account[],
  nextId: number
}