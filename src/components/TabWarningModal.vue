<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-box">
      <h3>Вы покинули вкладку/окно</h3>
      <p>Это действие зафиксировано.</p>
      <div class="modal-actions">
        <button class="btn-primary" @click="emit('close')">Понятно</button>
      </div>
    </div>
  </div>
</template>
