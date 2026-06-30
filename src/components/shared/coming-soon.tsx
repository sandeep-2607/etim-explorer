import { Card, CardContent } from "@/components/ui/card";

/** Placeholder for sections scheduled in later build phases. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          This section is coming in a later phase.
        </CardContent>
      </Card>
    </div>
  );
}
