<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        Учетные записи
        <v-btn icon @click="addNewAccount" color="primary">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>

      <v-alert type="info" variant="tonal" class="ma-4" density="compact">
        <v-icon start>mdi-information-outline</v-icon>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
      </v-alert>

      <v-list lines="three">
        <div v-if="accountsStore.accounts.length === 0" class="text-center pa-4 text-grey">
          Нет учетных записей. Нажмите "+", чтобы добавить.
        </div>
        <v-form v-for="(account, index) in accountsStore.accounts" :key="account.id" :ref="el => forms[account.id] = el">
          <v-list-item class="pa-4">
            <v-row align="start" dense>
              <v-col cols="12" md="3">
                <v-label class="mb-1">Метка</v-label>
                <v-text-field
                  v-model="account.labelsInput"
                  @blur="validateAndSave(account, 'labelsInput', account.labelsInput)"
                  :rules="labelRules"
                  placeholder="Метка1; Метка2"
                  density="compact"
                  variant="outlined"
                  maxlength="50"
                  clearable
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="2">
                <v-label class="mb-1">Тип записи</v-label>
                <v-select
                  v-model="account.accountType"
                  :items="accountTypes"
                  @update:modelValue="(newValue) => validateAndSave(account, 'accountType', newValue)"
                  density="compact"
                  variant="outlined"
                ></v-select>
              </v-col>

              <v-col cols="12" md="3">
                <v-label class="mb-1">Логин <span class="text-red">*</span></v-label>
                <v-text-field
									autocomplete="username"
                  v-model="account.login"
                  @blur="validateAndSave(account, 'login', account.login)"
                  :rules="loginRules"
                  placeholder="Значение"
                  density="compact"
                  variant="outlined"
                  maxlength="100"
                  clearable
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="3" v-if="account.accountType === 'Локальная'">
                <v-label class="mb-1">Пароль <span class="text-red">*</span></v-label>
                <v-text-field
									autocomplete="current-password"
                  v-model="account.password"
                  @blur="validateAndSave(account, 'password', account.password)"
                  :rules="passwordRules(account)"
                  :type="showPassword[account.id] ? 'text' : 'password'"
                  placeholder="••••••••"
                  density="compact"
                  variant="outlined"
                  maxlength="100"
                  clearable
                  :append-inner-icon="showPassword[account.id] ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="togglePasswordVisibility(account.id)"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" v-else>
                </v-col>


              <v-col cols="12" md="1" class="d-flex align-center justify-end mt-5">
                <v-btn icon variant="text" color="grey" @click="deleteAccount(account.id)">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
          <v-divider v-if="index < accountsStore.accounts.length - 1"></v-divider>
        </v-form>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useAccountsStore } from '@/store/accounts'
import type { Account, AccountType } from '@/types'
import type { VForm } from 'vuetify/components'

const accountsStore = useAccountsStore()

const accountTypes: AccountType[] = ['Локальная', 'LDAP']
const showPassword = reactive<Record<string, boolean>>({})

const forms = ref<Record<string, VForm | null>>({})

const addNewAccount = () => {
  accountsStore.addAccount()
  const newAccount = accountsStore.accounts[accountsStore.accounts.length - 1]
  if (newAccount) {
    showPassword[newAccount.id] = false
  }
}

const deleteAccount = (id: string) => {
  accountsStore.removeAccount(id)
  delete showPassword[id]
  delete forms.value[id]
}

const togglePasswordVisibility = (id: string) => {
  showPassword[id] = !showPassword[id]
}

watch(
  () => accountsStore.accounts,
  (newAccounts) => {
    newAccounts.forEach(acc => {
      if (showPassword[acc.id] === undefined) {
        showPassword[acc.id] = false
      }
    })
  },
  { immediate: true, deep: true }
)

const labelRules = [
  (v: string | null) => (!v || v.length <= 50) || 'Максимум 50 символов',
]

const loginRules = [
  (v: string | null) => !!v || 'Логин обязателен.',
  (v: string | null) => (v && v.length <= 100) || 'Максимум 100 символов',
]

const passwordRules = (account: Account) => [
  (v: string | null) => account.accountType !== 'Локальная' || !!v || 'Пароль обязателен для локальной записи.',
  (v: string | null) => account.accountType !== 'Локальная' || (v && v.length <= 100) || 'Максимум 100 символов',
]


const validateAndSave = async (account: Account, field: keyof Account | 'labelsInput', value: any) => {
  const formRef = forms.value[account.id]
  if (formRef) {
    const validationResult = await formRef.validate()

    let isValidField = true

    if (field === 'labelsInput') {
      isValidField = labelRules.every(rule => rule(value) === true)
    } else if (field === 'login') {
      isValidField = loginRules.every(rule => rule(value) === true)
    } else if (field === 'password' && account.accountType === 'Локальная') {
      isValidField = passwordRules(account).every(rule => rule(value) === true)
    }

    if (isValidField) {
      if (field === 'labelsInput') {
        accountsStore.updateAccount(account.id, { labelsInput: value })
      } else {
        accountsStore.updateAccount(account.id, { [field]: value } as Partial<Account>)
      }
    }
  }
}

</script>

<style scoped>
.v-list-item {
  padding-top: 16px;
  padding-bottom: 8px;
}
.v-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.d-flex.align-center.justify-end {
    height: 40px;
    margin-top: 24px; 
}
</style>