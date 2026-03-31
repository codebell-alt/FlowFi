import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FlowFi</span>
          </div>
          <CardTitle className="text-2xl font-bold">Error de autenticación</CardTitle>
          <CardDescription className="text-base">
            Ha ocurrido un error durante el proceso de autenticación. 
            Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
