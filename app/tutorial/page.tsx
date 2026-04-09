import { BookOpen } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TutorialPage() {
  return (
    <main className="bg-[#f4f4f4] px-4 py-10 sm:px-6 sm:py-14">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center gap-2 text-center">
          <CardTitle className="text-3xl font-semibold text-[#7a1c1c] sm:text-4xl">
            Gamecock Community Shop Tutorial
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
            Review these steps before your shift so check-in and service go smoothly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 sm:px-10 sm:pb-10">
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

          <Separator />

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-slate-900">
              <BookOpen className="size-5 text-[#7a1c1c]" />
              <p className="text-2xl font-semibold">Instructions</p>
            </div>

            <ol className="list-decimal space-y-3 pl-6 text-lg leading-8 text-slate-700">
              <li>Watch the tutorial video before your first shift or any time you need a refresher.</li>
              <li>When you arrive, return to the portal home page, search for your name, and clock in before you begin helping.</li>
              <li>Confirm your selection before tapping `Clock In` or `Clock Out`, especially when using a shared iPad.</li>
              <li>Clock out as soon as your shift ends so your volunteer hours are recorded accurately.</li>
              <li>If your name or status looks wrong, stop and ask a shop coordinator before continuing.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
