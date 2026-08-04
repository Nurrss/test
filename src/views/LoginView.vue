<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import AppCard from '../components/shared/AppCard.vue'
import AppInput from '../components/shared/AppInput.vue'
import AppButton from '../components/shared/AppButton.vue'
import DecorZone from '../components/shared/DecorZone.vue'

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
    <DecorZone zone="login-corner-tl" class="login-page__corner login-page__corner--tl" />
    <DecorZone zone="login-corner-tr" class="login-page__corner login-page__corner--tr" />

    <div class="login-header">
      <div class="login-header__logo">Ә</div>
      <h1 class="login-header__title">Ағылшын тілі</h1>
      <p class="login-header__subtitle">онлайн емтихан платформасы</p>
      <p class="login-header__description">
        Оқушылардың ағылшын тілі деңгейін Pre-A1 – A2 (CEFR) бойынша тексеру жүйесі
      </p>
    </div>

    <div class="login-hero">
      <DecorZone zone="login-yurt-photo" class="login-hero__photo" min-height="320px" />

      <AppCard class="login-card">
        <h2 class="login-card__title">
          {{ mode === 'teacher' ? 'Мұғалімдерге кіру' : 'Оқушыға кіру' }}
        </h2>

        <form class="login-card__form" @submit.prevent="handleSubmit">
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

          <button type="button" class="login-card__forgot">Құпия сөзді ұмыттыңыз ба?</button>

          <p v-if="errorMessage" class="login-card__error">{{ errorMessage }}</p>

          <AppButton type="submit" full-width :disabled="isSubmitting">
            {{ isSubmitting ? 'Кірістіру...' : 'Кіру' }}
          </AppButton>
        </form>

        <button
          v-if="mode === 'teacher'"
          type="button"
          class="login-card__switch"
          @click="switchMode('student')"
        >
          <i class="fa-solid fa-user-graduate"></i> Оқушы ретінде кіру
        </button>
        <button v-else type="button" class="login-card__switch" @click="switchMode('teacher')">
          <i class="fa-solid fa-chalkboard-user"></i> Мұғалім ретінде кіру
        </button>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
  padding: 3rem 2rem 6rem;
  overflow: hidden;
}

.login-page__corner {
  position: absolute;
  width: 200px;
  height: 200px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.login-page__corner--tl {
  top: -20px;
  left: -20px;
  border-radius: 0 0 999px 0;
}

.login-page__corner--tr {
  top: -20px;
  right: -20px;
  border-radius: 0 0 0 999px;
}

.login-header {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
}

.login-header__logo {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--color-primary-dark);
  border: 3px solid var(--color-accent-orange);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.login-header__title {
  color: var(--color-primary-dark);
}

.login-header__subtitle {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--color-primary-dark);
}

.login-header__description {
  max-width: 460px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-top: 0.4rem;
}

.login-hero {
  position: relative;
  z-index: 1;
  padding-bottom: 5rem;
}

.login-hero__photo {
  width: 100%;
}

.login-card {
  position: absolute;
  right: 2rem;
  bottom: 0;
  width: 380px;
  max-width: calc(100% - 2rem);
}

.login-card__title {
  margin-bottom: 1.25rem;
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-card__forgot {
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

.login-card__error {
  color: var(--color-accent-red);
  font-size: var(--fs-label);
  margin: 0;
}

.login-card__switch {
  width: 100%;
  background: none;
  border: none;
  border-top: 1px solid var(--color-border);
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.login-card__switch:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 1023px) {
  .login-hero {
    padding-bottom: 0;
  }

  .login-card {
    position: static;
    width: 100%;
    max-width: 100%;
    margin-top: 1.5rem;
  }
}

@media (max-width: 767px) {
  .login-page {
    padding: 2rem 1.25rem 3rem;
  }

  .login-page__corner {
    width: 120px;
    height: 120px;
  }
}
</style>
