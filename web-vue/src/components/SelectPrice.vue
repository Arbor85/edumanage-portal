<template>
  <div class="flex gap-2">
    <div class="relative flex-1">
      <input
        :value="Number.isFinite(modelValue.value) ? modelValue.value : ''"
        type="number"
        min="0"
        step="0.01"
        :placeholder="placeholder"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-14 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        @input="onAmountInput"
      />
      <span
        aria-hidden="true"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500"
      >
        {{ modelValue.currency }}
      </span>
    </div>

    <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
      <button
        v-for="(currency, index) in currencies"
        :key="currency"
        type="button"
        @click="onCurrencyClick(currency)"
        :class="[
          'px-3 py-2 text-xs font-medium',
          index > 0 ? 'border-l border-slate-300 dark:border-slate-600' : '',
          modelValue.currency === currency
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
        ]"
      >
        {{ currency }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export type PriceModel = {
  value: number
  currency: string
}

const props = withDefaults(
  defineProps<{
    modelValue: PriceModel
    placeholder?: string
    currencies?: string[]
  }>(),
  {
    placeholder: '0.00',
    currencies: () => ['PLN', 'USD', 'EUR'],
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: PriceModel): void
}>()

const onAmountInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value
  emit('update:modelValue', {
    ...props.modelValue,
    value: raw === '' ? Number.NaN : Number(raw),
  })
}

const onCurrencyClick = (currency: string) => {
  emit('update:modelValue', { ...props.modelValue, currency })
}
</script>
