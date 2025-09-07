<template>
  <NuxtLayout>
    <NuxtPage />
    <PwaInstallPrompt 
      @installed="onPwaInstalled"
      @dismissed="onPwaDismissed"
    />
  </NuxtLayout>
</template>

<script setup>
// PWA event handlers
const onPwaInstalled = () => {
  console.log('PWA has been installed successfully')
}

const onPwaDismissed = () => {
  console.log('PWA install prompt was dismissed')
}
</script>
