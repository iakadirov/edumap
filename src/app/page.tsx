export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            EduMap.uz
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Единая образовательная платформа Узбекистана
          </p>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Помогаем родителям выбрать лучшее образование для детей через
            прозрачные данные, честные отзывы и AI-рекомендации.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/schools"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Найти школу
          </a>
          <a
            href="/schools"
            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Каталог школ
          </a>
        </div>
      </main>
    </div>
  );
}
