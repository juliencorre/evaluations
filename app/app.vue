<template>
  <div>
    <NuxtRouteAnnouncer />
    <div class="hello-world">
      <h1>Hello World</h1>
      <p>Bienvenue dans votre application Nuxt 3 !</p>
    </div>
  </div>
</template>

<style scoped>
.hello-world {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.hello-world h1 {
  font-size: 3rem;
  color: #00dc82;
  margin-bottom: 1rem;
}

.hello-world p {
  font-size: 1.2rem;
  color: #666;
}</style>
