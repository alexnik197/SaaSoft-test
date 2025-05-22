import { defineStore } from 'pinia'
import type { Account, LabelItem, AccountsState } from '@/types'

const transformLabelsInputToArray = (labelsInput: string): LabelItem[] => {
  if (!labelsInput || labelsInput.trim() === '') {
    return []
  }
  return labelsInput.split(';')
    .map(label => ({ text: label.trim() }))
    .filter(item => item.text)
}


const transformLabelsArrayToString = (labels: LabelItem[]): string => {
  return labels.map(label => label.text).join('; ')
}

export const useAccountsStore = defineStore('accounts', {
  state: (): AccountsState => ({
    accounts: [],
    nextId: 1
  }),
  actions: {
    addAccount() {
      const newAccount: Account = {
        id: (this.nextId++).toString(),
        labelsInput: '',
        labels: [],
        accountType: 'Локальная',
        login: '',
        password: ''
      }
      this.accounts.push(newAccount)
    },
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(acc => acc.id !== id)
    },
    updateAccount(id: string, updatedFields: Partial<Omit<Account, 'id' | 'labelsInput'> & { labelsInput?: string }>) {
      const accountIndex = this.accounts.findIndex(acc => acc.id === id)
      if (accountIndex !== -1) {
        const currentAccount = this.accounts[accountIndex]
        let newLabels = currentAccount.labels
        let newLabelsInput = currentAccount.labelsInput

        if (updatedFields.labelsInput !== undefined) {
            newLabelsInput = updatedFields.labelsInput
            newLabels = transformLabelsInputToArray(updatedFields.labelsInput)
        }

        const updatedAccount: Account = {
          ...currentAccount,
          ...updatedFields,
          labels: newLabels,
          labelsInput: newLabelsInput
        }

        if (updatedAccount.accountType === 'LDAP') {
          updatedAccount.password = null
        } else if (updatedAccount.accountType === 'Локальная' && updatedAccount.password === null) {
          updatedAccount.password = ''
        }
        this.accounts[accountIndex] = updatedAccount
      }
    },
    hydrateLabelsInput() {
        this.accounts.forEach(acc => {
            if (acc.labels && !acc.labelsInput) {
                acc.labelsInput = transformLabelsArrayToString(acc.labels)
            }
        })
    }
  }
})