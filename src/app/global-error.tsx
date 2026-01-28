'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isFirestoreIndexError = error.message.includes("The query requires an index");
  
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="max-w-md text-center p-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h1>
                
                {isFirestoreIndexError ? (
                    <div>
                        <p className="mb-4">
                            This is likely caused by a missing Firestore index. Your security rules are correct, but the database needs an index to perform the query efficiently.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Check the terminal where you ran `npm run dev` for a link to create the required index in the Firebase Console.
                        </p>
                    </div>
                ) : (
                    <p className="mb-6">
                       An unexpected error occurred. You can try to recover by clicking the button below.
                    </p>
                )}

                <Button onClick={() => reset()}>Try again</Button>
                <details className="mt-6 text-left text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
                </details>
            </div>
        </div>
      </body>
    </html>
  )
}
