
export default function TutorialPage() {

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <div className="w-full max-w-4xl bg-white rounded-2xl p-6">
                <h1 className="text-4xl text-[#73000a] font-bold mb-4 text-center">Gamecock CommUnity Shop Tutorial</h1>
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6">
                    <iframe className="absolute inset-0 h-full w-full" src="https://www.youtube.com/embed/yZFJH1IdQq4?si=TKKgRAOSrX6NmY53"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen></iframe>
                </div>

                <div>
                    <p className="text-center font-bold text-2xl mb-4">
                        Instructions
                    </p>

                    <ul className="list-decimal pl-6 text-lg">
                        <li>Bullet points with tutorial steps below the video so the user can follow along</li>
                        <li>In a horizontal tablet layout, the user may have to scroll to see these bullet points since we want the video to take up most of the screen. </li>
                        <li>The content of these instructions will be decided by the CommUnity Shop!</li>
                    </ul>
                </div>
            </div>
        </div>

    )
}