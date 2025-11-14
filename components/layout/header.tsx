export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">Aksjeportefølje</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Demo Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}
