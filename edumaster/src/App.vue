<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import "./index.css";

const greetMsg = ref("");
const name = ref("");

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke("greet", { name: name.value });
}
</script>

<template>
    <div class="text-amber-500">
      <h3 class="font-inter">
          Connexion
      </h3>
        <p class="font-manrope">
            <font-awesome-icon :icon="['fas', 'user']" />
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, omnis?
        </p>
    </div>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}

</style>