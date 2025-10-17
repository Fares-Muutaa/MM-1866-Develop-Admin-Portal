import Image from "next/image"
import { LoginFormNextAuth } from "@/components/auth/login-form-nextauth"
import { RegisterForm } from "@/components/auth/register-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"

export default function LoginPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Image src="/images/muutaa-logo.png"
                 alt="MUUTAA.ML Logo"
                 width={180} height={48}
                 className="h-12 w-auto" />
          {/*<NextImage*/}
          {/*  src="/images/muutaa-logo.png"*/}
          {/*  alt="MUUTAA.ML Logo Text"*/}
          {/*  width={180} height={48}*/}
          {/*  className="h-12 w-auto"*/}
          {/*  />*/}
          <h1 className="text-2xl font-bold">Welcome to MUUTAA.ML</h1>
          <p className="text-center text-sm text-muted-foreground">Access or create your account to get started</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
          <Suspense>

            <LoginFormNextAuth />

          </Suspense>
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
