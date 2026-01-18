<script lang="ts" setup>
import Image from '../components/ui/Image.vue';
import bgAuth from '../assets/images/bg-auth.png';
</script>
    
<template>
    <div class="flex flex-col md:flex-row w-full h-screen overflow-hidden">
        <!-- Form section -->
        <div class="flex-1 flex items-center justify-center p-8 md:p-16">
            <router-view class="w-full max-w-md" />
        </div>

        <!-- Image section -->
        <div class="flex-1 hidden md:flex items-center justify-center p-4 md:p-8">
            <Image :src="bgAuth" />
        </div>
    
    </div>
</template>
    