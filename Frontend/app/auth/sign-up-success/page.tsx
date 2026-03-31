import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FlowFi</span>
          </div>
          <CardTitle className="text-2xl font-bold">¡Revisa tu correo!</CardTitle>
          <CardDescription className="text-base">
            Te hemos enviado un enlace de confirmación a tu correo electrónico. 
            Haz clic en el enlace para activar tu cuenta y comenzar a usar FlowFi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Si no ves el correo en tu bandeja de entrada, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Ir a iniciar sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
