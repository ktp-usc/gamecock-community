import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TutorialPage() {
  return (
    <main className="bg-[#f4f4f4] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center gap-2 px-6 pt-7 text-center sm:px-10 sm:pt-8">
          <CardTitle className="text-3xl font-semibold text-[#7a1c1c] sm:text-4xl">
            Gamecock Community Shop Tutorial
          </CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-center text-base leading-7 text-slate-600">
            Review these steps before your shift so check-in and service go smoothly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-7 pt-1 sm:px-10 sm:pb-8 sm:pt-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-[24px] border border-slate-200 bg-black shadow-sm">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/yZFJH1IdQq4?si=TKKgRAOSrX6NmY53"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
