import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Ученики логинятся по телефону, но Supabase Auth в этом проекте настроен
// без SMS-провайдера — используем синтетический email {phone}@students.local,
// как предложено в ТЗ. Сам номер телефона хранится в profiles.phone как есть.
function studentEmailFromPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return `${digits}@students.local`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    profile: null,
    initialized: false,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.session),
    role: (state) => state.profile?.role ?? null,
  },

  actions: {
    async init() {
      if (this.initialized) return
      if (!isSupabaseConfigured) {
        this.initialized = true
        return
      }

      const { data } = await supabase.auth.getSession()
      this.session = data.session
      if (this.session) await this.loadProfile()

      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.session = session
        if (session) {
          await this.loadProfile()
        } else {
          this.profile = null
        }
      })

      this.initialized = true
    },

    async loadProfile() {
      if (!this.session) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.session.user.id)
        .single()

      if (!error) this.profile = data
    },

    async signInTeacher(email, password) {
      this.loading = true
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) {
        this.session = data.session
        await this.loadProfile()
      }
      this.loading = false
      return { error }
    },

    async signInStudent(phone, password) {
      this.loading = true
      const email = studentEmailFromPhone(phone)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) {
        this.session = data.session
        await this.loadProfile()
      }
      this.loading = false
      return { error }
    },

    async signOut() {
      await supabase.auth.signOut()
      this.session = null
      this.profile = null
    },
  },
})
