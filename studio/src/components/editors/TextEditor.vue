<script setup>
import { COLORS } from '../../model/defs.js'
defineProps({ c: Object, colors: Boolean })
</script>
<template>
  <div class="flex flex-col gap-3">
    <UInput :model-value="c.p1" size="sm" :placeholder="colors ? 'Farbname' : 'Text'" class="w-full" @update:model-value="v => c.p1 = v" />
    <div v-if="colors" class="swatches"><button v-for="(n, i) in COLORS" :key="n" :class="{ on: c.p1 === n }" :style="{ '--sw': `oklch(68% 0.12 ${(i * 47) % 360})` }" :title="n" @click="c.p1 = n"><span>{{ i + 1 }}</span></button></div>
    <p class="hint">{{ colors ? 'Namen wie in Cubase unter Projekt › Spurfarben („Color 1“ … oder eigene Namen).' : 'Groß- und Kleinschreibung spielt in Cubase keine Rolle.' }}</p>
  </div>
</template>
<style>
.swatches { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
.swatches button { height: 26px; border-radius: 4px; background: var(--sw); opacity: .8; font-family: var(--font-mono); font-size: 10px; color: oklch(15% 0.01 232); border: 2px solid transparent; }
.swatches button:hover { opacity: 1; }
.swatches button.on { opacity: 1; border-color: var(--ui-text-highlighted); }
</style>
