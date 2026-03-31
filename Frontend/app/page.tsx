import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowFi</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Comenzar gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Control financiero{' '}
              <span className="text-primary">simplificado</span> para tu negocio
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              FlowFi te ayuda a registrar ingresos, gastos y visualizar el flujo de caja de tu negocio en tiempo real. Sin complicaciones, sin hojas de cálculo.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-4">
              Todo lo que necesitas para controlar tus finanzas
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Herramientas simples pero poderosas diseñadas específicamente para pequeños negocios
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 mb-4">
                    <ArrowUpCircle className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Registro de Ingresos</h3>
                  <p className="text-muted-foreground">
                    Registra tus ventas y otros ingresos con diferentes métodos de pago. Categoriza y organiza fácilmente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 mb-4">
                    <ArrowDownCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Control de Gastos</h3>
                  <p className="text-muted-foreground">
                    Clasifica tus gastos por categorías predefinidas o personalizadas. Nunca pierdas de vista tus egresos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Reportes Visuales</h3>
                  <p className="text-muted-foreground">
                    Gráficos intuitivos que te muestran el flujo de caja, distribución de gastos y tendencias financieras.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                    <Zap className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Rápido y Simple</h3>
                  <p className="text-muted-foreground">
                    Interfaz intuitiva que te permite registrar transacciones en segundos. Sin curva de aprendizaje.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10 mb-4">
                    <Shield className="h-6 w-6 text-chart-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Datos Seguros</h3>
                  <p className="text-muted-foreground">
                    Tu información financiera está protegida con los más altos estándares de seguridad.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Toma Mejores Decisiones</h3>
                  <p className="text-muted-foreground">
                    Entiende tu negocio con datos claros y toma decisiones financieras informadas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Comienza a controlar tus finanzas hoy
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Únete a miles de pequeños negocios que ya usan FlowFi para gestionar su dinero de forma inteligente.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FlowFi</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2026 FlowFi. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
