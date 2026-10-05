// src/services/authApi.js

import { apiFetch } from './apiClient'

async function authRequest(
  endpoint,
  payload
) {
  return apiFetch(
    `/api/auth/${endpoint}`,
    {
      method: 'POST',

      body:
        payload !== undefined
          ? JSON.stringify(payload)
          : undefined,
    },
    {
      skipProject: true,
    }
  )
}

export async function signupUser({
  name,
  email,
  password,
  company,
}) {
  const data =
    await authRequest(
      'signup',
      {
        name:
          name?.trim(),

        email:
          email
            ?.trim()
            ?.toLowerCase(),

        password,

        company:
          company?.trim() ||
          '',
      }
    )

  return (
    data?.user ||
    data
  )
}

export async function loginUser({
  email,
  password,
}) {
  const data =
    await authRequest(
      'login',
      {
        email:
          email
            ?.trim()
            ?.toLowerCase(),

        password,
      }
    )

  return (
    data?.user ||
    data
  )
}

export async function demoLogin() {
  const data =
    await authRequest(
      'demo-login'
    )

  return (
    data?.user ||
    data
  )
}

export function saveAuthUser(
  user
) {
  if (!user) return

  localStorage.setItem(
    'auth_user',
    JSON.stringify(user)
  )
}

export function getAuthUser() {
  try {
    const raw =
      localStorage.getItem(
        'auth_user'
      )

    return raw
      ? JSON.parse(raw)
      : null
  } catch {
    return null
  }
}

export function clearAuthUser() {
  localStorage.removeItem(
    'auth_user'
  )

  localStorage.removeItem(
    'vision_project_id'
  )
}

export function isAuthenticated() {
  return Boolean(getAuthUser())
}