<template>
  <header class="app-header">
    <nav class="navbar" role="navigation" aria-label="Navigation principale">
      <div class="navbar-brand">
        <h1 class="brand-title">
          <span class="brand-icon">📊</span>
          Évaluations
        </h1>
      </div>
      
      <div class="navbar-menu">
        <div class="navbar-start">
          <a href="#" class="navbar-item active" aria-current="page">
            <span class="item-icon">📋</span>
            Tableaux d'évaluation
          </a>
          <a href="#" class="navbar-item">
            <span class="item-icon">👥</span>
            Élèves
          </a>
          <a href="#" class="navbar-item">
            <span class="item-icon">🎯</span>
            Compétences
          </a>
          <a href="#" class="navbar-item">
            <span class="item-icon">📈</span>
            Analyses
          </a>
        </div>
        
        <div class="navbar-end">
          <div class="navbar-item has-dropdown">
            <a href="#" class="navbar-link">
              <span class="item-icon">⚙️</span>
              Paramètres
            </a>
          </div>
          <div class="navbar-item">
            <a href="#" class="navbar-link user-profile">
              <span class="item-icon">👤</span>
              Enseignant
            </a>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu button -->
      <button 
        class="mobile-menu-button"
        type="button"
        aria-label="Ouvrir le menu"
        @click="toggleMobileMenu"
      >
        <span class="hamburger"></span>
        <span class="hamburger"></span>
        <span class="hamburger"></span>
      </button>
    </nav>
    
    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ 'is-active': isMobileMenuOpen }">
      <div class="mobile-menu-content">
        <a href="#" class="mobile-menu-item active">
          <span class="item-icon">📋</span>
          Tableaux d'évaluation
        </a>
        <a href="#" class="mobile-menu-item">
          <span class="item-icon">👥</span>
          Élèves
        </a>
        <a href="#" class="mobile-menu-item">
          <span class="item-icon">🎯</span>
          Compétences
        </a>
        <a href="#" class="mobile-menu-item">
          <span class="item-icon">📈</span>
          Analyses
        </a>
        <hr class="mobile-menu-divider">
        <a href="#" class="mobile-menu-item">
          <span class="item-icon">⚙️</span>
          Paramètres
        </a>
        <a href="#" class="mobile-menu-item">
          <span class="item-icon">👤</span>
          Profil
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 60px;
  max-width: 100%;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  font-size: 1.25rem;
}

.navbar-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin: 0 2rem;
}

.navbar-start {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #6c757d;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.9rem;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.navbar-item:hover {
  color: #2c3e50;
  background-color: #f8f9fa;
}

.navbar-item.active {
  color: #2563eb;
  background-color: #e3f2fd;
}

.navbar-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #6c757d;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.9rem;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.navbar-link:hover {
  color: #2c3e50;
  background-color: #f8f9fa;
}

.item-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.user-profile {
  border: 1px solid #e9ecef;
  padding: 0.375rem 0.75rem;
}

.user-profile:hover {
  border-color: #2563eb;
  color: #2563eb;
}

/* Mobile menu button */
.mobile-menu-button {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background: #2c3e50;
  margin: 2px 0;
  transition: 0.3s;
  border-radius: 1px;
}

/* Mobile menu */
.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu.is-active {
  display: block;
}

.mobile-menu-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: #6c757d;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.mobile-menu-item:hover {
  color: #2c3e50;
  background-color: #f8f9fa;
}

.mobile-menu-item.active {
  color: #2563eb;
  background-color: #e3f2fd;
}

.mobile-menu-divider {
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 0.5rem 0;
}

/* Responsive design */
@media (max-width: 992px) {
  .navbar-menu {
    margin: 0 1rem;
  }
  
  .navbar-start {
    gap: 0.25rem;
  }
  
  .navbar-end {
    gap: 0.25rem;
  }
  
  .navbar-item,
  .navbar-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 0.75rem;
  }
  
  .navbar-menu {
    display: none;
  }
  
  .mobile-menu-button {
    display: flex;
  }
  
  .brand-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 0.5rem;
    height: 56px;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .brand-icon {
    font-size: 1rem;
  }
  
  .mobile-menu-content {
    padding: 0.75rem;
  }
  
  .mobile-menu-item {
    padding: 0.625rem;
  }
}
</style>