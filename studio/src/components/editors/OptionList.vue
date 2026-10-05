<script setup>
defineProps({ items: Array, modelValue: [Number, String] })
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <div class="optlist" role="radiogroup">
    <button v-for="o in items" :key="o.v" role="radio" :aria-checked="modelValue === o.v" :class="{ on: modelValue === o.v }" @click="emit('update:modelValue', o.v)">
      <span class="radio" /><span class="flex-1">{{ o.label }}</span>
      <UTooltip v-if="o.unverified" text="Code noch nicht mit einer Cubase-15-Datei abgeglichen"><span class="unv-dot" /></UTooltip>
    </button>
  </div>
</template>
