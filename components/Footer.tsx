export default function Footer() {
  return (
    <footer className="bottom-0 w-full py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Jiehan. All rights reserved.</p>
      </div>
    </footer>
  );
}
