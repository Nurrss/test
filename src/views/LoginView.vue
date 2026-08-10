<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import AppInput from '../components/shared/AppInput.vue'
import AppButton from '../components/shared/AppButton.vue'
import logoMark from '../assets/ornaments/logo-mark.png'
import cornerOrnament from '../assets/photos/corner.svg'
import nomadHome from '../assets/photos/nomad-home.webp'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('teacher') // 'teacher' | 'student'
const email = ref('')
const phone = ref('')
const password = ref('')
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
  mode.value = next
  errorMessage.value = ''
}
</script>

<template>
  <div class="login-page">
    <img :src="cornerOrnament" alt="" class="login-page__corner login-page__corner--tl" />
    <img :src="cornerOrnament" alt="" class="login-page__corner login-page__corner--tr" />

    <div class="login-window">
      <div class="login-window__intro">
        <div class="login-window__logo"><img :src="logoMark" alt="Логотип" /></div>
        <h1 class="login-window__title">Ағылшын тілі</h1>
        <p class="login-window__subtitle">онлайн емтихан платформасы</p>
        <p class="login-window__description">
          Оқушылардың ағылшын тілі деңгейін Pre-A1 – A2 (CEFR) бойынша тексеру жүйесі
        </p>
        <div class="login-window__photo" :style="{ backgroundImage: `url(${nomadHome})` }"></div>
      </div>

      <div class="login-window__form-side">
        <h2 class="login-window__form-title">
          {{ mode === 'teacher' ? 'Мұғалімдерге кіру' : 'Оқушыға кіру' }}
        </h2>

        <form class="login-window__form" @submit.prevent="handleSubmit">
          <AppInput
            v-if="mode === 'teacher'"
            v-model="email"
            type="email"
            label="E-mail немесе логин"
            placeholder="example@mail.kz"
          />
          <AppInput
            v-else
            v-model="phone"
            type="tel"
            label="Телефон нөмірі"
            placeholder="+7 700 000 00 00"
          />

          <AppInput v-model="password" type="password" label="Құпия сөз" placeholder="••••••••" />

          <button type="button" class="login-window__forgot">Құпия сөзді ұмыттыңыз ба?</button>

          <p v-if="errorMessage" class="login-window__error">{{ errorMessage }}</p>

          <AppButton type="submit" full-width :disabled="isSubmitting">
            {{ isSubmitting ? 'Кірістіру...' : 'Кіру' }}
          </AppButton>
        </form>

        <button
          v-if="mode === 'teacher'"
          type="button"
          class="login-window__switch"
          @click="switchMode('student')"
        >
          <i class="fa-solid fa-user-graduate"></i> Оқушы ретінде кіру
        </button>
        <button v-else type="button" class="login-window__switch" @click="switchMode('teacher')">
          <i class="fa-solid fa-chalkboard-user"></i> Мұғалім ретінде кіру
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  overflow: hidden;
}

.login-page__corner {
  position: absolute;
  width: 260px;
  height: auto;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}

.login-page__corner--tl {
  top: -30px;
  left: -30px;
}

.login-page__corner--tr {
  top: -30px;
  right: -30px;
  transform: scaleX(-1);
}

.login-window {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 980px;
  min-height: 620px;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.6fr 1fr;
}

.login-window__intro {
  position: relative;
  background: var(--color-bg);
  padding: 3rem 2.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-window__logo {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: rgb(255 255 255 / 100%);
  border: 3px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  margin-bottom: 0.75rem;
  box-shadow: var(--shadow-card);
}

.login-window__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-window__title {
  color: var(--color-primary-dark);
  font-size: 32px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.login-window__subtitle {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-top: 0.35rem;
}

.login-window__description {
  max-width: 380px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-top: 0.75rem;
}

.login-window__photo {
  width: calc(100% + 5rem);
  margin: 1.75rem -2.5rem 0;
  flex: 1;
  min-height: 220px;
  background-size: cover;
  background-position: center;
}

.login-window__form-side {
  background: var(--color-card);
  padding: 3rem 2.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}

.login-window__form-title {
  color: var(--color-primary-dark);
}

.login-window__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-window__forgot {
  align-self: flex-end;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: -0.4rem;
}

.login-window__error {
  color: var(--color-accent-red);
  font-size: var(--fs-label);
  margin: 0;
}

.login-window__switch {
  width: 100%;
  background: none;
  border: none;
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.login-window__switch:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 900px) {
  .login-window {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .login-window__intro {
    padding: 2.5rem 1.75rem 0;
  }

  .login-window__photo {
    width: calc(100% + 3.5rem);
    margin: 1.5rem -1.75rem 0;
    min-height: 180px;
  }

  .login-window__form-side {
    padding: 2.5rem 1.75rem;
  }
}

@media (max-width: 640px) {
  .login-page__corner {
    width: 160px;
  }
}
</style>
