<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import AppButton from '../components/shared/AppButton.vue'
import logoMark from '../assets/ornaments/logo-mark.png'
import loginBg from '../assets/photos/login-bg.webp'
import goldOrnament from '../assets/photos/qoshqar-muyiz-border.svg'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('teacher') // 'teacher' | 'student'
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (!isSupabaseConfigured) {
    errorMessage.value = 'Supabase қосылмаған (.env толтырылмаған).'
    return
  }

  isSubmitting.value = true
  const { error } =
    mode.value === 'teacher'
      ? await auth.signInTeacher(email.value, password.value)
      : await auth.signInStudent(phone.value, password.value)
  isSubmitting.value = false

  if (error) {
    errorMessage.value = 'Кіру мүмкін болмады: тексеріп, қайта көріңіз.'
    return
  }

  router.push('/')
}

function switchMode(next) {
  if (mode.value === next) return
  mode.value = next
  errorMessage.value = ''
}
</script>

<template>
  <div class="login-page" :style="{ backgroundImage: `url(${loginBg})` }">
    <div class="login-card">
      <div class="login-card__roles">
        <button
          type="button"
          :class="['login-card__role', { 'login-card__role--active': mode === 'teacher' }]"
          @click="switchMode('teacher')"
        >
          Мұғалім
        </button>
        <button
          type="button"
          :class="['login-card__role', { 'login-card__role--active': mode === 'student' }]"
          @click="switchMode('student')"
        >
          Оқушы
        </button>
      </div>

      <div class="login-card__brand">
        <div class="login-card__logo"><img :src="logoMark" alt="Логотип" /></div>
        <h1 class="login-card__title">Ағылшын тілі</h1>
        <p class="login-card__eyebrow">онлайн емтихан платформасы</p>
      </div>

      <h2 class="login-card__heading">Кіру</h2>
      <p class="login-card__subheading">Платформаға қош келдіңіз!</p>

      <form class="login-card__form" @submit.prevent="handleSubmit">
        <div class="login-field">
          <i class="fa-solid fa-envelope login-field__icon" v-if="mode === 'teacher'"></i>
          <i class="fa-solid fa-phone login-field__icon" v-else></i>
          <input
            v-if="mode === 'teacher'"
            v-model="email"
            type="email"
            class="login-field__input"
            placeholder="E-mail мекенжайы"
          />
          <input v-else v-model="phone" type="tel" class="login-field__input" placeholder="Телефон нөмірі" />
        </div>

        <div class="login-field">
          <i class="fa-solid fa-lock login-field__icon"></i>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="login-field__input"
            placeholder="Құпия сөз"
          />
          <button
            type="button"
            class="login-field__toggle"
            :aria-label="showPassword ? 'Құпия сөзді жасыру' : 'Құпия сөзді көрсету'"
            @click="showPassword = !showPassword"
          >
            <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
          </button>
        </div>

        <div class="login-card__row">
          <label class="login-card__remember">
            <input v-model="rememberMe" type="checkbox" />
            Мені есте сақтау
          </label>
          <button type="button" class="login-card__forgot">Құпия сөзді ұмыттыңыз ба?</button>
        </div>

        <p v-if="errorMessage" class="login-card__error">{{ errorMessage }}</p>

        <AppButton type="submit" full-width :disabled="isSubmitting">
          {{ isSubmitting ? 'Кірістіру...' : 'Кіру' }}
        </AppButton>
      </form>

      <img :src="goldOrnament" alt="" class="login-card__ornament" />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 3rem 6vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  max-width: 100%;
  background: rgb(255 255 255 / 97%);
  border-radius: var(--radius-card);
  box-shadow: 0 20px 60px rgb(15 30 28 / 25%);
  padding: 2.25rem 2.25rem 2.5rem;
  overflow: hidden;
  backdrop-filter: blur(2px);
}

.login-card__roles {
  display: flex;
  gap: 0.4rem;
  background: var(--color-input-bg);
  border-radius: 999px;
  padding: 0.3rem;
  margin-bottom: 1.5rem;
}

.login-card__role {
  flex: 1;
  border: none;
  background: none;
  border-radius: 999px;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.login-card__role--active {
  background: var(--color-primary-dark);
  color: #fff;
}

.login-card__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-card__logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 0.6rem;
  box-shadow: var(--shadow-card);
}

.login-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-card__title {
  color: var(--color-primary-dark);
  font-size: 21px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.login-card__eyebrow {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.04em;
  margin-top: 0.2rem;
  text-transform: uppercase;
}

.login-card__heading {
  text-align: center;
  color: var(--color-text);
  font-size: 26px;
}

.login-card__subheading {
  text-align: center;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.login-field {
  position: relative;
  display: flex;
  align-items: center;
}

.login-field__icon {
  position: absolute;
  left: 1rem;
  color: var(--color-text-secondary);
  font-size: 14px;
  pointer-events: none;
}

.login-field__input {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  background: var(--color-input-bg);
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  color: var(--color-text);
}

.login-field__input:focus {
  outline: none;
  border-color: var(--color-primary-dark);
}

.login-field__toggle {
  position: absolute;
  right: 0.9rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  display: flex;
  align-items: center;
}

.login-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.1rem 0 0.3rem;
}

.login-card__remember {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.login-card__forgot {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.login-card__forgot:hover {
  color: var(--color-primary-dark);
}

.login-card__error {
  color: var(--color-accent-red);
  font-size: var(--fs-label);
  margin: 0;
}

.login-card__ornament {
  position: absolute;
  left: 50%;
  bottom: -18px;
  transform: translateX(-50%);
  width: 130%;
  max-width: none;
  opacity: 0.22;
  pointer-events: none;
}

@media (max-width: 900px) {
  .login-page {
    justify-content: center;
    padding: 2rem 1.25rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.75rem 1.5rem 2rem;
  }
}
</style>
