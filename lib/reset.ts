"use server"

import type * as z from "zod"

import { ResetSchema } from "./zodschema"
import { findUniqueUser, generatePasswordResetToken } from "./user"
import { sendPasswordResetEmail } from "./mail"

export { generatePasswordResetToken }

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Email non valid !" }
  }

  const { email } = validatedFields.data

  const existingUser = await findUniqueUser(email)
  if (!existingUser[0]) {
    return { error: "The email does not exist in our records." }
  }
  if (existingUser[0]?.deleted_at !== null) {
    return { error: "The email is associated with a deleted account." }
  }

  if (existingUser[0]) {
    const passwordResetToken = await generatePasswordResetToken(email)
    if (passwordResetToken[0].resetpasswordtoken) {
      const res = await sendPasswordResetEmail(email, passwordResetToken[0].resetpasswordtoken, "en")
      console.log("res", res)
    }

    return { success: "Password reset email sent successfully." }
  }
}
