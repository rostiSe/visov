'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific group page
export async function revalidateGroup(groupId: string) {
  revalidatePath(`/group/${groupId}`)
  revalidateTag('groups')
  return { success: true }
}

// Revalidate groups list
export async function revalidateGroups() {
  revalidatePath('/')
  revalidateTag('groups')
  return { success: true }
}

// Revalidate user profile
export async function revalidateProfile() {
  revalidatePath('/')
  revalidateTag('profile')
  return { success: true }
}

// Revalidate all data
export async function revalidateAll() {
  revalidatePath('/', 'layout')
  revalidateTag('groups')
  revalidateTag('profile')
  return { success: true }
}